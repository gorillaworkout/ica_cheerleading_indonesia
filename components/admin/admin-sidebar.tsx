"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Trophy, Users, Settings, Plus, BarChart3, UserCheck, Calendar } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Add Division", href: "/admin/divisions/add", icon: Trophy },
  { name: "Add Competition", href: "/admin/competitions/add", icon: Plus },
  { name: "Add Results", href: "/admin/results/add", icon: BarChart3 },
  { name: "Add Image Public", href: "/admin/gallery", icon: BarChart3 },
  { name: "Manage Roles", href: "/admin/roles", icon: UserCheck },
  { name: "All Competitions", href: "/admin/competitions", icon: Calendar },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ICA</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Admin</span>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
