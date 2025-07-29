import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  hreflang?: { [key: string]: string };
}

export function useSEO({ title, description, canonical, hreflang }: SEOProps) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update or add canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Update hreflang links
    if (hreflang) {
      Object.entries(hreflang).forEach(([lang, url]) => {
        let hreflangLink = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
        if (!hreflangLink) {
          hreflangLink = document.createElement('link');
          hreflangLink.rel = 'alternate';
          hreflangLink.hreflang = lang;
          document.head.appendChild(hreflangLink);
        }
        hreflangLink.href = url;
      });
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    }
  }, [title, description, canonical, hreflang]);
}
