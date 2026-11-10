"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ModalDialog, ProductIllustration } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { formatRupiah } from "@/lib/preview-data";

export function ListingDetailClient({ id }: { id: string }) {
  const {
    products,
    savedIds,
    toggleSave,
    codSpots,
    createOrder,
    submitReport,
  } = useMarketplace();

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
            Listing tidak ditemukan atau disembunyikan
          </h1>
          <p className="mt-2 text-sm font-medium text-[#334155]">
            Listing ini mungkin sudah terhapus atau disembunyikan sementara oleh
            administrator melalui post-moderasi.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2.5 text-sm font-bold text-white"
          >
            Kembali ke Katalog Beranda
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
      : ["Slide Utama (Ilustrasi)", "Detail Kondisi", "Area Spot COD"];

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !proposedTime.trim()) {
      setOrderError("Pilih 1 titik COD dan tentukan jadwal temu terlebih dahulu.");
      return;
    }
    const formatted = proposedTime.includes("T")
      ? proposedTime.replace("T", " ") + " WIB"
      : proposedTime;

    const res = createOrder({
      product,
      quantity,
      codSpot: selectedSpot,
      proposedTime: formatted,
      note,
    });
    if (!res.ok) {
      setOrderError(res.error ?? "Gagal mengirim pesanan.");
      return;
    }
    setOrderError("");
    setCreatedOrderCode(res.order?.code ?? "UM-BARU");
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      setReportError("Sebutkan alasan pelanggaran atau kendala yang ditemukan.");
      return;
    }
    submitReport({
      targetType: "Listing",
      targetId: product.id,
      targetTitle: product.title,
      reason: reportReason.trim(),
    });
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
          Beranda
        </Link>{" "}
        / <span>Detail Listing</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Galeri Foto (Maks. 5 Slot dengan dimensi tetap 0 CLS) */}
        <section className="space-y-4 lg:col-span-6" aria-label="Galeri foto listing">
          <div
            className={`relative flex aspect-[4/3] w-full items-center justify-center rounded-3xl border-[3px] border-[#111827] p-6 shadow-[5px_5px_0px_#111827] ${product.cardBg}`}
          >
            <span
              className={`absolute top-4 left-4 rounded-md border-2 border-[#111827] px-3 py-1 text-xs font-extrabold ${
                product.badgeTone === "green"
                  ? "bg-[#15803D] text-white"
                  : "bg-[#FACC15] text-[#111827]"
              }`}
            >
              {product.badge}
            </span>

            {product.uploadedImages && product.uploadedImages[activeSlide] ? (
              <Image
                unoptimized
                src={product.uploadedImages[activeSlide]}
                alt={`${product.title} tampilan ${activeSlide + 1}`}
                width={540}
                height={405}
                className="h-full w-full rounded-2xl object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <ProductIllustration
                  type={product.illustration}
                  className="h-44 w-60"
                />
                <span className="rounded-lg border-2 border-[#111827] bg-white px-3 py-1 text-xs font-bold text-[#111827]">
                  Slot Pratinjau {activeSlide + 1}/{totalSlots.length} •{" "}
                  {typeof totalSlots[activeSlide] === "string" &&
                  !totalSlots[activeSlide].startsWith("data:")
                    ? totalSlots[activeSlide]
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
                className={`min-h-11 rounded-xl border-2 border-[#111827] px-3.5 text-xs font-extrabold ${
                  activeSlide === idx
                    ? "bg-[#15803D] text-white shadow-[2px_2px_0px_#111827]"
                    : "bg-white text-[#111827] hover:bg-[#F0FDF4]"
                }`}
              >
                Foto {idx + 1}
              </button>
            ))}
          </div>

          {/* Profil Publik Penjual + Ulasan (UI-05, FR-07, FR-24) */}
          <div className="space-y-3 rounded-3xl border-[2.5px] border-[#111827] bg-[#F0FDF4] p-5 shadow-[4px_4px_0px_#111827]">
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
                    {product.sellerProdi} • Fakultas {product.faculty}
                  </p>
                </div>
              </div>
              {product.sellerVerified && (
                <span className="rounded-lg border-2 border-[#111827] bg-[#15803D] px-2.5 py-1 text-xs font-extrabold text-white">
                  Terverifikasi KTM
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-[#334155]">
              Nomor WhatsApp penjual dirahasiakan sesuai UU PDP dan otomatis terbuka
              di halaman Pesanan setelah penjual menyetujui jadwal COD (status{" "}
              <strong>Dijadwalkan</strong>).
            </p>

            {product.reviews && product.reviews.length > 0 && (
              <div className="space-y-2 border-t-2 border-[#111827]/15 pt-3">
                <h2 className="text-xs font-extrabold text-[#111827]">
                  Ulasan Transaksi Selesai ({product.reviews.length})
                </h2>
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-[#111827]/30 bg-white p-3 text-xs"
                  >
                    <p className="font-extrabold text-[#15803D]">
                      Nilai: {rev.rating}/5 • {rev.authorLabel}
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
          <div className="space-y-3 rounded-3xl border-[3px] border-[#111827] bg-white p-6 shadow-[5px_5px_0px_#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md border-2 border-[#111827] bg-[#FEF9C3] px-2.5 py-1 text-xs font-extrabold text-[#111827]">
                Kondisi: {product.condition}
              </span>
              <span
                className={`rounded-md border-2 px-2.5 py-1 text-xs font-extrabold ${
                  isSoldOut
                    ? "border-[#991B1B] bg-[#FEF2F2] text-[#991B1B]"
                    : "border-[#111827] bg-[#DCFCE7] text-[#14532D]"
                }`}
              >
                {product.alwaysAvailable
                  ? "Stok: Selalu Tersedia"
                  : isSoldOut
                    ? "Terjual (Stok 0)"
                    : `Sisa Stok: ${product.stock}`}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight text-[#111827]">
              {product.title}
            </h1>

            <p className="text-2xl font-extrabold text-[#15803D]">
              {product.priceLabel}{" "}
              <span className="text-xs font-bold text-[#334155]">
                • COD Tunai 0% Biaya Platform
              </span>
            </p>

            <p className="text-sm font-medium leading-relaxed text-[#334155]">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
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
                {isSaved ? "Tersimpan di Favorit" : "Simpan Listing"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportReason("");
                  setReportError("");
                  setReportSent(false);
                  setReportOpen(true);
                }}
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#991B1B] bg-[#FEF2F2] px-4 py-2 text-xs font-bold text-[#991B1B] hover:bg-[#FEE2E2]"
              >
                Laporkan Pelanggaran (FR-16)
              </button>
            </div>
          </div>

          {/* Form Pesanan COD Langsung */}
          <div className="rounded-3xl border-[3px] border-[#111827] bg-white p-6 shadow-[5px_5px_0px_#111827]">
            <h2 className="text-lg font-extrabold text-[#111827]">
              Buat Pesanan &amp; Ajukan Spot COD
            </h2>

            {createdOrderCode ? (
              <div
                role="status"
                className="mt-4 space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4"
              >
                <p className="text-sm font-extrabold text-[#15803D]">
                  Pesanan {createdOrderCode} berhasil dikirim!
                </p>
                <p className="text-xs font-medium text-[#111827]">
                  Total bayar tunai saat ketemuan:{" "}
                  <strong>{formatRupiah(product.price * quantity)}</strong> di{" "}
                  <strong>{selectedSpot}</strong>.
                </p>
                <Link
                  href="/pesanan"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white"
                >
                  Pantau Status di Halaman Pesanan
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
                      Pilih 1 Spot COD Didukung
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
                      Jumlah
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
                    Usulan Hari &amp; Jam Ketemuan
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
                    Catatan Pesanan (Opsional)
                  </label>
                  <textarea
                    id="detail-catatan"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Ketemuan di meja dekat tangga lobi."
                    className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
                  />
                </div>

                {orderError && (
                  <div
                    role="alert"
                    className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
                  >
                    Perhatian: {orderError}
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
                    ? "Barang Terjual (Stok Kosong)"
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
            Laporkan Pelanggaran Listing
          </h2>
          <button
            type="button"
            onClick={() => setReportOpen(false)}
            aria-label="Tutup dialog laporan"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        {reportSent ? (
          <div role="status" className="mt-4 space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4">
            <p className="text-sm font-bold text-[#15803D]">
              Laporan diterima untuk ditinjau administrator (FR-16 / FR-46).
            </p>
            <Link
              href="/admin"
              onClick={() => setReportOpen(false)}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
            >
              Lihat Antrean Laporan di Panel Admin
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
            <p className="text-xs font-medium text-[#334155]">
              Laporkan barang/jasa terlarang (rokok/vape, miras, bajakan, joki
              tugas/skripsi) atau ketidaksesuaian kondisi barang.
            </p>
            <div>
              <label
                htmlFor="alasan-laporan"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Alasan Pelaporan
              </label>
              <textarea
                id="alasan-laporan"
                rows={3}
                value={reportReason}
                onChange={(e) => {
                  setReportReason(e.target.value);
                  setReportError("");
                }}
                placeholder="Jelaskan dugaan pelanggaran secara spesifik..."
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
                Batal
              </button>
              <button
                type="submit"
                className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-5 text-xs font-bold text-white"
              >
                Kirim Laporan
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </main>
  );
}
