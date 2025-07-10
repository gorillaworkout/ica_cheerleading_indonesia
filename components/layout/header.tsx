"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, AlertCircle, ChevronDown, Settings, Shield, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import  Image  from 'next/image'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, loading, isSigningOut, signOut, error } = useAuth()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Championships", href: "/championships" },
    { name: "Education", href: "/education" },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const isAdmin = profile?.role === "admin"
  const isCoach = profile?.role === "coach" || profile?.role === "admin"

  // sticky header
  const [scrolled, setScrolled] = useState(false) // ← New state

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10) // change threshold as needed
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300  ${scrolled ? "bg-white/50 backdrop-blur shadow-sm" : "bg-white border-b"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/ica-text.png" alt="ICA Logo" width={200} height={200}/>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-gray-700 hover:text-red-600 transition-colors">
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Auth Error</span>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {profile?.display_name || user.email?.split("@")[0] || "User"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">
                        {profile?.display_name || user.email?.split("@")[0] || "User"}
                      </div>
                      <div className="text-xs">{user.email}</div>
                      {profile?.role && (
                        <div className="text-xs font-medium text-red-600 capitalize mt-1">Role: {profile.role}</div>
                      )}
                    </div>
                    <DropdownMenuSeparator />

                    {/* Admin Access */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Coach Access */}
                    {isCoach && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/coach" className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Coach Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Profile Settings */}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="text-red-600">
                      {isSigningOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing out...
                        </>
                      ) : (
                        "Sign Out"
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {loading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center space-x-2 text-red-600 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Auth Error</span>
                </div>
              ) : user ? (
                <div className="space-y-2 pt-4 border-t">
                  <div className="px-2 py-1 text-sm text-gray-500">
                    <div className="font-medium text-gray-900">
                      {profile?.display_name || user.email?.split("@")[0] || "User"}
                    </div>
                    <div className="text-xs">{user.email}</div>
                    {profile?.role && (
                      <div className="text-xs font-medium text-red-600 capitalize mt-1">Role: {profile.role}</div>
                    )}
                  </div>

                  {/* Admin Access Mobile */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-red-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {/* Coach Access Mobile */}
                  {isCoach && (
                    <Link
                      href="/coach"
                      className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-red-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Coach Dashboard</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full bg-transparent text-red-600 border-red-600 hover:bg-red-50"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      "Sign Out"
                    )}
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 w-full">Sign In</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
