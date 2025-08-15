// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { AuthInitWrapper } from "@/components/auth/auth-init-wrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true
});

// Preload hero image untuk LCP optimization
const heroImagePreloadLink = `<link rel="preload" as="image" href="/ica-hero.webp" fetchpriority="high" type="image/webp">`

export const metadata: Metadata = {
  title: "ICA - Indonesian Cheer Association",
  description: "Platform resmi Indonesian Cheer Association untuk kompetisi cheerleading, edukasi, dan komunitas. Bergabunglah dengan komunitas cheerleading terbesar di Indonesia.",
  keywords: ["cheerleading", "indonesia", "kompetisi", "edukasi", "komunitas"],
  authors: [{ name: "Indonesian Cheer Association" }],
  creator: "Indonesian Cheer Association",
  publisher: "Indonesian Cheer Association",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://indonesiancheer.org",
    title: "ICA - Indonesian Cheer Association",
    description: "Platform resmi Indonesian Cheer Association untuk kompetisi cheerleading, edukasi, dan komunitas.",
    siteName: "Indonesian Cheer Association",
    images: [
      {
        url: "https://indonesiancheer.org/ica-rounded.webp",
        width: 1200,
        height: 630,
        alt: "ICA - Indonesian Cheer Association",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ICA - Indonesian Cheer Association",
    description: "Platform resmi Indonesian Cheer Association untuk kompetisi cheerleading, edukasi, dan komunitas.",
    images: ["https://indonesiancheer.org/ica-rounded.webp"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/ica-rounded.webp",
    apple: "/ica-rounded.webp",
  },
  alternates: {
    canonical: "https://indonesiancheer.org/",
  },
  category: "sports",
  classification: "cheerleading",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  other: {
    "msapplication-TileColor": "#e11d48",
    "msapplication-config": "/browserconfig.xml",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ICA",
  },
  metadataBase: new URL("https://indonesiancheer.org")
}

// Viewport export untuk Next.js 15
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e11d48',
  colorScheme: 'light dark'
}

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
        
        {/* Defer Google Tag Manager untuk mengurangi JavaScript bundle */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Defer GTM loading
              window.addEventListener('load', function() {
                setTimeout(function() {
                  // Load GTM after page is fully loaded
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','G-XDF3J1V626');
                }, 2000); // Delay 2 seconds
              });
            `
          }}
        />
        
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
            __html: `
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Indonesian Cheer Association",
                "url": "https://indonesiancheer.org",
                "logo": "https://indonesiancheer.org/logo.png",
                "sameAs": [
                  "https://www.facebook.com/indonesiancheer",
                  "https://www.instagram.com/indonesiancheer",
                  "https://twitter.com/indonesiancheer"
                ]
              }
            `
          }}
        />
        
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "url": "https://indonesiancheer.org",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://indonesiancheer.org?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            `
          }}
        />
        
        {/* Performance hints - Critical untuk LCP optimization */}
        <link rel="dns-prefetch" href="//indonesiancheer.org" />
        <link rel="preconnect" href="https://indonesiancheer.org" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <AuthInitWrapper>
              {children}
              <Toaster />
            </AuthInitWrapper>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
