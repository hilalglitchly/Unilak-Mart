import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  SellerStorefrontClient,
  type SellerStorefrontSummary,
} from "@/components/SellerStorefrontClient";
import { SAMPLE_PRODUCTS, buildSellerSlug } from "@/lib/preview-data";
import type { Database } from "@/lib/supabase/database.types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchSellerSummary(
  slug: string
): Promise<SellerStorefrontSummary | null> {
  const cleanSlug = decodeURIComponent(slug).trim();
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

      if (UUID_REGEX.test(cleanSlug)) {
        const { data } = await supabase
          .from("public_profiles")
          .select("id, display_name, faculty, unit_or_prodi, verified, is_umkm")
          .eq("id", cleanSlug)
          .eq("is_deleted", false)
          .maybeSingle();

        if (data) {
          return {
            slug: data.id,
            name: data.display_name,
            faculty: data.faculty,
            prodi: data.unit_or_prodi,
            verified: data.verified,
            isUmkm: data.is_umkm,
          };
        }
      } else {
        const { data } = await supabase
          .from("listings")
          .select("seed_seller_name, seed_seller_prodi, faculty, is_umkm")
          .eq("status", "Aktif")
          .not("seed_seller_name", "is", null)
          .limit(50);

        const match = (data ?? []).find(
          (row) =>
            row.seed_seller_name &&
            buildSellerSlug(row.seed_seller_name) === cleanSlug.toLowerCase()
        );
        if (match?.seed_seller_name) {
          return {
            slug: cleanSlug,
            name: match.seed_seller_name,
            faculty: match.faculty,
            prodi: match.seed_seller_prodi ?? "",
            verified: true,
            isUmkm: match.is_umkm,
          };
        }
      }
    } catch {
      // Lanjut ke fallback data pratinjau
    }
  }

  const sample = SAMPLE_PRODUCTS.find(
    (p) =>
      buildSellerSlug(p.sellerName, p.sellerId).toLowerCase() ===
      cleanSlug.toLowerCase()
  );
  if (!sample) return null;
  return {
    slug: cleanSlug,
    name: sample.sellerName,
    prodi: sample.sellerProdi,
    faculty: sample.faculty,
    verified: sample.sellerVerified,
    isUmkm: Boolean(sample.isUmkm),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = await fetchSellerSummary(slug);

  if (!seller) {
    return {
      title: "Etalase Penjual | UnilakMart",
      description:
        "Lihat daftar barang dan etalase UMKM mahasiswa Universitas Lancang Kuning di UnilakMart.",
    };
  }

  const label = seller.isUmkm ? "Etalase UMKM Mahasiswa" : "Etalase Mahasiswa";
  const title = `${seller.name} (${label}) | UnilakMart`;
  const description = `Lihat semua barang dan jadwal COD kampus dari ${seller.name} (Fakultas ${seller.faculty}) di UnilakMart dengan 0% biaya admin.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/penjual/${slug}`,
      siteName: "UnilakMart",
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

async function SellerStorefrontResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).trim();
  const initialSeller = await fetchSellerSummary(cleanSlug);
  return (
    <SellerStorefrontClient slug={cleanSlug} initialSeller={initialSeller} />
  );
}

export default function SellerStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
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
              Memuat etalase penjual UnilakMart...
            </p>
          </div>
        </main>
      }
    >
      <SellerStorefrontResolver params={params} />
    </Suspense>
  );
}
