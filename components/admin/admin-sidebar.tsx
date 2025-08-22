"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Home, 
  Anvil, 
  Medal, 
  Building2, 
  Menu, 
  X, 
  Image, 
  GraduationCap, 
  Activity, 
  Scale, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Database,
  FileImage,
  UserCog,
  Newspaper,
  MapPin,
  Settings,
  Sparkles
} from "lucide-react"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface NavigationGroup {
  name: string
  icon: any
  items: {
    name: string
    href: string
    icon: any
  }[]
}

const navigationGroups: NavigationGroup[] = [
  {
    name: "Competition Management",
    icon: Database,
    items: [
      { name: "Add Province", href: "/admin/province/add", icon: MapPin },
      { name: "Add Division", href: "/admin/divisions/add", icon: Trophy },
      { name: "Add Competition", href: "/admin/competitions/add", icon: Anvil },
      { name: "Add Results", href: "/admin/results/add", icon: Medal },
    ]
  },
  {
    name: "Content Management",
    icon: FileImage,
    items: [
      { name: "Image Gallery", href: "/admin/gallery", icon: Image },
      { name: "PDF Manager", href: "/admin/pdf-manager", icon: FileText },
      { name: "News Manager", href: "/admin/news/add", icon: Newspaper },
    ]
  },
  {
    name: "Officials & Licensing",
    icon: Scale,
    items: [
      { name: "Manage Judges", href: "/admin/judges", icon: Scale },
      { name: "License Courses", href: "/admin/license/add", icon: GraduationCap },
    ]
  },
  {
    name: "User Management",
    icon: UserCog,
    items: [
      { name: "User Activity", href: "/admin/userActivity", icon: Activity },
      { name: "Manage Users", href: "/admin/users", icon: Users },
    ]
  }
]

const singleNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
]

