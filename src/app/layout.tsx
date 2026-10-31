import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import CartDrawer from "@/components/store/CartDrawer";
import PWARegister from "@/components/shared/PWARegister";

const siteUrl = 'https://kalavies.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KALAVIES Jewellery | Handcrafted Oxidised & Traditional Heritage Jewellery",
    template: "%s | KALAVIES Jewellery",
  },
  description:
    "Discover handcrafted oxidised silver jewellery, antique temple sets, bridal chokers, designer jhumkas, and timeless ethnic accessories from KALAVIES India. Free delivery over ₹699.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo-circle.png", sizes: "500x500", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/logo-circle.png", sizes: "500x500", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "KALAVIES Jewellery",
    title: "KALAVIES Jewellery | Handcrafted Oxidised & Heritage Jewellery Online",
    description:
      "Shop handcrafted oxidised jewellery, earrings, necklaces, bangles & traditional sets online in India. Cash on delivery & free shipping above ₹699.",
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
    title: "KALAVIES Jewellery | Handcrafted Oxidised & Heritage Jewellery",
    description:
      "Shop handcrafted oxidised jewellery, earrings, necklaces, bangles & traditional sets online in India.",
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
  keywords: [
    "oxidised jewellery online",
    "oxidised silver jewellery",
    "handcrafted jewellery India",
    "silver jhumkas online",
    "oxidised necklace set",
    "traditional temple jewellery",
    "artificial jewellery online",
    "boho silver accessories",
    "bangles and rings online",
    "KALAVIES",
    "kalavies jewellery",
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
        "@id": "https://kalavies.com/#organization",
        name: "KALAVIES Jewellery",
        url: "https://kalavies.com",
        logo: "https://kalavies.com/logo-circle.png",
        sameAs: [
          "https://www.instagram.com/kalavies.jewellery",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://kalavies.com/#website",
        url: "https://kalavies.com",
        name: "KALAVIES Jewellery",
        description:
          "Handcrafted Oxidised Silver & Traditional Heritage Jewellery in India",
        publisher: {
          "@id": "https://kalavies.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://kalavies.com/products?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#2D2D2D] selection:bg-[#C9A84C] selection:text-white font-sans">
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
