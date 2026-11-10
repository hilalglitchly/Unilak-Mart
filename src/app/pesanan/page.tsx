"use client";

import Link from "next/link";
import { useState } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  buildWhatsAppUrl,
  formatRupiah,
  type OrderItem,
  type OrderStatus,
} from "@/lib/preview-data";

const TIMELINE_STEPS: OrderStatus[] = [
  "Menunggu",
  "Dijadwalkan",
  "Sudah Diserahkan",
  "Selesai",
];

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "Menunggu":
      return "bg-[#FEF9C3] text-[#111827]";
    case "Dijadwalkan":
      return "bg-[#FACC15] text-[#111827]";
    case "Sudah Diserahkan":
      return "bg-[#DCFCE7] text-[#14532D]";
    case "Selesai":
      return "bg-[#15803D] text-white";
    case "Dibatalkan":
    case "Kedaluwarsa":
      return "bg-[#FEF2F2] text-[#991B1B]";
  }
}

export default function PesananPage() {
  const { orders, updateOrderStatus, addOrderReview, submitReport } =
    useMarketplace();

  const [roleView, setRoleView] = useState<"pembeli" | "penjual">("pembeli");
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [reviewTarget, setReviewTarget] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      setCancelError("Alasan pembatalan wajib diisi sebelum membatalkan (FR-23).");
      return;
    }
    updateOrderStatus(cancelTarget.id, "Dibatalkan", cancelReason.trim());
    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;
    addOrderReview(reviewTarget.id, rating, reviewText.trim());
    setReviewTarget(null);
    setRating(5);
    setReviewText("");
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-block rounded-md border-2 border-[#111827] bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-extrabold text-[#14532D]">
            PELACAKAN 6 STATUS COD &amp; PRIVASI WA
          </span>
          <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
            Daftar Pesanan COD Kampus
          </h1>
          <p className="text-sm font-medium text-[#334155]">
            Tombol <strong>Hubungi via WhatsApp</strong> baru terbuka saat pesanan
            berstatus <strong>Dijadwalkan</strong> sesuai aturan privasi UU PDP R1.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Sudut pandang pratinjau pesanan"
          className="inline-flex rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={roleView === "pembeli"}
            onClick={() => setRoleView("pembeli")}
            className={`min-h-11 rounded-xl px-4 text-xs font-extrabold ${
              roleView === "pembeli"
                ? "border-2 border-[#111827] bg-[#15803D] text-white"
                : "text-[#111827]"
            }`}
          >
            Mode Pembeli
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={roleView === "penjual"}
            onClick={() => setRoleView("penjual")}
            className={`min-h-11 rounded-xl px-4 text-xs font-extrabold ${
              roleView === "penjual"
                ? "border-2 border-[#111827] bg-[#FACC15] text-[#111827]"
                : "text-[#111827]"
            }`}
          >
            Simulasi Penjual
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-8 text-center shadow-[4px_4px_0px_#111827]">
          <h2 className="text-lg font-extrabold text-[#111827]">
            Belum ada pesanan COD
          </h2>
          <p className="mt-2 text-sm font-medium text-[#334155]">
            Jelajahi katalog dan ajukan jadwal COD di titik kampus terdekat.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white"
          >
            Cari Barang di Katalog
          </Link>
        </div>
      ) : (
        <ul className="space-y-5">
          {orders.map((order) => {
            const waUnlocked =
              order.status === "Dijadwalkan" ||
              order.status === "Sudah Diserahkan" ||
              order.status === "Selesai";
            const canCancel =
              order.status === "Menunggu" || order.status === "Dijadwalkan";
            const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);

            return (
              <li
                key={order.id}
                className="space-y-4 rounded-3xl border-[3px] border-[#111827] bg-white p-5 shadow-[5px_5px_0px_#111827]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border-2 border-[#111827] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-extrabold">
                        Kode: {order.code}
                      </span>
                      <span
                        className={`rounded-md border-2 border-[#111827] px-2.5 py-0.5 text-xs font-extrabold ${getStatusBadgeClass(order.status)}`}
                      >
                        Status: {order.status}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-extrabold text-[#111827]">
                      <Link href={`/listing/${order.productId}`} className="hover:underline">
                        {order.productTitle}
                      </Link>
                    </h2>
                    <p className="text-xs font-semibold text-[#334155]">
                      {order.quantity}x • Total Bayar Tunai:{" "}
                      <strong className="text-[#15803D]">
                        {formatRupiah(order.unitPrice * order.quantity)}
                      </strong>{" "}
                      • Lawan transaksi:{" "}
                      {roleView === "pembeli" ? order.sellerLabel : order.buyerLabel}
                    </p>
                  </div>

                  {/* Aksi Kontak WhatsApp Sesuai UU PDP (FR-20) */}
                  <div>
                    {waUnlocked ? (
                      <a
                        href={buildWhatsAppUrl(
                          order.sellerWa,
                          order.code,
                          order.productTitle
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534]"
                      >
                        Hubungi via WhatsApp (Terbuka)
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827]/40 bg-[#F8FAFC] px-3.5 py-2 text-xs font-bold text-[#334155]">
                        WhatsApp terkunci sebelum status Dijadwalkan (UU PDP)
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Spot & Jadwal */}
                <div className="grid grid-cols-1 gap-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-3.5 text-xs sm:grid-cols-3">
                  <div>
                    <span className="block font-extrabold text-[#14532D]">Spot COD</span>
                    <span className="font-semibold text-[#111827]">{order.codSpot}</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-[#14532D]">
                      Usulan Waktu Temu
                    </span>
                    <span className="font-semibold text-[#111827]">
                      {order.proposedTime}
                    </span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-[#14532D]">Catatan</span>
                    <span className="font-semibold text-[#111827]">
                      {order.note || "Tidak ada catatan tambahan."}
                    </span>
                  </div>
                </div>

                {order.cancelReason && (
                  <p className="rounded-xl border border-[#991B1B] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#991B1B]">
                    Alasan Pembatalan: {order.cancelReason} (Kuota stok dikembalikan)
                  </p>
                )}

                {/* Linimasa Visual Status Utama (4 Tahap + Cabang Batal/Kedaluwarsa) */}
                <ol
                  aria-label="Linimasa status pesanan"
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {TIMELINE_STEPS.map((step, idx) => {
                    const reached = currentStepIdx >= idx;
                    return (
                      <li
                        key={step}
                        className={`rounded-xl border-2 px-3 py-2 text-xs font-extrabold ${
                          reached
                            ? "border-[#111827] bg-[#DCFCE7] text-[#14532D]"
                            : "border-[#111827]/25 bg-white text-[#475569]"
                        }`}
                      >
                        {idx + 1}. {step}
                      </li>
                    );
                  })}
                </ol>

                {/* Tombol Aksi Sesuai Peran & Status (FR-18 s.d. FR-24) */}
                <div className="flex flex-wrap gap-2 border-t-2 border-[#111827]/10 pt-3">
                  {roleView === "penjual" && order.status === "Menunggu" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, "Dijadwalkan")}
                        className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
                      >
                        Setujui Jadwal COD (Buka WhatsApp)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, "Kedaluwarsa")}
                        className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3.5 py-2 text-xs font-bold text-[#111827]"
                      >
                        Simulasi Kedaluwarsa 24 Jam
                      </button>
                    </>
                  )}

                  {roleView === "penjual" && order.status === "Dijadwalkan" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, "Sudah Diserahkan")}
                      className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827]"
                    >
                      Tandai Sudah Diserahkan
                    </button>
                  )}

                  {roleView === "pembeli" &&
                    (order.status === "Dijadwalkan" ||
                      order.status === "Sudah Diserahkan") && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, "Selesai")}
                        className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
                      >
                        Konfirmasi Barang Diterima (Selesai)
                      </button>
                    )}

                  {order.status === "Selesai" && !order.ratingSubmitted && (
                    <button
                      type="button"
                      onClick={() => setReviewTarget(order)}
                      className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827]"
                    >
                      Beri Ulasan &amp; Bintang (FR-24)
                    </button>
                  )}

                  {order.ratingSubmitted && (
                    <span className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#15803D] bg-[#F0FDF4] px-3 py-1.5 text-xs font-extrabold text-[#14532D]">
                      Ulasan terkirim: {order.ratingSubmitted}/5
                    </span>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelTarget(order);
                        setCancelReason("");
                        setCancelError("");
                      }}
                      className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#991B1B] bg-[#FEF2F2] px-3.5 py-2 text-xs font-bold text-[#991B1B]"
                    >
                      Batalkan dengan Alasan (FR-23)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      submitReport({
                        targetType: "Pesanan",
                        targetId: order.id,
                        targetTitle: `${order.code} - ${order.productTitle}`,
                        reason: "Laporan kendala COD / no-show dari halaman Pesanan.",
                      })
                    }
                    className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3.5 py-2 text-xs font-bold text-[#111827]"
                  >
                    Laporkan No-Show (FR-16)
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal Batal dengan Alasan FR-23 */}
      <ModalDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        titleId="judul-batal-pesanan"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-batal-pesanan" className="text-lg font-extrabold text-[#111827]">
            Batalkan Pesanan {cancelTarget?.code}
          </h2>
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            aria-label="Tutup dialog batal pesanan"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCancelSubmit} className="mt-4 space-y-4">
          <p className="text-xs font-medium text-[#334155]">
            Pembatalan otomatis mengembalikan kuota stok listing ini ke katalog.
          </p>
          <div>
            <label
              htmlFor="alasan-batal"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Alasan Pembatalan <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="alasan-batal"
              rows={3}
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                setCancelError("");
              }}
              placeholder="Contoh: Jadwal kuliah berubah bentrok, perlu pesan ulang."
              className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium sm:text-sm"
            />
          </div>
          {cancelError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              {cancelError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-5 text-xs font-bold text-white"
            >
              Konfirmasi Batalkan
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Modal Ulasan Bintang 1-5 FR-24 */}
      <ModalDialog
        open={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        titleId="judul-ulasan-pesanan"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-ulasan-pesanan" className="text-lg font-extrabold text-[#111827]">
            Nilai Transaksi {reviewTarget?.code}
          </h2>
          <button
            type="button"
            onClick={() => setReviewTarget(null)}
            aria-label="Tutup dialog ulasan"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-xs font-extrabold text-[#111827]">
              Skor Penilaian (1 sampai 5)
            </legend>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-[#111827] px-3 text-xs font-extrabold ${
                    rating === star ? "bg-[#FACC15]" : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={rating === star}
                    onChange={() => setRating(star)}
                    className="h-4 w-4 accent-[#15803D]"
                  />
                  <span>{star} Bintang</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="komentar-ulasan"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Komentar Singkat (Opsional)
            </label>
            <textarea
              id="komentar-ulasan"
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Contoh: Barang sesuai deskripsi dan datang tepat waktu."
              className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReviewTarget(null)}
              className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full border-2 border-[#111827] bg-[#15803D] px-5 text-xs font-bold text-white"
            >
              Kirim Ulasan
            </button>
          </div>
        </form>
      </ModalDialog>
    </main>
  );
}

