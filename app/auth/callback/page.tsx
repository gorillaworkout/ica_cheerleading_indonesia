// app/auth/callback/page.tsx

"use client"
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Failed to fetch user after OAuth:", error);
        return;
      }

      const now = new Date().toISOString();

      // Cek apakah user sudah ada di profiles
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          user_id: user.id,
          email: user.email,
          display_name: user.user_metadata.full_name || user.user_metadata.name || "Unnamed",
          role: "athlete",
          is_verified: false,
          created_at: now,
          updated_at: now,
          is_edit_allowed: false,
        });
      }

      toast({
        title: "Authentication Successful!",
        description: "You have been successfully authenticated and logged in.",
        variant: "default",
      });
      
      // Clear any conflicting flags first
      localStorage.removeItem("justLoggedOut");
      localStorage.removeItem("justLoggedIn");
      localStorage.removeItem("justRegistered");
      
      // Set flag for homepage toast
      localStorage.setItem("justAuthenticated", "true");
      
      // Delay redirect to let user see toast
      setTimeout(() => {
        router.push("/");  // Redirect to homepage after done
      }, 1500);
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-red-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 border border-red-400 rotate-45 animate-spin"></div>
        <div className="absolute bottom-32 right-10 w-20 h-20 border-2 border-red-600 rounded-lg animate-pulse"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Futuristic Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-spin"></div>
            {/* Middle Ring */}
            <div className="absolute inset-2 border-2 border-red-400 rounded-full animate-pulse"></div>
            {/* Inner Circle */}
            <div className="absolute inset-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Scanning Lines Effect */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse delay-300"></div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-red-600 to-gray-800 bg-clip-text text-transparent mb-4 animate-pulse">
          SISTEM OTENTIKASI
        </h1>
        
        {/* Subtitle */}
        <p className="text-red-600 text-xl font-medium mb-8 tracking-wider">
          Memproses Login Anda
        </p>

        {/* Progress Bar */}
        <div className="w-80 mx-auto mb-8">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Verifikasi...</span>
            <span>Hampir Selesai</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Koneksi Aman</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-150"></div>
            <span className="text-sm text-gray-600">Enkripsi Aktif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-300"></div>
            <span className="text-sm text-gray-600">Validasi Data</span>
          </div>
        </div>

        {/* Loading Text with Typewriter Effect */}
        <div className="text-gray-600 text-lg font-mono">
          <span className="animate-pulse">Mohon tunggu sebentar</span>
          <span className="animate-ping">...</span>
        </div>

        {/* Futuristic Border Frame */}
        <div className="absolute -inset-8 border-2 border-red-200 rounded-lg opacity-30">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-float {
          animation: float 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
