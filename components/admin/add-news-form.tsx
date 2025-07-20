"use client"
import { formatDate } from "@/utils/dateFormat";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Edit, Trash2, Bold, Italic, Underline } from "lucide-react";
import { Modal } from "../ui/modal"; // Adjust the import path if necessary
import { toast } from "@/components/ui/use-toast";
import { NewsTable } from "./news-table";
// Define the News type
interface News {
    id: number;
    title: string;
    content: string;
    date: string;
    images: string[];
    category: string;
}

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AddNewsForm() {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        date: "",
        images: [] as File[],
        category: "",
        slug: "",
    });

    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [newsTableKey, setNewsTableKey] = useState(0); // For refreshing NewsTable

    const fetchNews = async () => {
        // This will be handled by NewsTable component
        setNewsTableKey(prev => prev + 1); // Trigger NewsTable refresh
    };

    useEffect(() => {
        // No need to fetch news here as it's handled by NewsTable
    }, []);

    // Formatting functions
    const insertFormatting = (tag: string, ref: React.RefObject<HTMLTextAreaElement | null>) => {
        const textarea = ref.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);

        let newText;
        if (selectedText) {
            // If text is selected, wrap it with the tag
            newText = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
        } else {
            // If no text is selected, insert opening and closing tags
            newText = `${beforeText}<${tag}></${tag}>${afterText}`;
        }

        setFormData(prev => ({ ...prev, content: newText }));

        // Focus back to textarea and set cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = selectedText ? start + tag.length + 2 + selectedText.length + tag.length + 3 : start + tag.length + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formatBold = () => insertFormatting('strong', contentRef);
    const formatItalic = () => insertFormatting('em', contentRef);
    const formatUnderline = () => insertFormatting('u', contentRef);

    // Function to convert newlines to HTML breaks for preview
    const formatContentForPreview = (content: string) => {
        return content.replace(/\n/g, '<br>');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const updatedData = { ...prevData, [name]: value };
            if (name === "title") {
                updatedData.slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            }
            return updatedData;
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            if (fileArray.length > 3) {
                toast({ title: "Error", description: "You can only upload a maximum of 3 images." });
                return;
            }
            setFormData((prevData) => ({
                ...prevData,
                images: fileArray,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check authentication first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast({ title: "Error", description: "Please login first to add news." });
            return;
        }

        const uploadedImagePaths: string[] = []; // Declare variable outside try block

        try {
            // Upload images to Supabase storage
            const uploadedImageUrls: string[] = [];

            for (const image of formData.images) {
                const { data, error } = await supabase.storage
                    .from("uploads") // Use uploads bucket to match policy
                    .upload(`news-images/${Date.now()}-${image.name}`, image); // Upload to news-images folder

                if (error) {
                    console.error("Image upload error:", error.message);
                    toast({ title: "Error", description: "Failed to upload images." });
                    return;
                }

                const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`;
                uploadedImageUrls.push(imageUrl);
                uploadedImagePaths.push(data.path);
            }

            // Insert news data into Supabase
            const { error } = await supabase.from("news").insert({
                title: formData.title,
                content: formData.content,
                date: formData.date,
                images: uploadedImageUrls,
                category: formData.category,
                slug: formData.slug,
            });

            if (error) {
                console.error("Insert error:", error.message);

                // Delete uploaded images if news creation fails
                for (const path of uploadedImagePaths) {
                    const { error: deleteError } = await supabase.storage.from("uploads").remove([path]);
                    if (deleteError) {
                        console.error("Failed to delete image:", deleteError.message);
                    }
                }

                toast({ title: "Error", description: "Failed to save news." });
                return;
            }

            toast({ title: "Success", description: "News added successfully!" });
            setFormData({
                title: "",
                content: "",
                date: "",
                images: [],
                category: "",
                slug: "",
            });
            setNewsTableKey(prev => prev + 1); // Refresh NewsTable
        } catch (error) {
            console.error("Unexpected error:", error);

            // Delete uploaded images in case of unexpected error
            for (const path of uploadedImagePaths) {
                const { error: deleteError } = await supabase.storage.from("uploads").remove([path]);
                if (deleteError) {
                    console.error("Failed to delete image:", deleteError.message);
                }
            }

            toast({ title: "Error", description: "An unexpected error occurred." });
        }
    };

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content</label>
                        
                        {/* Formatting Buttons */}
                        <div className="mb-2 flex space-x-2">
                            <button
                                type="button"
                                onClick={() => formatBold()}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                title="Bold"
                            >
                                <Bold className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => formatItalic()}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                title="Italic"
                            >
                                <Italic className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => formatUnderline()}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                title="Underline"
                            >
                                <Underline className="w-4 h-4" />
                            </button>
                        </div>

                        <textarea
                            ref={contentRef}
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Enter your content here. Use the buttons above to format text or type HTML tags directly."
                            className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                        />
                        
                        {/* Preview */}
                        {formData.content && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                <div 
                                    className="p-2 border border-gray-200 rounded bg-gray-50 text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatContentForPreview(formData.content) }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Images (Max 3)</label>
                        <input
                            type="file"
                            name="images"
                            onChange={handleImageChange}
                            multiple
                            accept="image/*"
                            className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                        />
                        <div className="mt-2">
                            {formData.images.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500">Selected Images:</p>
                                    <ul className="list-disc pl-5">
                                        {formData.images.map((image, index) => (
                                            <li key={index} className="text-sm text-gray-700">
                                                {image.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Add News
                    </button>
                </form>
            </div>

            <div className="mt-8">
                <NewsTable key={newsTableKey} onRefresh={() => setNewsTableKey(prev => prev + 1)} />
            </div>
        </>
    );
}
