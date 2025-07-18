"use client"
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Edit, Trash2, Bold, Italic, Underline } from "lucide-react";
import { Modal } from "../ui/modal"; // Adjust the import path if necessary
import { toast } from "@/components/ui/use-toast"
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

    const [newsList, setNewsList] = useState<News[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const editContentRef = useRef<HTMLTextAreaElement>(null);
    const [editFormData, setEditFormData] = useState<{
        id: number | null;
        title: string;
        content: string;
        date: string;
        images: File[];
        category: string;
    }>({
        id: null,
        title: "",
        content: "",
        date: "",
        images: [],
        category: "",
    });

    const fetchNews = async () => {
        const { data, error } = await supabase.from("news").select("*");
        if (error) {
            toast({ title: "Error", description: "Failed to fetch news articles." })
        } else {
            setNewsList(data as News[]);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const openEditModal = (news: News) => {
        setEditFormData({
            id: news.id,
            title: news.title,
            content: news.content,
            date: news.date,
            images: [],
            category: news.category,
        });
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
    };

    // Formatting functions
    const insertFormatting = (tag: string, ref: React.RefObject<HTMLTextAreaElement | null>, isEdit: boolean = false) => {
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

        if (isEdit) {
            setEditFormData(prev => ({ ...prev, content: newText }));
        } else {
            setFormData(prev => ({ ...prev, content: newText }));
        }

        // Focus back to textarea and set cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = selectedText ? start + tag.length + 2 + selectedText.length + tag.length + 3 : start + tag.length + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formatBold = (isEdit: boolean = false) => insertFormatting('strong', isEdit ? editContentRef : contentRef, isEdit);
    const formatItalic = (isEdit: boolean = false) => insertFormatting('em', isEdit ? editContentRef : contentRef, isEdit);
    const formatUnderline = (isEdit: boolean = false) => insertFormatting('u', isEdit ? editContentRef : contentRef, isEdit);

    // Function to convert newlines to HTML breaks for preview
    const formatContentForPreview = (content: string) => {
        return content.replace(/\n/g, '<br>');
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check authentication first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast({ title: "Error", description: "Please login first to edit news." })
            return;
        }

        try {
            if (editFormData.images.length > 0) {
                const { data: oldNews } = await supabase
                    .from("news")
                    .select("images")
                    .eq("id", editFormData.id!)
                    .single();

                if (oldNews && oldNews.images) {
                    for (const imageUrl of oldNews.images) {
                        // Extract path from full URL for deletion in handleEditSubmit
                        const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
                        if (pathMatch) {
                            await supabase.storage.from("uploads").remove([pathMatch[1]]);
                        }
                    }
                }

                const uploadedImageUrls: string[] = [];
                for (const image of editFormData.images) {
                    const { data, error } = await supabase.storage
                        .from("uploads") // Use uploads bucket to match policy
                        .upload(`news-images/${Date.now()}-${image.name}`, image); // Upload to news-images folder

                    if (error) {
                        toast({ title: "Error", description: "Failed to upload images." })
                        return;
                    }

                    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`;
                    uploadedImageUrls.push(imageUrl);
                }

                await supabase
                    .from("news")
                    .update({
                        images: uploadedImageUrls,
                    })
                    .eq("id", editFormData.id!);
            }

            const { error } = await supabase
                .from("news")
                .update({
                    title: editFormData.title,
                    content: editFormData.content,
                    date: editFormData.date,
                    category: editFormData.category,
                })
                .eq("id", editFormData.id!);

            if (error) {
                toast({ title: "Error", description: "Failed to update news." })
                return;
            }

            toast({ title: "Success", description: "News updated successfully!" })
            setIsModalOpen(false);
            fetchNews();
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred." })
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this news?")) {
            // Check authentication first
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({ title: "Error", description: "Please login first to delete news." })
                return;
            }

            try {
                const { data: oldNews } = await supabase
                    .from("news")
                    .select("images")
                    .eq("id", id)
                    .single();

                if (oldNews && oldNews.images) {
                    for (const imageUrl of oldNews.images) {
                        // Extract path from full URL for deletion in handleDelete
                        const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
                        if (pathMatch) {
                            await supabase.storage.from("uploads").remove([pathMatch[1]]);
                        }
                    }
                }

                const { error } = await supabase.from("news").delete().eq("id", id);

                if (error) {
                    console.error("Delete error:", error.message);
                    toast({ title: "Error", description: "Failed to delete news." });
                    return;
                }

                toast({ title: "Success", description: "News deleted successfully!" });
                fetchNews();
            } catch (error) {
                console.error("Unexpected error:", error);
                toast({ title: "Error", description: "An unexpected error occurred." });
            }
        }
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
            fetchNews();
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
                                onClick={() => formatBold(false)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                title="Bold"
                            >
                                <Bold className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => formatItalic(false)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                title="Italic"
                            >
                                <Italic className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => formatUnderline(false)}
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
                <h2 className="text-lg font-medium text-gray-700 mb-4">News List</h2>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Title
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Category
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {newsList.map((news) => (
                                <tr key={news.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {news.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(news.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {news.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(news)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(news.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {
                isModalOpen && (
                    <Modal
                        onClose={closeEditModal}
                        onSave={() => handleEditSubmit(new Event('submit') as unknown as React.FormEvent)}
                        title="Edit News"
                    >
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, title: e.target.value })
                                    }
                                    className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                
                                {/* Formatting Buttons for Edit Modal */}
                                <div className="mb-2 flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => formatBold(true)}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        title="Bold"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatItalic(true)}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        title="Italic"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatUnderline(true)}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        title="Underline"
                                    >
                                        <Underline className="w-4 h-4" />
                                    </button>
                                </div>

                                <textarea
                                    ref={editContentRef}
                                    name="content"
                                    value={editFormData.content}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, content: e.target.value })
                                    }
                                    rows={5}
                                    placeholder="Enter your content here. Use the buttons above to format text or type HTML tags directly."
                                    className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                                />
                                
                                {/* Preview for Edit Modal */}
                                {editFormData.content && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                        <div 
                                            className="p-2 border border-gray-200 rounded bg-gray-50 text-sm"
                                            dangerouslySetInnerHTML={{ __html: formatContentForPreview(editFormData.content) }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={editFormData.date}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, date: e.target.value })
                                    }
                                    className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Upload Images</label>
                                <input
                                    type="file"
                                    name="images"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (files) {
                                            setEditFormData({
                                                ...editFormData,
                                                images: Array.from(files),
                                            });
                                        }
                                    }}
                                    multiple
                                    accept="image/*"
                                    className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={editFormData.category}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, category: e.target.value })
                                    }
                                    className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2"
                                />
                            </div>

                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Save Changes
                            </button>
                        </form>
                    </Modal>
                )
            }
        </>
    );
}
