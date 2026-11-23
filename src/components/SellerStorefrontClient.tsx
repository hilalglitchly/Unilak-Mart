"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductIllustration } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  EN_CONDITION_LABELS,
  buildSellerSlug,
  formatRupiah,
  getDisplayLabel,
} from "@/lib/preview-data";

export interface SellerStorefrontSummary {
  slug: string;
  name: string;
  prodi: string;
  faculty: string;
  verified: boolean;
  isUmkm: boolean;
}

export function SellerStorefrontClient({
  slug,
  initialSeller,
}: {
  slug: string;
  initialSeller: SellerStorefrontSummary | null;
}) {
  const { products, savedIds, toggleSave, locale } = useMarketplace();
  const isEn = locale === "en";
  const normalizedSlug = slug.trim().toLowerCase();

  const sellerProducts = products.filter(
    (item) =>
      !item.hidden &&
      buildSellerSlug(item.sellerName, item.sellerId).toLowerCase() ===
        normalizedSlug
  );

  const firstListing = sellerProducts[0];
  const seller: SellerStorefrontSummary | null = firstListing
    ? {
        slug,
        name: initialSeller?.name || firstListing.sellerName,
        prodi: initialSeller?.prodi || firstListing.sellerProdi,
        faculty: initialSeller?.faculty || firstListing.faculty,
        verified: initialSeller?.verified ?? firstListing.sellerVerified,
        isUmkm:
          Boolean(initialSeller?.isUmkm) ||
          sellerProducts.some((item) => Boolean(item.isUmkm)),
      }
    : initialSeller;

  if (!seller) {
    return (
      <main
        id="konten-utama"
        className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16"
      >
        <section className="rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-7 text-center shadow-[5px_5px_0px_#111827] sm:p-10">
          <h1 className="text-2xl font-extrabold text-[#111827]">
            {isEn ? "Seller Storefront Not Found" : "Etalase Penjual Tidak Ditemukan"}
          </h1>
          <p className="mt-2 text-sm font-medium text-[#334155]">
            {isEn
              ? "This seller may no longer have active listings or the storefront link is incorrect."
              : "Penjual ini mungkin belum memiliki listing aktif atau tautan etalase tidak sesuai."}
          </p>
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-5 text-sm font-extrabold text-white hover:bg-[#166534]"
            >
              {isEn ? "Back to Catalog" : "Kembali ke Katalog"}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const allReviews = sellerProducts.flatMap((item) =>
    (item.reviews ?? []).map((rev) => ({
      ...rev,
      productTitle: item.title,
      productId: item.id,
    }))
  );
  const avgRating =
    allReviews.length > 0
      ? (
          allReviews.reduce((sum, rev) => sum + rev.rating, 0) /
          allReviews.length
        ).toFixed(1)
      : null;

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <nav
        aria-label="Breadcrumb"
        className="text-xs font-semibold text-[#475569]"
      >
        <Link href="/" className="underline hover:text-[#111827]">
          {isEn ? "Home" : "Beranda"}
        </Link>{" "}
        / <span>{isEn ? "Seller Storefront" : "Etalase Penjual"}</span>
      </nav>

      {/* Kartu Profil Publik Penjual */}
      <section className="rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-5 shadow-[5px_5px_0px_#111827] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#111827] bg-[#FACC15] text-xl font-extrabold text-[#111827]">
              {seller.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {seller.verified && (
                  <span className="rounded-md border border-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-extrabold text-[#14532D]">
                    {isEn ? "KTM Verified" : "KTM Terverifikasi"}
                  </span>
                )}
                {seller.isUmkm && (
                  <span className="rounded-md border border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111827]">
                    {isEn ? "Student UMKM" : "UMKM Mahasiswa"}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
                {seller.name}
              </h1>
              <p className="text-sm font-semibold text-[#334155]">
                {seller.prodi
                  ? `${seller.prodi} • ${isEn ? "Faculty" : "Fakultas"} ${seller.faculty}`
                  : `${isEn ? "Faculty" : "Fakultas"} ${seller.faculty}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-2xl border-2 border-[#111827] bg-white px-3.5 py-2.5 text-center">
              <p className="text-lg font-extrabold text-[#111827]">
                {sellerProducts.length}
              </p>
              <p className="text-[11px] font-bold text-[#475569]">
                {isEn ? "Active Items" : "Listing Aktif"}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[#111827] bg-white px-3.5 py-2.5 text-center">
              <p className="text-lg font-extrabold text-[#111827]">
                {avgRating ? `${avgRating}/5` : "-"}
              </p>
              <p className="text-[11px] font-bold text-[#475569]">
                {isEn ? "Avg Rating" : "Rating"}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[#111827] bg-white px-3.5 py-2.5 text-center">
              <p className="text-lg font-extrabold text-[#111827]">
                {allReviews.length}
              </p>
              <p className="text-[11px] font-bold text-[#475569]">
                {isEn ? "Reviews" : "Ulasan"}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 border-t border-[#111827]/15 pt-3 text-xs font-medium text-[#334155]">
          {isEn
            ? "Direct cash COD at official Unilak campus spots with 0% admin fee. Seller WhatsApp unlocks automatically after your COD order is approved."
            : "Transaksi COD tunai langsung di titik kampus Unilak dengan 0% biaya admin. Nomor WhatsApp penjual terbuka otomatis setelah pesanan COD disetujui."}
        </p>
      </section>

      {/* Daftar Listing Aktif Penjual */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold text-[#111827] sm:text-xl">
            {isEn
              ? `Listings by ${seller.name}`
              : `Etalase Barang & Jasa (${sellerProducts.length})`}
          </h2>
          <Link
            href="/#katalog"
            className="text-xs font-extrabold text-[#15803D] underline underline-offset-4 hover:text-[#166534]"
          >
            {isEn ? "Browse all campus listings" : "Lihat semua katalog kampus"}
          </Link>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-8 text-center">
            <p className="text-sm font-extrabold text-[#111827]">
              {isEn
                ? "No active listings from this seller right now."
                : "Belum ada listing aktif dari penjual ini saat ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {sellerProducts.map((item) => {
              const isSaved = savedIds.includes(item.id);
              const isSoldOut = !item.alwaysAvailable && item.stock <= 0;

              return (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border-2 border-[#111827] bg-white shadow-[3px_3px_0px_#111827]"
                >
                  <div
                    className={`relative flex aspect-[4/3] items-center justify-center border-b-2 border-[#111827] p-3 ${item.cardBg}`}
                  >
                    {(item.isUmkm || item.price === 0 || isSoldOut) && (
                      <span
                        className={`absolute top-2 left-2 rounded-md border border-[#111827] px-2 py-0.5 text-[10px] font-extrabold ${
                          isSoldOut
                            ? "bg-[#FEF2F2] text-[#991B1B]"
                            : item.badgeTone === "green"
                              ? "bg-[#15803D] text-white"
                              : "bg-[#FACC15] text-[#111827]"
                        }`}
                      >
                        {isSoldOut
                          ? isEn
                            ? "Sold Out"
                            : "Habis"
                          : isEn && item.price === 0 && !item.isUmkm
                            ? "Free Rp0"
                            : item.badge}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleSave(item.id)}
                      aria-pressed={isSaved}
                      aria-label={
                        isSaved
                          ? isEn
                            ? `Remove ${item.title} from saved`
                            : `Hapus ${item.title} dari simpanan`
                          : isEn
                            ? `Save ${item.title}`
                            : `Simpan ${item.title}`
                      }
                      className={`absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#111827] ${
                        isSaved
                          ? "bg-[#FACC15] text-[#111827]"
                          : "bg-white text-[#111827] hover:bg-[#F0FDF4]"
                      }`}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4"
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M5 3.5h10a1 1 0 0 1 1 1v12.2l-6-3.4-6 3.4V4.5a1 1 0 0 1 1-1Z" />
                      </svg>
                    </button>

                    {item.uploadedImages && item.uploadedImages[0] ? (
                      <Image
                        unoptimized
                        src={item.uploadedImages[0]}
                        alt={item.title}
                        width={280}
                        height={210}
                        className="h-full w-full rounded-lg object-contain"
                      />
                    ) : (
                      <ProductIllustration
                        type={item.illustration}
                        className="h-24 w-32"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-2.5 p-3">
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-[#15803D] sm:text-base">
                        {formatRupiah(item.price, locale)}
                      </p>
                      <h3 className="line-clamp-2 text-xs font-extrabold text-[#111827] sm:text-sm">
                        <Link
                          href={`/listing/${item.id}`}
                          className="hover:underline"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-[11px] font-semibold text-[#475569]">
                        {getDisplayLabel(
                          locale,
                          item.condition,
                          EN_CONDITION_LABELS
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/listing/${item.id}`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-3 text-xs font-extrabold text-white hover:bg-[#166534]"
                    >
                      {isEn ? "View & Order COD" : "Lihat & Pesan COD"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Ulasan Pembeli */}
      {allReviews.length > 0 && (
        <section className="space-y-3 rounded-3xl border-2 border-[#111827] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[#111827]">
            {isEn
              ? `Buyer Reviews (${allReviews.length})`
              : `Ulasan Pembeli (${allReviews.length})`}
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {allReviews.map((rev) => (
              <li
                key={`${rev.productId}-${rev.id}`}
                className="space-y-1.5 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#111827]">
                    {rev.authorLabel}
                  </span>
                  <span className="rounded-md border border-[#111827] bg-[#FACC15] px-2 py-0.5 text-[11px] font-extrabold text-[#111827]">
                    {rev.rating}/5
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-[#334155]">
                  {rev.comment}
                </p>
                <p className="text-[11px] font-semibold text-[#475569]">
                  <Link
                    href={`/listing/${rev.productId}`}
                    className="underline hover:text-[#111827]"
                  >
                    {rev.productTitle}
                  </Link>{" "}
                  • {rev.createdAt}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
