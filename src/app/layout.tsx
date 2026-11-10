import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { SiteChrome } from "@/components/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnilakMart | Pasar Kampus & Etalase UMKM Mahasiswa Unilak",
  description:
    "Platform jual-beli buku kuliah, perlengkapan kos layak pakai, dan produk UMKM mahasiswa Universitas Lancang Kuning dengan transaksi COD di titik kampus.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-[#111827]">
        <MarketplaceProvider>
          <SiteChrome>{children}</SiteChrome>
        </MarketplaceProvider>
      </body>
    </html>
  );
}
