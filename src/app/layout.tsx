import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import CartDrawer from "@/components/store/CartDrawer";
import PWARegister from "@/components/shared/PWARegister";
import TopLoader from "@/components/shared/TopLoader";

const siteUrl = 'https://www.kalavies.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KALAVIES Jewellery | Premium Oxidised, Anti-Tarnish & Traditional Jewellery",
    template: "%s | KALAVIES Jewellery",
  },
  description:
    "Discover authentic oxidised silver jewellery, antique temple sets, bridal chokers, designer jhumkas, and timeless ethnic accessories from KALAVIES India. Free delivery over ₹699.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-circle.png", sizes: "500x500", type: "image/png" },
    ],
    shortcut: "/favicon-48x48.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "KALAVIES Jewellery",
    title: "KALAVIES Jewellery | Premium Oxidised & Traditional Jewellery Online",
    description:
      "Shop authentic oxidised jewellery, earrings, necklaces, bangles & traditional sets online in India. Cash on delivery & free shipping above ₹699.",
    images: [
      {
        url: "/logo-circle.png",
        width: 500,
        height: 500,
        alt: "KALAVIES Jewellery India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KALAVIES Jewellery | Premium Oxidised & Traditional Jewellery",
    description:
      "Shop authentic oxidised jewellery, earrings, necklaces, bangles & traditional sets online in India.",
    images: ["/logo-circle.png"],
  },
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
  verification: {
    google: "googled6cf278dbff60a7f",
  },
  keywords: [
    "kalavies",
    "kalavies jewellery",
    "oxidised jewellery online",
    "oxidised silver jewellery",
    "anti-tarnish jewellery online",
    "silver plated jewellery",
    "oxidised jewellery nagpur",
    "silver jhumkas online",
    "oxidised necklace set",
    "garba jewellery kalavies",
    "navratri jewellery",
    "traditional temple jewellery",
    "artificial jewellery online",
    "boho silver accessories",
    "bangles and rings online",
  ],
};

export const viewport: Viewport = {
  themeColor: "#C9A84C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.kalavies.com/#organization",
        name: "KALAVIES Jewellery",
        url: "https://www.kalavies.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.kalavies.com/logo-circle.png",
          width: "500",
          height: "500",
        },
        image: "https://www.kalavies.com/logo-circle.png",
        sameAs: [
          "https://www.instagram.com/kalavies",
          "https://www.instagram.com/kalavies.jewellery",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.kalavies.com/#website",
        url: "https://www.kalavies.com",
        name: "KALAVIES Jewellery",
        description:
          "Premium Oxidised Silver, Anti-Tarnish & Traditional Heritage Jewellery in India",
        publisher: {
          "@id": "https://www.kalavies.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.kalavies.com/products?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="shortcut icon" href="/favicon-48x48.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#2D2D2D] selection:bg-[#C9A84C] selection:text-white font-sans">
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <CartProvider>
          <WishlistProvider>
            <PWARegister />
            {children}
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
