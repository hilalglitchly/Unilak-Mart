import { Suspense } from "react";
import { ListingDetailClient } from "@/components/ListingDetailClient";

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
