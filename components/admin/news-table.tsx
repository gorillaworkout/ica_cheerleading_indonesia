"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/dateFormat";
import { createClient } from "@supabase/supabase-js";
import { Edit, Trash, Search, Eye, MoreVertical, Bold, Italic, Underline } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";

// Define the News type
interface News {
    id: number;
    title: string;
    content: string;
    date: string;
    images: string[];
    category: string;
    slug: string;
}

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewsTableProps {
    onRefresh?: () => void;
}

export function NewsTable({ onRefresh }: NewsTableProps) {
    const { toast } = useToast();
    const [newsList, setNewsList] = useState<News[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from("news").select("*").order('date', { ascending: false });
        if (error) {
            toast({ 
                title: "Error", 
                description: "Failed to fetch news articles.",
                variant: "destructive"
            });
        } else {
            setNewsList(data as News[]);
        }
        setIsLoading(false);
    };

    // Filter news based on search term
    const filteredNews = newsList.filter((news) =>
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            newText = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
        } else {
            newText = `${beforeText}<${tag}></${tag}>${afterText}`;
        }

        setEditFormData(prev => ({ ...prev, content: newText }));

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = selectedText ? start + tag.length + 2 + selectedText.length + tag.length + 3 : start + tag.length + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formatBold = () => insertFormatting('strong', editContentRef);
    const formatItalic = () => insertFormatting('em', editContentRef);
    const formatUnderline = () => insertFormatting('u', editContentRef);

    // Function to convert newlines to HTML breaks for preview
    const formatContentForPreview = (content: string) => {
        return content.replace(/\n/g, '<br>');
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check authentication first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast({ 
                title: "Error", 
                description: "Please login first to edit news.",
                variant: "destructive"
            });
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
                        const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
                        if (pathMatch) {
                            await supabase.storage.from("uploads").remove([pathMatch[1]]);
                        }
                    }
                }

                const uploadedImageUrls: string[] = [];
                for (const image of editFormData.images) {
                    const { data, error } = await supabase.storage
                        .from("uploads")
                        .upload(`news-images/${Date.now()}-${image.name}`, image);

                    if (error) {
                        toast({ 
                            title: "Error", 
                            description: "Failed to upload images.",
                            variant: "destructive"
                        });
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
                toast({ 
                    title: "Error", 
                    description: "Failed to update news.",
                    variant: "destructive"
                });
                return;
            }

            toast({ title: "Success", description: "News updated successfully!" });
            setIsModalOpen(false);
            fetchNews();
            if (onRefresh) onRefresh();
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "An unexpected error occurred.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this news?")) {
            // Check authentication first
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({ 
                    title: "Error", 
                    description: "Please login first to delete news.",
                    variant: "destructive"
                });
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
                        const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
                        if (pathMatch) {
                            await supabase.storage.from("uploads").remove([pathMatch[1]]);
                        }
                    }
                }

                const { error } = await supabase.from("news").delete().eq("id", id);

                if (error) {
                    toast({ 
                        title: "Error", 
                        description: "Failed to delete news.",
                        variant: "destructive"
                    });
                    return;
                }

                toast({ title: "Success", description: "News deleted successfully!" });
                fetchNews();
                if (onRefresh) onRefresh();
            } catch (error) {
                toast({ 
                    title: "Error", 
                    description: "An unexpected error occurred.",
                    variant: "destructive"
                });
            }
        }
    };

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    };

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Header and Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
                        <p className="text-gray-600 mt-1">Manage all news articles</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Standard Table Section */}
                {isLoading ? (
                    <FullScreenLoader />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg bg-white">
                            <thead className="bg-gray-100 text-xs uppercase">
                                <tr>
                                    <th className="p-2 border">No</th>
                                    <th className="p-2 border">Title</th>
                                    <th className="p-2 border">Content Preview</th>
                                    <th className="p-2 border">Category</th>
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border">Images</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNews.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            {searchTerm ? "No news found matching your search." : "No news articles found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredNews.map((news, index) => (
                                        <tr key={news.id} className="text-center hover:bg-gray-50">
                                            <td className="p-2 border">{index + 1}</td>
                                            <td className="p-2 border font-medium text-left">
                                                <div className="font-semibold max-w-xs truncate">
                                                    {news.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {news.id}
                                                </div>
                                            </td>
                                            <td className="p-2 border text-left">
                                                <div className="max-w-sm text-xs text-gray-600">
                                                    {truncateContent(news.content.replace(/<[^>]*>/g, ''))}
                                                </div>
                                            </td>
                                            <td className="p-2 border">
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                                    {news.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-2 border">
                                                {formatDate(news.date)}
                                            </td>
                                            <td className="p-2 border">
                                                <span className="text-xs text-gray-500">
                                                    {news.images?.length || 0} image{(news.images?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="p-2 border">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(news)}
                                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(news.id)}
                                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <Modal
                    onClose={closeEditModal}
                    onSave={() => handleEditSubmit(new Event('submit') as unknown as React.FormEvent)}
                    title="Edit News"
                >
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="lg:col-span-2">
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

                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                
                                {/* Formatting Buttons for Edit Modal */}
                                <div className="mb-2 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={formatBold}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        title="Bold"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={formatItalic}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        title="Italic"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={formatUnderline}
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
                                    rows={8}
                                    placeholder="Enter your content here. Use the buttons above to format text or type HTML tags directly."
                                    className="mt-1 block w-full border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm px-3 py-2 resize-y min-h-[200px]"
                                />
                                
                                {/* Preview for Edit Modal */}
                                {editFormData.content && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                        <div 
                                            className="p-3 border border-gray-200 rounded bg-gray-50 text-sm max-h-32 overflow-y-auto"
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

                            <div className="lg:col-span-2">
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
                                <p className="mt-1 text-xs text-gray-500">Select new images to replace existing ones (optional)</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
