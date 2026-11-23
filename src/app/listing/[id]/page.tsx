import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingDetailClient } from "@/components/ListingDetailClient";
import { SAMPLE_PRODUCTS, formatRupiah } from "@/lib/preview-data";
import type { Database } from "@/lib/supabase/database.types";

interface ListingMetadataSummary {
  title: string;
  description: string;
  price: number;
  condition: string;
  faculty: string;
  isUmkm: boolean;
  publicImage: string | null;
}

function pickPublicHttpsImage(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  for (const item of images) {
    if (typeof item === "string" && /^https?:\/\//i.test(item)) {
      return item;
    }
  }
  return null;
}

async function fetchListingMetadataSummary(
  slug: string
): Promise<ListingMetadataSummary | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const supabase = createSupabaseJsClient<Database>(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      const { data } = await supabase
        .from("listings")
        .select("title, description, price, condition, faculty, is_umkm, photos")
        .eq("slug", slug)
        .eq("status", "Aktif")
        .maybeSingle();

      if (data) {
        return {
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          faculty: data.faculty,
          isUmkm: data.is_umkm,
          publicImage: pickPublicHttpsImage(data.photos),
        };
      }
    } catch {
      // Lanjutkan ke fallback pratinjau lokal bila query metadata gagal
    }
  }

  const sample = SAMPLE_PRODUCTS.find((p) => p.id === slug);
  if (!sample) return null;
  return {
    title: sample.title,
    description: sample.description,
    price: sample.price,
    condition: sample.condition,
    faculty: sample.faculty,
    isUmkm: Boolean(sample.isUmkm),
    publicImage: pickPublicHttpsImage(sample.uploadedImages),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingMetadataSummary(id);

  if (!listing) {
    return {
      title: "Detail Produk | UnilakMart",
      description:
        "Lihat detail barang dan jadwal COD kampus mahasiswa Universitas Lancang Kuning di UnilakMart.",
    };
  }

  const priceText = formatRupiah(listing.price);
  const ogTitle = `${listing.title} (${priceText})`;
  const prefix = listing.isUmkm ? "UMKM Mahasiswa" : listing.condition;
  const rawDesc = `${priceText} • ${prefix} • ${listing.faculty}. ${listing.description}`;
  const description =
    rawDesc.length > 158 ? `${rawDesc.slice(0, 155).trimEnd()}...` : rawDesc;

  return {
    title: `${ogTitle} | UnilakMart`,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `/listing/${id}`,
      siteName: "UnilakMart",
      locale: "id_ID",
      type: "website",
      ...(listing.publicImage
        ? {
            images: [
              {
                url: listing.publicImage,
                alt: listing.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: listing.publicImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      ...(listing.publicImage ? { images: [listing.publicImage] } : {}),
    },
  };
}

async function ListingDetailResolver({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingDetailClient id={id} />;
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main
          id="konten-utama"
          className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10"
        >
          <div className="rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-8 text-center">
            <p className="text-sm font-bold text-[#111827]">
              Memuat detail produk UnilakMart...
            </p>
          </div>
        </main>
      }
    >
      <ListingDetailResolver params={params} />
    </Suspense>
  );
}
