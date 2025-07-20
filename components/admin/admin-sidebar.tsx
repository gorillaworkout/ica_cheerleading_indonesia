"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Trophy, Users, Settings, Anvil, Medal, UserCheck, Building2, Menu, X,Image } from "lucide-react"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

const navigation = [
	{ name: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ name: "Add Province", href: "/admin/province/add", icon: Building2 },
	{ name: "Add Division", href: "/admin/divisions/add", icon: Trophy },
	{ name: "Add Competition", href: "/admin/competitions/add", icon: Anvil },
	{ name: "Add Results", href: "/admin/results/add", icon: Medal },
	{ name: "Add Image Public", href: "/admin/gallery", icon: Image },
	{ name: "Add News", href: "/admin/news/add", icon: Image },
	{ name: "Manage Users", href: "/admin/users", icon: Users },
	// { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
	const pathname = usePathname()
	const [isMinimized, setIsMinimized] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const isMobile = useMediaQuery("(max-width: 768px)")

	if (isMobile) {
		return (
			<div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50">
				<div className="p-4 flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">ICA</span>
						</div>
						<span className="font-bold text-xl text-gray-900">Admin</span>
					</div>
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="text-gray-600 hover:text-gray-900"
					>
						{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>
				{isMobileMenuOpen && (
					<div className="bg-white shadow-md transition-all duration-300">
						<nav className="space-y-2 p-4">
							{navigation.map((item) => {
								const isActive = pathname === item.href
								return (
									<Link
										key={item.name}
										href={item.href}
										className={cn(
											"block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
											isActive
												? "bg-red-50 text-red-700 border-l-4 border-red-600"
												: "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
										)}
									>
										<div className="flex items-center space-x-3">
											<item.icon className="h-5 w-5" />
											<span>{item.name}</span>
										</div>
									</Link>
								)
							})}
						</nav>
					</div>
				)}
			</div>
		)
	}

	return (
		<div
			className={cn(
				"h-full transition-all duration-300",
				isMinimized ? "w-16" : "w-64 bg-white border-r border-gray-200",
			)}
		>
			<div className="p-6">
				<button
					onClick={() => setIsMinimized(!isMinimized)}
					className="mb-4 text-gray-600 hover:text-gray-900"
				>
					{isMinimized ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
				</button>

				{!isMinimized && (
					<div className="flex items-center space-x-2 mb-8">
						<div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">ICA</span>
						</div>
						<span className="font-bold text-xl text-gray-900">Admin</span>
					</div>
				)}

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
									isMinimized && "justify-center",
								)}
							>
								<item.icon className="h-5 w-5" />
								{!isMinimized && <span>{item.name}</span>}
							</Link>
						)
					})}
				</nav>
			</div>
		</div>
	)
}
