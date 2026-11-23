"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ModalDialog, ProductIllustration } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  EN_CONDITION_LABELS,
  formatRupiah,
  getDisplayLabel,
} from "@/lib/preview-data";

export function ListingDetailClient({ id }: { id: string }) {
  const {
    authUserId,
    profile,
    products,
    savedIds,
    toggleSave,
    codSpots,
    createOrder,
    submitReport,
    locale,
  } = useMarketplace();
  const isEn = locale === "en";

  const product = products.find((p) => p.id === id);
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpot, setSelectedSpot] = useState(
    product?.codSpots[0] ?? codSpots.find((c) => c.active)?.name ?? ""
  );
  const [proposedTime, setProposedTime] = useState("");
  const [note, setNote] = useState("");
  const [orderError, setOrderError] = useState("");
  const [createdOrderCode, setCreatedOrderCode] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSent, setReportSent] = useState(false);

  if (!product || product.hidden) {
    return (
      <main id="konten-utama" className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-8 text-center shadow-[5px_5px_0px_#111827]">
          <h1 className="text-2xl font-extrabold text-[#111827]">
            {isEn ? "Listing not found or hidden" : "Listing tidak ditemukan atau disembunyikan"}
          </h1>
          <p className="mt-2 text-sm font-medium text-[#334155]">
            {isEn
              ? "This listing may have been removed or temporarily hidden by an administrator during moderation."
              : "Listing ini mungkin sudah terhapus atau disembunyikan sementara oleh administrator melalui post-moderasi."}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2.5 text-sm font-bold text-white"
          >
            {isEn ? "Back to Home Catalog" : "Kembali ke Katalog Beranda"}
          </Link>
        </div>
      </main>
    );
  }

  const isSaved = savedIds.includes(product.id);
  const isSoldOut = !product.alwaysAvailable && product.stock <= 0;
  const totalSlots =
    product.uploadedImages && product.uploadedImages.length > 0
      ? product.uploadedImages.slice(0, 5)
      : isEn
        ? ["Main Slide (Illustration)", "Condition Detail", "COD Spot Area"]
        : ["Slide Utama (Ilustrasi)", "Detail Kondisi", "Area Spot COD"];

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !proposedTime.trim()) {
      setOrderError(
        isEn
          ? "Pick 1 COD spot and specify a meetup time first."
          : "Pilih 1 titik COD dan tentukan jadwal temu terlebih dahulu."
      );
      return;
    }
    const formatted = proposedTime.includes("T")
      ? proposedTime.replace("T", " ") + " WIB"
      : proposedTime;

    const res = await createOrder({
      product,
      quantity,
      codSpot: selectedSpot,
      proposedTime: formatted,
      note,
    });
    if (!res.ok) {
      setOrderError(
        res.error ?? (isEn ? "Failed to submit order." : "Gagal mengirim pesanan.")
      );
      return;
    }
    setOrderError("");
    setCreatedOrderCode(res.order?.code ?? "UM-BARU");
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      setReportError(
        isEn
          ? "Specify the violation or issue found."
          : "Sebutkan alasan pelanggaran atau kendala yang ditemukan."
      );
      return;
    }
    const res = await submitReport({
      targetType: "Listing",
      targetId: product.id,
      targetTitle: product.title,
      reason: reportReason.trim(),
    });
    if (!res.ok) {
      setReportError(
        res.error ?? (isEn ? "Failed to submit report." : "Gagal mengirim laporan.")
      );
      return;
    }
    setReportError("");
    setReportSent(true);
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-10"
    >
      <nav aria-label="Breadcrumb" className="text-xs font-bold text-[#334155]">
        <Link href="/" className="inline-flex min-h-11 items-center underline">
          {isEn ? "Home" : "Beranda"}
        </Link>{" "}
        / <span>{isEn ? "Listing Detail" : "Detail Listing"}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Galeri Foto (Maks. 5 Slot dengan dimensi tetap 0 CLS) */}
        <section
          className="space-y-4 lg:col-span-6"
          aria-label={isEn ? "Listing photo gallery" : "Galeri foto listing"}
        >
          <div
            className={`relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl border-2 border-[#111827] p-6 ${product.cardBg}`}
          >
            {(product.isUmkm || product.price === 0 || isSoldOut) && (
              <span
                className={`absolute top-4 left-4 rounded-md border border-[#111827] px-2.5 py-1 text-xs font-extrabold ${
                  isSoldOut
                    ? "bg-[#FEF2F2] text-[#991B1B]"
                    : product.badgeTone === "green"
                      ? "bg-[#15803D] text-white"
                      : "bg-[#FACC15] text-[#111827]"
                }`}
              >
                {isSoldOut
                  ? isEn
                    ? "Sold Out"
                    : "Habis"
                  : isEn && product.price === 0 && !product.isUmkm
                    ? "Free Rp0"
                    : product.badge}
              </span>
            )}

            {product.uploadedImages && product.uploadedImages[activeSlide] ? (
              <Image
                unoptimized
                src={product.uploadedImages[activeSlide]}
                alt={
                  isEn
                    ? `${product.title} view ${activeSlide + 1}`
                    : `${product.title} tampilan ${activeSlide + 1}`
                }
                width={540}
                height={405}
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <ProductIllustration
                  type={product.illustration}
                  className="h-44 w-60"
                />
                <span className="rounded-lg border border-[#111827]/40 bg-white px-3 py-1 text-xs font-bold text-[#111827]">
                  Slide {activeSlide + 1}/{totalSlots.length} •{" "}
                  {typeof totalSlots[activeSlide] === "string" &&
                  !totalSlots[activeSlide].startsWith("data:")
                    ? totalSlots[activeSlide]
                    : isEn
                      ? "Compressed Photo"
                      : "Foto Terkompresi"}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {totalSlots.map((_, idx) => (
              <button
                key={`slot-${idx}`}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-pressed={activeSlide === idx}
                className={`min-h-11 rounded-xl border-2 border-[#111827] px-3.5 text-xs font-bold ${
                  activeSlide === idx
                    ? "bg-[#15803D] text-white"
                    : "bg-white text-[#111827] hover:bg-[#F0FDF4]"
                }`}
              >
                {isEn ? `Photo ${idx + 1}` : `Foto ${idx + 1}`}
              </button>
            ))}
          </div>

          {/* Profil Publik Penjual + Ulasan */}
          <div className="space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] text-sm font-extrabold text-[#111827]">
                  {product.sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#111827]">
                    {product.sellerName}
                  </p>
                  <p className="text-xs font-semibold text-[#334155]">
                    {product.sellerProdi} • {isEn ? "Faculty" : "Fakultas"} {product.faculty}
                  </p>
                </div>
              </div>
              {product.sellerVerified && (
                <span className="rounded-lg border border-[#15803D] bg-[#DCFCE7] px-2.5 py-1 text-xs font-extrabold text-[#14532D]">
                  {isEn ? "KTM Verified" : "KTM Terverifikasi"}
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-[#475569]">
              {isEn
                ? "Seller's WhatsApp number is hidden and only unlocked once the seller approves your COD meetup schedule."
                : "Nomor WhatsApp penjual dirahasiakan dan baru terbuka setelah penjual menyetujui jadwal COD."}
            </p>

            {product.reviews && product.reviews.length > 0 && (
              <div className="space-y-2 border-t border-[#111827]/15 pt-3">
                <h2 className="text-xs font-extrabold text-[#111827]">
                  {isEn
                    ? `Buyer Reviews (${product.reviews.length})`
                    : `Ulasan Pembeli (${product.reviews.length})`}
                </h2>
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-[#111827]/20 bg-white p-3 text-xs"
                  >
                    <p className="font-extrabold text-[#15803D]">
                      {rev.rating}/5 • {rev.authorLabel}
                    </p>
                    <p className="mt-1 font-medium text-[#111827]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Info Listing & Form Pesan COD Langsung */}
        <section className="space-y-5 lg:col-span-6">
          <div className="space-y-3 rounded-2xl border-2 border-[#111827] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="rounded-md border border-[#111827]/40 bg-[#FEF9C3] px-2.5 py-1 text-[#111827]">
                {getDisplayLabel(locale, product.condition, EN_CONDITION_LABELS)}
              </span>
              <span
                className={
                  isSoldOut ? "font-extrabold text-[#991B1B]" : "font-extrabold text-[#14532D]"
                }
              >
                {product.alwaysAvailable
                  ? isEn
                    ? "Always available"
                    : "Stok selalu tersedia"
                  : isSoldOut
                    ? isEn
                      ? "Sold Out (Stock 0)"
                      : "Terjual (Stok 0)"
                    : isEn
                      ? `Stock left: ${product.stock}`
                      : `Sisa stok: ${product.stock}`}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight text-[#111827]">
              {product.title}
            </h1>

            <p className="text-2xl font-extrabold text-[#15803D]">
              {formatRupiah(product.price, locale)}{" "}
              <span className="text-xs font-bold text-[#475569]">
                {isEn ? "• Cash COD 0% Admin Fee" : "• COD Tunai 0% Biaya Admin"}
              </span>
            </p>

            <p className="text-sm font-medium leading-relaxed text-[#334155]">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {!isSoldOut && !createdOrderCode && (
                <a
                  href="#form-ajukan-cod"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white hover:bg-[#166534] lg:hidden"
                >
                  {isEn
                    ? `Request COD Now (${formatRupiah(product.price, locale)})`
                    : `Ajukan COD Sekarang (${product.priceLabel})`}
                </a>
              )}
              <button
                type="button"
                onClick={() => toggleSave(product.id)}
                aria-pressed={isSaved}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[#111827] px-4 py-2 text-xs font-extrabold ${
                  isSaved
                    ? "bg-[#FACC15] text-[#111827]"
                    : "bg-white text-[#111827] hover:bg-[#F0FDF4]"
                }`}
              >
                {isSaved ? (isEn ? "Saved" : "Tersimpan") : isEn ? "Save Listing" : "Simpan Listing"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportReason("");
                  setReportError("");
                  setReportSent(false);
                  setReportOpen(true);
                }}
                className="inline-flex min-h-11 items-center rounded-xl border border-[#991B1B]/60 bg-white px-4 py-2 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
              >
                {isEn ? "Report Listing" : "Laporkan Listing"}
              </button>
            </div>
          </div>

          {/* Form Pesanan COD Langsung */}
          <div
            id="form-ajukan-cod"
            className="rounded-2xl border-2 border-[#111827] bg-white p-6"
          >
            <h2 className="text-lg font-extrabold text-[#111827]">
              {isEn ? "Create Order & Propose COD Spot" : "Buat Pesanan & Ajukan Spot COD"}
            </h2>

            {createdOrderCode ? (
              <div
                role="status"
                className="mt-4 space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4"
              >
                <p className="text-sm font-extrabold text-[#15803D]">
                  {isEn
                    ? `Order ${createdOrderCode} submitted!`
                    : `Pesanan ${createdOrderCode} berhasil dikirim!`}
                </p>
                <p className="text-xs font-medium text-[#111827]">
                  {isEn ? (
                    <>
                      Total cash to pay on meetup:{" "}
                      <strong>{formatRupiah(product.price * quantity, locale)}</strong> at{" "}
                      <strong>{selectedSpot}</strong>.
                    </>
                  ) : (
                    <>
                      Total bayar tunai saat ketemuan:{" "}
                      <strong>{formatRupiah(product.price * quantity)}</strong> di{" "}
                      <strong>{selectedSpot}</strong>.
                    </>
                  )}
                </p>
                <Link
                  href="/pesanan"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white"
                >
                  {isEn ? "Track Status in Orders" : "Pantau Status di Halaman Pesanan"}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-4 space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="detail-spot-cod"
                      className="block text-xs font-extrabold text-[#111827]"
                    >
                      {isEn ? "Choose 1 Supported COD Spot" : "Pilih 1 Spot COD Didukung"}
                    </label>
                    <select
                      id="detail-spot-cod"
                      value={selectedSpot}
                      onChange={(e) => setSelectedSpot(e.target.value)}
                      className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
                    >
                      {product.codSpots.map((spot) => (
                        <option key={spot} value={spot}>
                          {spot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="detail-jumlah"
                      className="block text-xs font-extrabold text-[#111827]"
                    >
                      {isEn ? "Qty" : "Jumlah"}
                    </label>
                    <input
                      id="detail-jumlah"
                      type="number"
                      min={1}
                      max={product.alwaysAvailable ? 20 : product.stock}
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-bold text-[#111827] sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="detail-jam-cod"
                    className="block text-xs font-extrabold text-[#111827]"
                  >
                    {isEn ? "Proposed Meetup Date & Time" : "Usulan Hari & Jam Ketemuan"}
                  </label>
                  <input
                    id="detail-jam-cod"
                    type="datetime-local"
                    value={proposedTime}
                    onChange={(e) => {
                      setProposedTime(e.target.value);
                      setOrderError("");
                    }}
                    className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="detail-catatan"
                    className="block text-xs font-extrabold text-[#111827]"
                  >
                    {isEn ? "Order Note (Optional)" : "Catatan Pesanan (Opsional)"}
                  </label>
                  <textarea
                    id="detail-catatan"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      isEn
                        ? "Example: Meet by the lobby staircase table."
                        : "Contoh: Ketemuan di meja dekat tangga lobi."
                    }
                    className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
                  />
                </div>

                {orderError && (
                  <div
                    role="alert"
                    className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
                  >
                    {isEn ? "Notice:" : "Perhatian:"} {orderError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSoldOut}
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] px-5 py-2.5 text-sm font-bold ${
                    isSoldOut
                      ? "bg-[#E2E8F0] text-[#334155]"
                      : "bg-[#15803D] text-white shadow-[3px_3px_0px_#111827] hover:bg-[#166534]"
                  }`}
                >
                  {isSoldOut
                    ? isEn
                      ? "Sold Out (Stock Empty)"
                      : "Barang Terjual (Stok Kosong)"
                    : isEn
                      ? `Order COD (${formatRupiah(product.price * quantity, locale)})`
                      : `Pesan COD (${formatRupiah(product.price * quantity)})`}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Modal Lapor Pelanggaran FR-16 */}
      <ModalDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        titleId="judul-modal-lapor"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-modal-lapor" className="text-lg font-extrabold text-[#111827]">
            {isEn ? "Report Listing Violation" : "Laporkan Pelanggaran Listing"}
          </h2>
          <button
            type="button"
            onClick={() => setReportOpen(false)}
            aria-label={isEn ? "Close report dialog" : "Tutup dialog laporan"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        {reportSent ? (
          <div role="status" className="mt-4 space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4">
            <p className="text-sm font-bold text-[#15803D]">
              {isEn
                ? "Report received for administrator review."
                : "Laporan diterima untuk ditinjau administrator."}
            </p>
            {Boolean(authUserId) && profile.systemRole === "admin" && (
              <Link
                href="/admin"
                onClick={() => setReportOpen(false)}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
              >
                {isEn ? "View Report Queue in Admin" : "Lihat Antrean Laporan di Panel Admin"}
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
            <p className="text-xs font-medium text-[#334155]">
              {isEn
                ? "Report prohibited items/services (cigarettes/vapes, alcohol, pirated goods, assignment-writing services) or inaccurate item conditions."
                : "Laporkan barang/jasa terlarang (rokok/vape, miras, bajakan, joki tugas/skripsi) atau ketidaksesuaian kondisi barang."}
            </p>
            <div>
              <label
                htmlFor="alasan-laporan"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Reason for Report" : "Alasan Pelaporan"}
              </label>
              <textarea
                id="alasan-laporan"
                rows={3}
                value={reportReason}
                onChange={(e) => {
                  setReportReason(e.target.value);
                  setReportError("");
                }}
                placeholder={
                  isEn
                    ? "Describe the suspected violation specifically..."
                    : "Jelaskan dugaan pelanggaran secara spesifik..."
                }
                className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
              />
            </div>
            {reportError && (
              <div
                role="alert"
                className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
              >
                {reportError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button
                type="submit"
                className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-5 text-xs font-bold text-white"
              >
                {isEn ? "Submit Report" : "Kirim Laporan"}
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </main>
  );
}
