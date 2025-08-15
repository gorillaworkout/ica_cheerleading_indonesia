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
        {/* Ultra-aggressive preload untuk LCP optimization */}
        <link
          rel="preload"
          href="/ica-hero.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
          crossOrigin="anonymous"
        />
        
        {/* Preload fonts */}
        <link
          rel="preload"
          href="/righteous-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch untuk external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Critical CSS inline untuk hero - bypass semua external CSS dan React */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-bypass-all {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              z-index: 1 !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              will-change: auto !important;
              backface-visibility: visible !important;
              transform: translateZ(0) !important;
              contain: layout style paint !important;
              isolation: isolate !important;
            }
            
            .hero-immediate-paint {
              paint-order: stroke fill markers !important;
              vector-effect: non-scaling-stroke !important;
            }
            
            /* Force immediate paint tanpa delay */
            .hero-force-paint {
              contain: layout style paint !important;
              isolation: isolate !important;
              will-change: auto !important;
              backface-visibility: visible !important;
              transform: translateZ(0) !important;
            }
            
            /* Bypass semua CSS conflicts */
            .hero-no-conflicts {
              all: unset !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              z-index: 1 !important;
            }
          `
        }} />
        
        {/* Default SEO Meta Tags - will be overridden by page-specific ones */}
        <link rel="alternate" hrefLang="id" href="https://indonesiancheer.org" />
        <link rel="alternate" hrefLang="x-default" href="https://indonesiancheer.org" />
        
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
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