export function AdminSidebar() {
	const pathname = usePathname()
	const [isMinimized, setIsMinimized] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
	const isMobile = useMediaQuery("(max-width: 768px)")

	const toggleGroup = (groupName: string) => {
		const newExpanded = new Set(expandedGroups)
		if (newExpanded.has(groupName)) {
			newExpanded.delete(groupName)
		} else {
			newExpanded.add(groupName)
		}
		setExpandedGroups(newExpanded)
	}

	const isGroupActive = (group: NavigationGroup) => {
		return group.items.some(item => pathname === item.href)
	}

	const MobileNavigation = () => (
		<div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-50">
			<div className="p-4 flex justify-between items-center">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
						<Sparkles className="text-white h-5 w-5" />
					</div>
					<div>
						<span className="font-bold text-xl text-gray-900">ICA Admin</span>
						<div className="text-xs text-red-600 font-medium">Control Panel</div>
					</div>
				</div>
				<button
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
				>
					{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</div>
			
			{isMobileMenuOpen && (
				<div className="bg-white shadow-xl transition-all duration-300 border-t border-gray-100">
					<nav className="space-y-2 p-4 max-h-[70vh] overflow-y-auto">
						{/* Single Navigation Items */}
						{singleNavigation.map((item) => {
							const isActive = pathname === item.href
							return (
								<Link
									key={item.name}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={cn(
										"flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
										isActive
											? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20"
											: "text-gray-700 hover:bg-red-50 hover:text-red-700",
									)}
								>
									<item.icon className="h-5 w-5" />
									<span>{item.name}</span>
								</Link>
							)
						})}

						{/* Navigation Groups */}
						{navigationGroups.map((group) => {
							const isExpanded = expandedGroups.has(group.name)
							const isActive = isGroupActive(group)
							
							return (
								<div key={group.name} className="space-y-1">
									<button
										onClick={() => toggleGroup(group.name)}
										className={cn(
											"w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
											isActive
												? "bg-red-50 text-red-700 border border-red-200"
												: "text-gray-700 hover:bg-red-50 hover:text-red-700"
										)}
									>
										<div className="flex items-center space-x-3">
											<group.icon className="h-5 w-5" />
											<span>{group.name}</span>
										</div>
										{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
									</button>
									
									{isExpanded && (
										<div className="ml-4 space-y-1 border-l-2 border-red-100 pl-4">
											{group.items.map((item) => {
												const isItemActive = pathname === item.href
												return (
													<Link
														key={item.name}
														href={item.href}
														onClick={() => setIsMobileMenuOpen(false)}
														className={cn(
															"flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
															isItemActive
																? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20"
																: "text-gray-600 hover:bg-red-50 hover:text-red-700"
														)}
													>
														<item.icon className="h-4 w-4" />
														<span>{item.name}</span>
													</Link>
												)
											})}
										</div>
									)}
								</div>
							)
						})}
					</nav>
				</div>
			)}
		</div>
	)

	if (isMobile) {
		return <MobileNavigation />
	}

	return (
		<div
			className={cn(
				"h-full transition-all duration-300 bg-white border-r border-gray-200 shadow-lg",
				isMinimized ? "w-16" : "w-72"
			)}
		>
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="px-6 py-6 border-b border-gray-100">
					<div className="flex items-center justify-between">
						{!isMinimized && (
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
									<span className="text-white font-bold text-sm">ICA</span>
								</div>
								<div>
									<span className="font-bold text-lg text-gray-900">Admin Panel</span>
									<div className="text-xs text-red-600 font-medium">Control Center</div>
								</div>
							</div>
						)}
						<button
							onClick={() => setIsMinimized(!isMinimized)}
							className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
						>
							{isMinimized ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
						</button>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
					{/* Single Navigation Items */}
					{singleNavigation.map((item) => {
						const isActive = pathname === item.href
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
									isActive
										? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20"
										: "text-gray-700 hover:bg-red-50 hover:text-red-700",
									isMinimized && "justify-center px-2"
								)}
							>
								<item.icon className="h-5 w-5 flex-shrink-0" />
								{!isMinimized && <span>{item.name}</span>}
								{isMinimized && (
									<div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
										{item.name}
									</div>
								)}
							</Link>
						)
					})}

					{/* Separator */}
					<div className="border-t border-gray-200 my-4"></div>

					{/* Navigation Groups */}
					{navigationGroups.map((group) => {
						const isExpanded = expandedGroups.has(group.name)
						const isActive = isGroupActive(group)
						
						return (
							<div key={group.name} className="space-y-1">
								<button
									onClick={() => !isMinimized && toggleGroup(group.name)}
									className={cn(
										"w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
										isActive
											? "bg-red-50 text-red-700 border border-red-200"
											: "text-gray-700 hover:bg-red-50 hover:text-red-700",
										isMinimized && "justify-center px-2"
									)}
								>
									<div className="flex items-center space-x-3">
										<group.icon className="h-5 w-5 flex-shrink-0" />
										{!isMinimized && <span>{group.name}</span>}
									</div>
									{!isMinimized && (
										<div className="flex-shrink-0">
											{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
										</div>
									)}
									
									{isMinimized && (
										<div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
											{group.name}
										</div>
									)}
								</button>
								
								{!isMinimized && isExpanded && (
									<div className="ml-6 space-y-1 border-l-2 border-red-100 pl-3">
										{group.items.map((item) => {
											const isItemActive = pathname === item.href
											return (
												<Link
													key={item.name}
													href={item.href}
													className={cn(
														"flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
														isItemActive
															? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20"
															: "text-gray-600 hover:bg-red-50 hover:text-red-700"
													)}
												>
													<item.icon className="h-4 w-4 flex-shrink-0" />
													<span>{item.name}</span>
												</Link>
											)
										})}
									</div>
								)}
							</div>
						)
					})}
				</nav>

				{/* Footer */}
				{!isMinimized && (
					<div className="px-6 py-4 border-t border-gray-100">
						<div className="flex items-center space-x-3 text-xs text-gray-500">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<span>System Online</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
