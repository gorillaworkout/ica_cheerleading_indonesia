import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonicalUrl,
    image = "/ica-hero.png",
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = config;

  const fullTitle = title.includes("ICA") ? title : `${title} | ICA - Indonesian Cheer Association`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indonesiancheer.org";
  const fullImage = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "Indonesian Cheer Association",
      "ICA",
      "cheerleading Indonesia",
      "kompetisi cheerleading",
      "olahraga cheerleading",
      "cheerleading competition",
      "Indonesian sports",
      ...keywords
    ],
    authors: author ? [{ name: author }] : [{ name: "ICA Team" }],
    creator: "Indonesian Cheer Association",
    publisher: "Indonesian Cheer Association",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type,
      locale: "id_ID",
      alternateLocale: ["en_US"],
      url: canonicalUrl || baseUrl,
      title: fullTitle,
      description,
      siteName: "ICA - Indonesian Cheer Association",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: "@indonesiancheer",
      site: "@indonesiancheer",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "id-ID": "/",
        "en-US": "/en",
      },
    },
    other: {
      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

export function generateJSONLD(data: any) {
  return JSON.stringify(data, null, 2);
}

// Structured Data Templates
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Indonesian Cheer Association",
  alternateName: "ICA",
  url: "https://indonesiancheer.org",
  logo: "https://indonesiancheer.org/ica-text.png",
  description: "Official platform for Indonesian Cheer Association competitions, education, and community.",
  sameAs: [
    "https://www.facebook.com/indonesiancheer",
    "https://www.instagram.com/indonesiancheer",
    "https://twitter.com/indonesiancheer",
    "https://www.youtube.com/c/indonesiancheer"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62-21-12345678",
    contactType: "customer service",
    availableLanguage: ["Indonesian", "English"]
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Sudirman No. 123",
    addressLocality: "Jakarta",
    addressRegion: "DKI Jakarta",
    postalCode: "10220",
    addressCountry: "ID"
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ICA - Indonesian Cheer Association",
  url: "https://indonesiancheer.org",
  description: "Official platform for Indonesian Cheer Association competitions, education, and community.",
  publisher: {
    "@type": "Organization",
    name: "Indonesian Cheer Association"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://indonesiancheer.org/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const eventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  url: string;
  image?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: event.name,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: {
    "@type": "Place",
    name: event.location,
    address: event.location
  },
  url: event.url,
  image: event.image,
  organizer: {
    "@type": "Organization",
    name: "Indonesian Cheer Association",
    url: "https://indonesiancheer.org"
  }
});

export const articleSchema = (article: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  category: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  url: article.url,
  image: article.image,
  datePublished: article.publishedTime,
  dateModified: article.modifiedTime || article.publishedTime,
  author: {
    "@type": "Person",
    name: article.author
  },
  publisher: {
    "@type": "Organization",
    name: "Indonesian Cheer Association",
    logo: {
      "@type": "ImageObject",
      url: "https://indonesiancheer.org/ica-text.png"
    }
  },
  articleSection: article.category,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": article.url
  }
});
