import type { Metadata } from "next";

export const siteUrl = "https://parksafe.hu";

export function publicPageMetadata(path: string, title: string, description: string): Metadata {
    const url = `${siteUrl}${path}`;
    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: "website",
            locale: "hu_HU",
            images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "ParkSafe Logo" }],
        },
        twitter: { card: "summary_large_image", title, description, images: [`${siteUrl}/logo.png`] },
    };
}
