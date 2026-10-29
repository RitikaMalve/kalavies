import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import CartDrawer from "@/components/store/CartDrawer";
import PWARegister from "@/components/shared/PWARegister";

export const metadata: Metadata = {
  title: "KALAVIES Jewellery | Handcrafted Oxidised & Fine Traditional Jewellery",
  description:
    "Discover handcrafted oxidised silver jewellery, antique temple sets, bridal chokers, jhumkas, and contemporary fashion accessories from KALAVIES.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-circle.png",
    apple: "/logo-circle.png",
  },
  keywords: [
    "jewellery",
    "oxidised jewellery",
    "artificial jewellery",
    "silver jhumkas",
    "necklace sets",
    "bangles",
    "Indian jewellery",
    "KALAVIES",
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
  return (
    <html lang="en" className="h-full antialiased">
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
