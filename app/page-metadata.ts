import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ICA - Indonesian Cheer Association | Beranda',
  description: 'Platform resmi Indonesian Cheer Association untuk kompetisi cheerleading, edukasi, dan komunitas. Bergabunglah dengan komunitas cheerleading terbesar di Indonesia.',
  keywords: [
    'cheerleading indonesia',
    'kompetisi cheerleading', 
    'ICA indonesia',
    'olahraga cheerleading',
    'komunitas cheerleading',
    'pelatihan cheerleading',
  ],
  other: {
    // Preload hero image specifically for homepage
    'link': [
      '<link rel="preload" href="/ica-hero.webp" as="image" fetchpriority="high" type="image/webp">',
    ]
  }
}
