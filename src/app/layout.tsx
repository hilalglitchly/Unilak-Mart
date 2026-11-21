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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("color-scheme"),m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=(s==="dark"||s==="light")?s:"light dark";var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);var l=localStorage.getItem("unilak-locale");if(l==="en"||l==="id")document.documentElement.lang=l;}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full bg-white text-[#111827]">
        <MarketplaceProvider>
          <SiteChrome>{children}</SiteChrome>
        </MarketplaceProvider>
      </body>
    </html>
  );
}
