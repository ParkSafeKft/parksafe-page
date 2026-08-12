import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
import { Providers } from "@/components/Providers";
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = "https://parksafe.hu";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ParkSafe",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
      email: "info@parksafe.hu",
      telephone: "+36 30 721 2524",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@parksafe.hu",
        telephone: "+36 30 721 2524",
        availableLanguage: ["Hungarian", "English"],
      },
      sameAs: [
        "https://www.facebook.com/profile.php?id=61587562615852",
        "https://www.instagram.com/parksafe.app/",
        "https://www.linkedin.com/company/parksafe-app/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "ParkSafe",
      url: `${siteUrl}/`,
      description:
        "Városi kerékpáros navigáció, biztonságos kerékpártárolók és szervizpontok egy közösségi alkalmazásban.",
      inLanguage: ["hu", "en"],
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#application`,
      name: "ParkSafe",
      url: `${siteUrl}/`,
      description:
        "A ParkSafe egy ingyenes városi kerékpáros térképalkalmazás biztonságközpontú útvonaltervezéssel, kerékpártárolókkal, szervizpontokkal és közösségi helyadatokkal.",
      applicationCategory: "NavigationApplication",
      applicationSubCategory: "Urban cycling navigation and bicycle parking",
      operatingSystem: ["iOS", "Android"],
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "HUF",
      },
      downloadUrl: [
        "https://apps.apple.com/app/id6752813986",
        "https://play.google.com/store/apps/details?id=com.parksafe.app",
      ],
      screenshot: `${siteUrl}/ios_mapview.png`,
      featureList: [
        "Safety-first urban cycling routes",
        "Bicycle parking discovery",
        "Repair shop and public pump discovery",
        "Community ratings, photos, and location reports",
      ],
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: ["hu", "en"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ParkSafe",
  title: "ParkSafe: Kerékpáros Navigáció & Térkép",
  description: "ParkSafe: Városi kerékpáros navigáció és térkép. Biztonságos útvonalak, tárolók és szervizek egy appban. Töltsd le ingyen és tekerj gondtalanul!",
  keywords: ["kerékpár", "kerékpáros útvonal", "bicikli tárolás", "kerékpár szerviz", "város közlekedés", "kerékpáros navigáció", "bike parking", "ParkSafe"],
  alternates: {
    canonical: "https://parksafe.hu/",
  },
  openGraph: {
    title: "ParkSafe: Kerékpáros Navigáció & Térkép",
    description: "ParkSafe: Városi kerékpáros navigáció és térkép. Biztonságos útvonalak, tárolók és szervizek egy appban. Töltsd le ingyen és tekerj gondtalanul!",
    url: "https://parksafe.hu/",
    type: "website",
    images: [
      {
        url: "https://parksafe.hu/logo.png",
        width: 1200,
        height: 630,
        alt: "ParkSafe Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ParkSafe: Kerékpáros Navigáció & Térkép",
    description: "ParkSafe: Városi kerékpáros navigáció és térkép. Biztonságos útvonalak, tárolók és szervizek egy appban.",
    images: ["https://parksafe.hu/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className={`${inter.variable} antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PN6H8XM3"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Providers>
          <AuthRedirectHandler />
          {children}
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <GoogleTagManager gtmId="GTM-PN6H8XM3" />
      </body>
    </html>
  );
}

