import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "ICA - International Cheerleading Association",
    template: "%s | ICA",
  },
  description: "Official platform for International Cheerleading Association competitions, education, and community.",
  keywords: ["cheerleading", "competition", "ICA", "sports", "athletics"],
  authors: [{ name: "ICA Team" }],
  creator: "International Cheerleading Association",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ica-app.vercel.app",
    title: "ICA - International Cheerleading Association",
    description: "Official platform for International Cheerleading Association competitions, education, and community.",
    siteName: "ICA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICA - International Cheerleading Association",
    description: "Official platform for International Cheerleading Association competitions, education, and community.",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e11d48" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
