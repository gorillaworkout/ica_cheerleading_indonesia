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
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { clearAuth } from "@/features/auth/authSlice"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { user, profile, loading, error } = useAppSelector((state) => state.auth)
  console.log(profile, 'profile')
  const isAdmin = profile?.role === "admin"
  const isCoach = profile?.role === "coach" || profile?.role === "admin"

  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
 const handleSignOut = async () => {
  try {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    dispatch(clearAuth())
    router.push("/") // ✅ Redirect ke home atau /login
  } finally {
    setIsSigningOut(false)
  }
}

  // Scroll sticky effect
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Championships", href: "/championships" },
    { name: "Education", href: "/education" },
  ]

  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null // Atau skeleton loader sesuai kebutuhan
  }
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/50 backdrop-blur shadow-sm" : "bg-white border-b"}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/ica-text.png" alt="ICA Logo" width={200} height={200} />
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
              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Auth Error</span>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{profile?.display_name || user.email?.split("@")[0] || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{profile?.display_name || user.email?.split("@")[0]}</div>
                    <div className="text-xs">{user.email}</div>
                    {profile?.role && <div className="text-xs font-medium text-red-600 capitalize mt-1">Role: {profile.role}</div>}
                  </div>
                  <DropdownMenuSeparator />

                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {isCoach && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/coach" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" /> Coach Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" /> Profile Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="text-red-600">
                    {isSigningOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...
                      </>
                    ) : (
                      "Sign Out"
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

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

              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
                      <Shield className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}

                  {isCoach && (
                    <Link href="/coach" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
                      <Users className="h-4 w-4" /> Coach Dashboard
                    </Link>
                  )}

                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
                    <Settings className="h-4 w-4" /> Profile Settings
                  </Link>

                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full bg-transparent text-red-600 border-red-600 hover:bg-red-50 mt-4"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...
                      </>
                    ) : (
                      "Sign Out"
                    )}
                  </Button>
                </>
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
