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

export const metadata: Metadata = {
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ParkSafe",
              "url": "https://parksafe.hu/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://parksafe.hu/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ParkSafe",
              "url": "https://parksafe.hu",
              "logo": "https://parksafe.hu/logo.png",
              "sameAs": [
                "https://www.facebook.com/parksafe",
                "https://twitter.com/parksafe"
              ]
            })
          }}
        />
        <GoogleTagManager gtmId="GTM-PN6H8XM3" />
      </body>
    </html>
  );
}

