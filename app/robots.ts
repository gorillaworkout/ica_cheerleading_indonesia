import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/debug/', '/_next/'],
    },
    sitemap: 'https://indonesiancheer.org/sitemap.xml',
    host: 'https://indonesiancheer.org',
  }
}
