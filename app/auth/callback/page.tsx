// app/auth/callback/page.tsx

"use client"
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

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

      router.push("/");  // Redirect to homepage after done
    };

    handleAuth();
  }, [router]);

  return <p>Processing login...</p>;
}
