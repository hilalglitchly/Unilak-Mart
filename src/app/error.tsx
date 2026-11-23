"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useMarketplace();
  const isEn = locale === "en";

  useEffect(() => {
    console.error("UnilakMart runtime error:", error);
  }, [error]);

  return (
    <main
      id="konten-utama"
      className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:py-16"
    >
      <section
        role="alert"
        className="w-full rounded-3xl border-[3px] border-[#111827] bg-[#FEF2F2] p-7 text-center shadow-[5px_5px_0px_#111827] sm:p-10"
      >
        <span className="inline-flex items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-[#111827]">
          {isEn ? "Temporary Issue" : "Kendala Sementara"}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          {isEn
            ? "Something Went Wrong Loading This Page"
            : "Terjadi Kendala Saat Memuat Halaman"}
        </h1>
        <p className="mx-auto mt-2.5 max-w-lg text-sm font-medium leading-relaxed text-[#334155]">
          {isEn
            ? "The server connection or page session hit a brief interruption. Try reloading this section or return to the UnilakMart catalog."
            : "Koneksi ke server atau sesi halaman mengalami gangguan sementara. Silakan muat ulang bagian ini atau kembali ke beranda katalog UnilakMart."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-5 text-sm font-extrabold text-white shadow-[3px_3px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px]"
          >
            {isEn ? "Try Again" : "Coba Muat Ulang"}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-5 text-sm font-extrabold text-[#111827] hover:bg-[#F0FDF4]"
          >
            {isEn ? "Back to Home" : "Kembali ke Beranda"}
          </Link>
        </div>
      </section>
    </main>
  );
}
