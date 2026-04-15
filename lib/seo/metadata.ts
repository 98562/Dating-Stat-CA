import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}

export function buildMetadata({
  title,
  description,
  path,
  imagePath
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, siteConfig.url);
  const imageUrl = imagePath ?? siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: url.pathname
    },
    openGraph: {
      title,
      description,
      url: url.toString(),
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}
