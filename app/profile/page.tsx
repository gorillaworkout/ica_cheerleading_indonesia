import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProfileForm } from "@/components/profile/profile-form"

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your ICA profile settings and preferences.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProfileForm />
      <Footer />
    </div>
  )
}
