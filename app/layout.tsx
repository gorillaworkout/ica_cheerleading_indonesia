// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { AuthInitWrapper } from "@/components/auth/auth-init-wrapper"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics/analytics"
import { generateSEOMetadata, generateJSONLD, organizationSchema, websiteSchema } from "@/lib/seo"
// import { DebugPanel } from "@/components/dev/debug-panel"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter"
})

// Preload hero image untuk LCP optimization
const heroImagePreloadLink = `<link rel="preload" as="image" href="/ica-hero.webp" fetchpriority="high" type="image/webp">`

export const metadata: Metadata = generateSEOMetadata({
  title: "ICA - Indonesian Cheer Association",
  description: "Platform resmi Indonesian Cheer Association untuk kompetisi cheerleading, edukasi, dan komunitas. Bergabunglah dengan komunitas cheerleading terbesar di Indonesia.",
  keywords: [
    "cheerleading indonesia",
    "kompetisi cheerleading", 
    "ICA indonesia",
    "olahraga cheerleading",
    "komunitas cheerleading",
    "pelatihan cheerleading",
    "turnamen cheerleading nasional"
  ],
  canonicalUrl: "https://indonesiancheer.org/",
  type: "website"
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect untuk performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e11d48" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ICA" />
        
        {/* Icons - Progressive Web App */}
        <link rel="icon" href="/ica-text.png" sizes="any" style={{ width: 'auto' , height:'auto' }} />
        <link rel="icon" href="/ica-text.png" type="image/png"  style={{ width: 'auto' , height:'auto' }} />
        <link rel="apple-touch-icon" href="/ica-rounded.png" />
        <link rel="shortcut icon" href="/ica-text.png"  style={{ width: 'auto' , height:'auto' }} />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateJSONLD(organizationSchema)
          }}
        />
        
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateJSONLD(websiteSchema)
          }}
        />
        
        {/* Performance hints - Critical untuk LCP optimization */}
        <link rel="dns-prefetch" href="//indonesiancheer.org" />
        <link rel="preconnect" href="https://indonesiancheer.org" />
        
        {/* Resource hints untuk font optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Default SEO Meta Tags - will be overridden by page-specific ones */}
        <link rel="alternate" hrefLang="id" href="https://indonesiancheer.org" />
        <link rel="alternate" hrefLang="x-default" href="https://indonesiancheer.org" />
        
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <AuthInitWrapper>
              <Analytics googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID} />
              {children}
              <Toaster />
              {/* <DebugPanel /> */}
            </AuthInitWrapper>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
