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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://unilak-mart.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "UnilakMart | Pasar Kampus & Etalase UMKM Mahasiswa Unilak",
  description:
    "Platform jual-beli buku kuliah, perlengkapan kos layak pakai, dan produk UMKM mahasiswa Universitas Lancang Kuning dengan transaksi COD di titik kampus.",
  openGraph: {
    title: "UnilakMart | Pasar Kampus & Etalase UMKM Mahasiswa Unilak",
    description:
      "Jual-beli buku kuliah, barang kos, dan produk UMKM mahasiswa Universitas Lancang Kuning. COD tunai aman di titik kampus dengan 0% biaya admin.",
    siteName: "UnilakMart",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnilakMart | Pasar Kampus & Etalase UMKM Mahasiswa Unilak",
    description:
      "Jual-beli buku kuliah, barang kos, dan UMKM mahasiswa Universitas Lancang Kuning dengan COD kampus 0% biaya admin.",
  },
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
