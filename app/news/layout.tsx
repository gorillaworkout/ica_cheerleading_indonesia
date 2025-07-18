import React, { ReactNode } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function NewsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-8xl">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
