"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Shield,
  Users,
  Settings,
  Loader2,
  User,
  Home,
  Info,
  GraduationCap,
  Layers,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { IconRight } from "react-day-picker";
import { SocialMedia } from "./socialMedia";

const menus = [
  { name: "Home", href: "/", icon: <Home size={16} /> },
  {
    name: "About",
    children: [
      { name: "About ICA", href: "/about" },
      { name: "Organization", href: "/about/organization" },
      { name: "Coaches", href: "/about/coaches" },
      { name: "Judges", href: "/about/judges" },
    ],
  },
  { name: "Championships", href: "/championships", icon: <Layers size={16} /> },
  {
    name: "Education",
    children: [
      { name: "Rules & Age Grid", href: "/age-grid" },

    ],
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, profile, loading } = useAppSelector((state) => state.auth);
  const isAdmin = profile?.role === "admin";
  const isCoach = profile?.role === "coach" || isAdmin;
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    dispatch(clearAuth());
    localStorage.removeItem("lastSignInEmail");
    router.push("/");
    setIsSigningOut(false);
  };

  return (
    <>
      <SocialMedia/>
      <header className={`sticky top-0 z-50 ${scrolled ? "bg-white/60 backdrop-blur-lg shadow-md" : "bg-white/90"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Image src="/ica-text.png" alt="Logo" width={180} height={50} />
            </Link>
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <nav className="hidden md:flex items-start gap-6">
              {menus.map((menu) => (
                <div
                  key={menu.name}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(menu.name)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button className="flex items-center gap-2 text-gray-800 font-semibold hover:text-red-600">
                    {menu.name} {menu.children && <ChevronDown size={16} />}
                  </button>
                  <AnimatePresence>
                    {openMenu === menu.name && menu.children && (
                      <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="fixed left-0 top-[113px] w-full bg-white border-t shadow-xl py-6 z-50 flex flex-col items-start"
                        // onMouseEnter={() => setOpenMenu(menu.name)}
                        // onMouseLeave={() => setOpenMenu(null)}
                      >
                        <div className="max-w-7xl mx-auto px-8 flex flex-col gap-4 items-start w-full">
                          {menu.children.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className=" text-lg font-medium text-gray-800 hover:text-red-600 flex flex-row gap-x-4 items-center"
                            >
                              <ChevronLeft size={16} />
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : user ? (
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {profile?.display_name || user.email}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md invisible group-hover:visible group-hover:opacity-100 opacity-0 transition-all">
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{profile?.display_name || user.email?.split("@")[0]}</div>
                      <div className="text-xs">{user.email}</div>
                      {profile?.role && <div className="text-xs font-medium text-red-600 capitalize mt-1">Role: {profile.role}</div>}
                    </div>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        <Shield className="inline h-4 w-4 mr-2" /> Admin Dashboard
                      </Link>
                    )}
                    {isCoach && (
                      <Link href="/coach" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        <Users className="inline h-4 w-4 mr-2" /> Coach Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      <Settings className="inline h-4 w-4 mr-2" /> Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
                </Link>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="space-y-2">
                {menus.map((menu) => (
                  <div key={menu.name}>
                    <Link href={menu.href || "#"} className="flex items-center gap-2 text-gray-800 font-medium py-2">
                      {menu.icon} {menu.name}
                    </Link>
                    {menu.children && (
                      <div className="ml-6 space-y-1">
                        {menu.children.map((sub) => (
                          <Link key={sub.name} href={sub.href} className="block text-sm text-gray-600 hover:text-red-600">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" className="block py-2 text-sm">
                        Admin Dashboard
                      </Link>
                    )}
                    {isCoach && (
                      <Link href="/coach" className="block py-2 text-sm">
                        Coach Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="block py-2 text-sm">
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="text-left text-red-600 w-full py-2 text-sm"
                    >
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button className="w-full bg-red-600 hover:bg-red-700">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}


// menus = [
//     { name: "Home", href: "/" },
//     {
//       name: "About",
//       children: [
//         { name: "Organization", href: "/about#organization" },
//         { name: "Coaches", href: "/about#coaches" },
//         { name: "Judges", href: "/about#judges" },
//       ],
//     },
//     { name: "Championships", href: "/championships" },
//     {
//       name: "Education",
//       children: [
//         { name: "Age Grid", href: "/age-grid" },
//         { name: "Rules", href: "/rules" },
//         { name: "Safety", href: "/safety" },
//       ],
//     },
//   ];


// "use client"

// import Link from "next/link"
// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Menu, X, User, AlertCircle, ChevronDown, Settings, Shield, Users, Loader2 } from "lucide-react"
// import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
// import { clearAuth } from "@/features/auth/authSlice"
// import Image from "next/image"
// import { supabase } from "@/lib/supabase"
// import { useRouter } from "next/navigation"

// export function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)

//   const dispatch = useAppDispatch()
//   const { user, profile, loading, error } = useAppSelector((state) => state.auth)
//   console.log(profile, 'profile')
//   const isAdmin = profile?.role === "admin"
//   const isCoach = profile?.role === "coach" || profile?.role === "admin"

//   const [isSigningOut, setIsSigningOut] = useState(false)
//   const router = useRouter()
//  const handleSignOut = async () => {
//   try {
//     setIsSigningOut(true)
//     await supabase.auth.signOut()

//     router.push("/") // ⬅️ pindahkan di sini lebih awal

//     dispatch(clearAuth())
//     localStorage.removeItem("lastSignInEmail")
//   } finally {
//     setIsSigningOut(false)
//   }
// }


//   // Scroll sticky effect
//   const [scrolled, setScrolled] = useState(false)

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 10)
//     window.addEventListener("scroll", onScroll)
//     return () => window.removeEventListener("scroll", onScroll)
//   }, [])

//   const navigation = [
//     { name: "Home", href: "/" },
//     { name: "About", href: "/about" },
//     { name: "Championships", href: "/championships" },
//     { name: "Education", href: "/education" },
//     { name: "Age Grid", href: "/age-grid" },
//   ]

//   const [hasMounted, setHasMounted] = useState(false)

//   useEffect(() => {
//     setHasMounted(true)
//   }, [])

//   if (!hasMounted) {
//     return null // Atau skeleton loader sesuai kebutuhan
//   }
//   return (
//     <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/50 backdrop-blur shadow-sm" : "bg-white border-b"}`}>
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           <Link href="/" className="flex items-center space-x-2">
//             <Image src="/ica-text.png" alt="ICA Logo" width={200} height={200} />
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8">
//             {navigation.map((item) => (
//               <Link key={item.name} href={item.href} className="text-gray-700 hover:text-red-600 transition-colors">
//                 {item.name}
//               </Link>
//             ))}
//           </nav>

//           {/* Auth Section */}
//           <div className="hidden md:flex items-center space-x-4">
//             {loading ? (
//               <Loader2 className="h-4 w-4 animate-spin text-red-600" />
//             ) : error ? (
//               <div className="flex items-center space-x-2 text-red-600">
//                 <AlertCircle className="h-4 w-4" />
//                 <span className="text-sm">Auth Error</span>
//               </div>
//             ) : user ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
//                     <User className="h-4 w-4 text-gray-600" />
//                     <span className="text-sm text-gray-700">{profile?.display_name || user.email?.split("@")[0] || "User"}</span>
//                     <ChevronDown className="h-4 w-4 text-gray-600" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <div className="px-2 py-1.5 text-sm text-gray-500">
//                     <div className="font-medium text-gray-900">{profile?.display_name || user.email?.split("@")[0]}</div>
//                     <div className="text-xs">{user.email}</div>
//                     {profile?.role && <div className="text-xs font-medium text-red-600 capitalize mt-1">Role: {profile.role}</div>}
//                   </div>
//                   <DropdownMenuSeparator />

//                   {isAdmin && (
//                     <>
//                       <DropdownMenuItem asChild>
//                         <Link href="/admin" className="flex items-center">
//                           <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                     </>
//                   )}

//                   {isCoach && (
//                     <>
//                       <DropdownMenuItem asChild>
//                         <Link href="/coach" className="flex items-center">
//                           <Users className="mr-2 h-4 w-4" /> Coach Dashboard
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                     </>
//                   )}

//                   <DropdownMenuItem asChild>
//                     <Link href="/profile" className="flex items-center">
//                       <Settings className="mr-2 h-4 w-4" /> Profile Settings
//                     </Link>
//                   </DropdownMenuItem>

//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="text-red-600">
//                     {isSigningOut ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...
//                       </>
//                     ) : (
//                       "Sign Out"
//                     )}
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <Link href="/login">
//                 <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
//               </Link>
//             )}
//           </div>

//           <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
//             {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//           </button>
//         </div>

//         {isMenuOpen && (
//           <div className="md:hidden py-4 border-t">
//             <nav className="flex flex-col space-y-4">
//               {navigation.map((item) => (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className="text-gray-700 hover:text-red-600 transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {item.name}
//                 </Link>
//               ))}

//               {user ? (
//                 <>
//                   {isAdmin && (
//                     <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
//                       <Shield className="h-4 w-4" /> Admin Dashboard
//                     </Link>
//                   )}

//                   {isCoach && (
//                     <Link href="/coach" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
//                       <Users className="h-4 w-4" /> Coach Dashboard
//                     </Link>
//                   )}

//                   <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
//                     <Settings className="h-4 w-4" /> Profile Settings
//                   </Link>

//                   <Button
//                     variant="outline"
//                     onClick={handleSignOut}
//                     className="w-full bg-transparent text-red-600 border-red-600 hover:bg-red-50 mt-4"
//                     disabled={isSigningOut}
//                   >
//                     {isSigningOut ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...
//                       </>
//                     ) : (
//                       "Sign Out"
//                     )}
//                   </Button>
//                 </>
//               ) : (
//                 <Link href="/login">
//                   <Button className="bg-red-600 hover:bg-red-700 w-full">Sign In</Button>
//                 </Link>
//               )}
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   )
// }

//  BATAS header
