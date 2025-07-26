"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
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
  Trophy,
  BookOpen,
  UserCheck,
  Award,
  Building2,
  Calendar,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";
import { SocialMedia } from "./socialMedia";

const menus = [
  { 
    name: "Home", 
    href: "/", 
    icon: <Home size={18} />,
    description: "Welcome to ICA"
  },
  {
    name: "About",
    icon: <Info size={18} />,
    description: "Learn about our organization",
    children: [
      { 
        name: "About ICA", 
        href: "/about", 
        icon: <Building2 size={16} />,
        description: "Our mission and vision"
      },
      { 
        name: "Organization", 
        href: "/about/organization", 
        icon: <Users size={16} />,
        description: "Our team structure"
      },
      { 
        name: "Coaches", 
        href: "/about/coaches", 
        icon: <UserCheck size={16} />,
        description: "Meet our certified coaches"
      },
      { 
        name: "Judges", 
        href: "/about/judges", 
        icon: <Award size={16} />,
        description: "Our expert panel of judges"
      },
    ],
  },
  { 
    name: "Championships", 
    href: "/championships", 
    icon: <Trophy size={18} />,
    description: "Competition results & rankings"
  },
  {
    name: "Education",
    icon: <GraduationCap size={18} />,
    description: "Rules, training & resources",
    children: [
      { 
        name: "Rules & Age Grid", 
        href: "/age-grid", 
        icon: <BookOpen size={16} />,
        description: "Competition rules and age categories"
      },
    ],
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  // Pastikan state.auth memiliki tipe yang benar, misal AuthState
  const { user, profile, loading } = useAppSelector((state: { auth: any }) => state.auth);
  const isAdmin = profile?.role === "admin";
  const isCoach = profile?.role === "coach" || isAdmin;
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleMouseEnter = (menuName: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setOpenMenu(menuName);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenMenu(null);
    }, 200); // 200ms delay before closing
    setHoverTimeout(timeout);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    dispatch(clearAuth());
    localStorage.removeItem("lastSignInEmail");
    
    // Clear any conflicting flags first
    localStorage.removeItem("justLoggedIn");
    localStorage.removeItem("justRegistered");
    localStorage.removeItem("justAuthenticated");
    
    // Set flag untuk toast di homepage
    localStorage.setItem("justLoggedOut", "true");
    
    // Show immediate toast feedback
    toast({
      title: "Logging Out...",
      description: "Please wait while we log you out.",
      variant: "default",
    });
    
    // Delay redirect supaya user melihat feedback
    setTimeout(() => {
      router.push("/");
      setIsSigningOut(false);
    }, 1500); // 1.5 detik delay
  };

  return (
    <>
      <SocialMedia />
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/ica-text.png" alt="ICA Logo" width={180} height={50} priority />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" ref={menuRef}>
              {menus.map((menu) => (
                <div
                  key={menu.name}
                  className="relative"
                  onMouseEnter={() => menu.children && handleMouseEnter(menu.name)}
                  onMouseLeave={() => menu.children && handleMouseLeave()}
                >
                  {menu.children ? (
                    <button 
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium hover:text-red-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                    >
                      {menu.icon}
                      {menu.name} 
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${
                          openMenu === menu.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={menu.href}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium hover:text-red-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      {menu.icon}
                      {menu.name}
                    </Link>
                  )}

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {openMenu === menu.name && menu.children && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                        onMouseEnter={() => handleMouseEnter(menu.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              {menu.icon}
                              {menu.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                          </div>
                          <div className="space-y-1">
                            {menu.children.map((sub, index) => (
                              <motion.div
                                key={sub.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  href={sub.href}
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  <div className="text-red-600 mt-0.5">
                                    {sub.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                                      {sub.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {sub.description}
                                    </p>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* User Section */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <Loader2 className="animate-spin text-gray-400" size={20} />
              ) : user ? (
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(profile?.display_name || user.email || '').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">
                      {profile?.display_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-xl border border-gray-100 invisible group-hover:visible group-hover:opacity-100 opacity-0 transition-all duration-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{profile?.display_name || user.email?.split("@")[0]}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      {profile?.role && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                          {profile.role}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors">
                          <Shield className="h-4 w-4 text-gray-500" />
                          Admin Dashboard
                        </Link>
                      )}
                      {/* {isCoach && (
                        <Link href="/coach" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors">
                          <Users className="h-4 w-4 text-gray-500" />
                          Coach Dashboard
                        </Link>
                      )} */}
                      <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings className="h-4 w-4 text-gray-500" />
                        Profile Settings
                      </Link>
                      {/* <Link href="/profile/id-card-generator" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        Generate ID Card
                      </Link>
                      <Link href="/profile/id-card-editor" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors">
                        <SettingsIcon className="h-4 w-4 text-gray-500" />
                        ID Card Editor
                      </Link> */}
                      <hr className="my-2" />
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {isSigningOut ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        {isSigningOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-gray-100 bg-white"
              >
                <div className="py-4 space-y-2">
                  {menus.map((menu) => (
                    <div key={menu.name}>
                      {menu.children ? (
                        <div>
                          <div className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium">
                            {menu.icon}
                            {menu.name}
                          </div>
                          <div className="ml-8 space-y-1">
                            {menu.children.map((sub) => (
                              <Link 
                                key={sub.name} 
                                href={sub.href} 
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setMobileOpen(false)}
                              >
                                {sub.icon}
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link 
                          href={menu.href} 
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {menu.icon}
                          {menu.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  {/* Mobile User Section */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    {user ? (
                      <>
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-medium">
                              {(profile?.display_name || user.email || '').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{profile?.display_name || user.email?.split("@")[0]}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <Link 
                            href="/admin" 
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        {isCoach && (
                          <Link 
                            href="/coach" 
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            Coach Dashboard
                          </Link>
                        )}
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          {isSigningOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          {isSigningOut ? "Signing out..." : "Sign Out"}
                        </button>
                      </>
                    ) : (
                      <div className="px-4">
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
