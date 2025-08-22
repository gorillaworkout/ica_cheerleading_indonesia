"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UsersTable } from "@/components/admin/users-table"

export default function AdminUsersPage() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Users</h1>
                    <p className="text-gray-600 mt-2">
                        Kelola semua data users (athletes, coaches, admin) dalam satu tabel terpusat
                    </p>
                </div>
                <UsersTable />
            </div>
        </div>
    )
}
