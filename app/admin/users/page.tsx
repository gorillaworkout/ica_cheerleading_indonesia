"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Loader2, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Profile } from "@/types/profiles/profiles"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl"

const PAGE_SIZE = 10

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(false)
    const [approving, setApproving] = useState<string | null>(null)

    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "verified" | "not_verified">("all")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null)

    async function fetchUsers() {
        setLoading(true)

        let query = supabase
            .from("profiles")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })

        if (filter === "verified") {
            query = query.eq("is_verified", true)
        } else if (filter === "not_verified") {
            query = query.eq("is_verified", false)
        }

        if (search.trim() !== "") {
            query = query.ilike("display_name", `%${search.trim()}%`)
        }

        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        query = query.range(from, to)
        const { data, error, count } = await query
        console.log("Query Data user:", data)

        if (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to fetch users." })
        } else {
            setUsers(data || [])
            setTotalPages(Math.max(1, Math.ceil((count || 1) / PAGE_SIZE)))
        }

        setLoading(false)
    }

 async function approveUser(userId: string) {
    console.log("Approving user:", userId)
    setApproving(userId)

    console.log("Approving user:", userId, typeof userId);

    const { data, error } = await supabase
    .from("profiles")
    .update({ is_verified: true })
    .filter("user_id", "eq", userId) // alternative to eq()
    .select();

    console.log("User ID Filter:", userId);
    console.log("Update result:", { data, error });

    console.log("Target UserId (should match user_id column exactly):", userId);

    const { data: foundUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId);

    console.log("Found Users:", foundUsers);

    if (error) {
        console.error("Supabase error:", error)
        toast({ title: "Error", description: error.message })
    } else {
        toast({ title: "Success", description: "User approved successfully." })
        fetchUsers()
    }

    setApproving(null)
}


    async function approveEditRequest(userId: string) {
        setApproving(userId)
        const { error } = await supabase
            .from("profiles")
            .update({ is_edit_allowed: true, is_request_edit: false })
            .eq("user_id", userId)

        if (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to approve edit request." })
        } else {
            toast({ title: "Success", description: "Edit request approved." })
            fetchUsers()
        }

        setApproving(null)
    }

    useEffect(() => {
        fetchUsers()
    }, [filter, search, page])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User Verification (KTP Check)</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    className="max-w-xs"
                />

                <Select
                    value={filter}
                    onValueChange={(v) => {
                        setFilter(v as typeof filter)
                        setPage(1)
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="not_verified">Not Verified</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin w-6 h-6" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border rounded-lg bg-white">
                        <thead className="bg-gray-100 text-xs uppercase">
                            <tr>
                                <th className="p-2 border">KTP</th>
                                <th className="p-2 border">Nama</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Role</th>
                                <th className="p-2 border">Gender</th>
                                <th className="p-2 border">Birth Date</th>
                                <th className="p-2 border">Verified</th>
                                <th className="p-2 border">Member Code</th>
                                <th className="p-2 border">Province</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="text-center">
                                    <td className="p-2 border">
                                        {user.id_photo_url ? (
                                            <img
                                                src={getPublicImageUrl(user.id_photo_url)}
                                                alt="KTP"
                                                onClick={() => setZoomImageUrl(user.id_photo_url!)}
                                                className="h-20 w-auto mx-auto object-contain border rounded cursor-pointer hover:scale-105 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-400 italic">No Image</span>
                                        )}
                                    </td>
                                    <td className="p-2 border">{user.display_name || "-"}</td>
                                    <td className="p-2 border">{user.email}</td>
                                    <td className="p-2 border">{user.role}</td>
                                    <td className="p-2 border">{user.gender || "-"}</td>
                                    <td className="p-2 border">{user.birth_date || "-"}</td>
                                    <td className={`p-2 border ${user.is_verified ? "text-green-600" : "text-yellow-600"}`}>
                                        {user.is_verified ? "Verified" : "Not Verified"}
                                    </td>
                                    <td className="p-2 border">{user.member_code || "-"}</td>
                                    <td className="p-2 border">{user.province_code || "-"}</td>
                                    <td className="p-2 border">
                                        {!user.is_verified ? (
                                            <Button
                                                onClick={() => approveUser(user.id)}
                                                disabled={approving === user.id}
                                                className="text-xs"
                                            >
                                                {approving === user.id ? "Approving..." : "Approve"}
                                            </Button>
                                        ) : user.is_verified && user.is_request_edit && !user.is_edit_allowed ? (
                                            <Button
                                                onClick={() => approveEditRequest(user.id)}
                                                disabled={approving === user.id}
                                                className="text-xs bg-blue-600 hover:bg-blue-700"
                                            >
                                                {approving === user.id ? "Approving..." : "Approve Edit Request"}
                                            </Button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center mt-6">
                        <Button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            variant="secondary"
                        >
                            Previous
                        </Button>
                        <p className="text-sm">
                            Page {page} of {totalPages}
                        </p>
                        <Button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            variant="secondary"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* KTP Image Zoom Modal */}
            {zoomImageUrl && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setZoomImageUrl(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-white p-4 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setZoomImageUrl(null)}
                            className="absolute top-2 right-2 bg-gray-200 p-1 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <img
                            src={getPublicImageUrl(zoomImageUrl)}
                            alt="Zoomed KTP"
                            className="object-contain max-h-[80vh] w-full mx-auto"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
