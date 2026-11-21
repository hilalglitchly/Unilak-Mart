"use client";

import Link from "next/link";
import { useState } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  EN_ORDER_STATUS_LABELS,
  buildWhatsAppUrl,
  formatRupiah,
  getDisplayLabel,
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
  const { authUserId, orders, updateOrderStatus, addOrderReview, submitReport, locale } =
    useMarketplace();
  const isEn = locale === "en";

  const [roleView, setRoleView] = useState<"pembeli" | "penjual">("pembeli");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [reviewTarget, setReviewTarget] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const visibleOrders = authUserId
    ? orders.filter((o) =>
        roleView === "pembeli"
          ? o.buyerId === authUserId
          : o.sellerId === authUserId
      )
    : orders;

  const runOrderTransition = async (
    orderId: string,
    nextStatus: OrderStatus,
    reason?: string
  ) => {
    setActionError("");
    setActionNotice("");
    const res = await updateOrderStatus(orderId, nextStatus, reason);
    if (!res.ok) {
      setActionError(
        res.error ??
          (isEn ? "Failed to update order status." : "Gagal memperbarui status pesanan.")
      );
      return false;
    }
    setActionNotice(
      isEn
        ? `Order status updated to ${getDisplayLabel(locale, nextStatus, EN_ORDER_STATUS_LABELS)}.`
        : `Status pesanan diperbarui menjadi ${nextStatus}.`
    );
    return true;
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      setCancelError(
        isEn
          ? "Cancellation reason is required before cancelling an order."
          : "Alasan pembatalan wajib diisi sebelum membatalkan pesanan."
      );
      return;
    }
    const ok = await runOrderTransition(
      cancelTarget.id,
      "Dibatalkan",
      cancelReason.trim()
    );
    if (!ok) {
      setCancelError(
        isEn ? "Cancellation rejected by server." : "Pembatalan ditolak oleh server."
      );
      return;
    }
    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;
    const res = await addOrderReview(reviewTarget.id, rating, reviewText.trim());
    if (!res.ok) {
      setActionError(
        res.error ?? (isEn ? "Failed to save review." : "Gagal menyimpan ulasan.")
      );
      return;
    }
    setActionNotice(
      isEn ? "COD transaction review saved." : "Ulasan transaksi COD tersimpan."
    );
    setReviewTarget(null);
    setRating(5);
    setReviewText("");
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
            {isEn ? "Campus COD Orders" : "Daftar Pesanan COD Kampus"}
          </h1>
          <p className="text-sm font-medium text-[#475569]">
            {isEn ? (
              <>
                The <strong>Contact via WhatsApp</strong> button unlocks automatically once
                the seller approves the COD schedule (status <strong>Scheduled</strong>).
              </>
            ) : (
              <>
                Tombol <strong>Hubungi via WhatsApp</strong> terbuka otomatis setelah jadwal
                COD disetujui penjual (status <strong>Dijadwalkan</strong>).
              </>
            )}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={isEn ? "Order perspective" : "Sudut pandang pesanan"}
          className="inline-flex rounded-xl border-2 border-[#111827] bg-[#F8FAFC] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={roleView === "pembeli"}
            onClick={() => setRoleView("pembeli")}
            className={`min-h-11 rounded-lg px-4 text-xs font-extrabold ${
              roleView === "pembeli"
                ? "bg-[#15803D] text-white"
                : "text-[#111827]"
            }`}
          >
            {authUserId
              ? isEn
                ? "My Orders"
                : "Pesanan Saya"
              : isEn
                ? "Buyer View"
                : "Mode Pembeli"}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={roleView === "penjual"}
            onClick={() => setRoleView("penjual")}
            className={`min-h-11 rounded-lg px-4 text-xs font-extrabold ${
              roleView === "penjual"
                ? "bg-[#FACC15] text-[#111827]"
                : "text-[#111827]"
            }`}
          >
            {authUserId
              ? isEn
                ? "Incoming Orders"
                : "Pesanan Masuk"
              : isEn
                ? "Seller Simulation"
                : "Simulasi Penjual"}
          </button>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3.5 text-xs font-bold text-[#991B1B]"
        >
          {isEn ? "Notice:" : "Perhatian:"} {actionError}
        </div>
      )}

      {actionNotice && (
        <div
          role="status"
          className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-bold text-[#14532D]"
        >
          {actionNotice}
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <div className="rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-8 text-center">
          <h2 className="text-lg font-extrabold text-[#111827]">
            {isEn ? "No COD orders yet" : "Belum ada pesanan COD"}
          </h2>
          <p className="mt-2 text-sm font-medium text-[#334155]">
            {authUserId && roleView === "penjual"
              ? isEn
                ? "No incoming COD requests for your listings yet."
                : "Belum ada permintaan COD masuk untuk listing milik Anda."
              : isEn
                ? "Browse the catalog and request a COD meetup at the nearest campus spot."
                : "Jelajahi katalog dan ajukan jadwal COD di titik kampus terdekat."}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white"
          >
            {isEn ? "Browse Catalog" : "Cari Barang di Katalog"}
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {visibleOrders.map((order) => {
            const waUnlocked =
              (order.status === "Dijadwalkan" ||
                order.status === "Sudah Diserahkan" ||
                order.status === "Selesai") &&
              Boolean(order.sellerWa);
            const canCancel =
              order.status === "Menunggu" || order.status === "Dijadwalkan";
            const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);

            return (
              <li
                key={order.id}
                className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-[#475569]">
                        #{order.code}
                      </span>
                      <span
                        className={`rounded-md border border-[#111827] px-2.5 py-0.5 text-xs font-extrabold ${getStatusBadgeClass(order.status)}`}
                      >
                        {getDisplayLabel(locale, order.status, EN_ORDER_STATUS_LABELS)}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-lg font-extrabold text-[#111827]">
                      <Link href={`/listing/${order.productId}`} className="hover:underline">
                        {order.productTitle}
                      </Link>
                    </h2>
                    <p className="text-xs font-semibold text-[#475569]">
                      {order.quantity}x • {isEn ? "Cash Total:" : "Total Tunai:"}{" "}
                      <strong className="text-[#15803D]">
                        {formatRupiah(order.unitPrice * order.quantity, locale)}
                      </strong>{" "}
                      • {roleView === "pembeli" ? order.sellerLabel : order.buyerLabel}
                    </p>
                  </div>

                  {/* Aksi Kontak WhatsApp Sesuai UU PDP */}
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
                        className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white hover:bg-[#166534]"
                      >
                        {isEn ? "Contact via WhatsApp" : "Hubungi via WhatsApp"}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center rounded-xl border border-[#111827]/25 bg-[#F8FAFC] px-3.5 py-2 text-xs font-bold text-[#475569]">
                        {order.status === "Selesai"
                          ? isEn
                            ? "Transaction completed (contact closed)"
                            : "Transaksi selesai (kontak ditutup)"
                          : isEn
                            ? "WhatsApp locked until Scheduled"
                            : "WhatsApp terkunci sebelum status Dijadwalkan"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Spot & Jadwal ringkas */}
                <div className="grid grid-cols-1 gap-2 rounded-xl border border-[#111827]/20 bg-[#F8FAFC] p-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="font-bold text-[#475569]">
                      {isEn ? "COD Spot: " : "Spot COD: "}
                    </span>
                    <span className="font-bold text-[#111827]">{order.codSpot}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#475569]">
                      {isEn ? "Schedule: " : "Jadwal: "}
                    </span>
                    <span className="font-bold text-[#111827]">{order.proposedTime}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#475569]">
                      {isEn ? "Note: " : "Catatan: "}
                    </span>
                    <span className="font-medium text-[#111827]">
                      {order.note || "-"}
                    </span>
                  </div>
                </div>

                {order.cancelReason && (
                  <p className="rounded-xl border border-[#991B1B] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#991B1B]">
                    {isEn
                      ? `Cancelled: ${order.cancelReason} (stock restored)`
                      : `Dibatalkan: ${order.cancelReason} (stok dikembalikan)`}
                  </p>
                )}

                {/* Stepper Status Ringkas */}
                <ol
                  aria-label={isEn ? "Order status timeline" : "Linimasa status pesanan"}
                  className="grid grid-cols-2 gap-2 text-xs font-bold sm:flex sm:flex-wrap sm:items-center"
                >
                  {TIMELINE_STEPS.map((step, idx) => {
                    const reached = currentStepIdx >= idx;
                    return (
                      <li
                        key={step}
                        className={`rounded-lg px-2.5 py-1.5 text-center sm:py-1 sm:text-left ${
                          reached
                            ? "bg-[#DCFCE7] text-[#14532D] ring-1 ring-[#15803D]"
                            : "bg-[#F8FAFC] text-[#64748B]"
                        }`}
                      >
                        {idx + 1}. {getDisplayLabel(locale, step, EN_ORDER_STATUS_LABELS)}
                      </li>
                    );
                  })}
                </ol>

                {/* Tombol Aksi Sesuai Peran & Status */}
                <div className="grid grid-cols-1 gap-2 border-t border-[#111827]/15 pt-3 sm:flex sm:flex-wrap [&>button]:justify-center [&>span]:justify-center">
                  {roleView === "penjual" && order.status === "Menunggu" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void runOrderTransition(order.id, "Dijadwalkan")}
                        className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
                      >
                        {isEn ? "Approve COD Schedule" : "Setujui Jadwal COD"}
                      </button>
                      {!authUserId && (
                        <button
                          type="button"
                          onClick={() =>
                            void runOrderTransition(order.id, "Kedaluwarsa")
                          }
                          className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3.5 py-2 text-xs font-bold text-[#111827]"
                        >
                          {isEn ? "Mark Expired" : "Tandai Kedaluwarsa"}
                        </button>
                      )}
                    </>
                  )}

                  {roleView === "penjual" && order.status === "Dijadwalkan" && (
                    <button
                      type="button"
                      onClick={() =>
                        void runOrderTransition(order.id, "Sudah Diserahkan")
                      }
                      className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827]"
                    >
                      {isEn ? "Mark Handed Over" : "Tandai Sudah Diserahkan"}
                    </button>
                  )}

                  {roleView === "pembeli" &&
                    (order.status === "Dijadwalkan" ||
                      order.status === "Sudah Diserahkan") && (
                      <button
                        type="button"
                        onClick={() => void runOrderTransition(order.id, "Selesai")}
                        className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
                      >
                        {isEn ? "Confirm Item Received" : "Konfirmasi Barang Diterima"}
                      </button>
                    )}

                  {order.status === "Selesai" && !order.ratingSubmitted && (
                    <button
                      type="button"
                      onClick={() => setReviewTarget(order)}
                      className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827]"
                    >
                      {isEn ? "Leave Review" : "Beri Ulasan"}
                    </button>
                  )}

                  {order.ratingSubmitted && (
                    <span className="inline-flex min-h-11 items-center rounded-xl border border-[#15803D] bg-[#F0FDF4] px-3 py-1.5 text-xs font-extrabold text-[#14532D]">
                      {isEn ? `Review: ${order.ratingSubmitted}/5` : `Ulasan: ${order.ratingSubmitted}/5`}
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
                      className="inline-flex min-h-11 items-center rounded-xl border border-[#991B1B]/60 bg-white px-3.5 py-2 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
                    >
                      {isEn ? "Cancel Order" : "Batalkan Pesanan"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      const res = await submitReport({
                        targetType: "Pesanan",
                        targetId: order.id,
                        targetTitle: `${order.code} - ${order.productTitle}`,
                        reason:
                          "Laporan kendala COD / no-show dari halaman Pesanan.",
                      });
                      if (!res.ok) {
                        setActionError(
                          res.error ??
                            (isEn ? "Failed to submit report." : "Gagal mengirim laporan.")
                        );
                      } else {
                        setActionNotice(
                          isEn
                            ? `Issue report for ${order.code} sent to Administrator.`
                            : `Laporan kendala untuk ${order.code} dikirim ke Administrator.`
                        );
                      }
                    }}
                    className="inline-flex min-h-11 items-center rounded-xl border border-[#111827]/35 bg-white px-3.5 py-2 text-xs font-bold text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    {isEn ? "Report Issue" : "Laporkan Kendala"}
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
            {isEn ? `Cancel Order ${cancelTarget?.code}` : `Batalkan Pesanan ${cancelTarget?.code}`}
          </h2>
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            aria-label={isEn ? "Close cancel order dialog" : "Tutup dialog batal pesanan"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCancelSubmit} className="mt-4 space-y-4">
          <p className="text-xs font-medium text-[#334155]">
            {isEn
              ? "Cancelling automatically restores this listing's stock quota back to the catalog."
              : "Pembatalan otomatis mengembalikan kuota stok listing ini ke katalog."}
          </p>
          <div>
            <label
              htmlFor="alasan-batal"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Cancellation Reason" : "Alasan Pembatalan"}{" "}
              <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="alasan-batal"
              rows={3}
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                setCancelError("");
              }}
              placeholder={
                isEn
                  ? "Example: Class schedule conflicted, need to reorder."
                  : "Contoh: Jadwal kuliah berubah bentrok, perlu pesan ulang."
              }
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
              {isEn ? "Back" : "Kembali"}
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-5 text-xs font-bold text-white"
            >
              {isEn ? "Confirm Cancel" : "Konfirmasi Batalkan"}
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
            {isEn ? `Rate Transaction ${reviewTarget?.code}` : `Nilai Transaksi ${reviewTarget?.code}`}
          </h2>
          <button
            type="button"
            onClick={() => setReviewTarget(null)}
            aria-label={isEn ? "Close review dialog" : "Tutup dialog ulasan"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-xs font-extrabold text-[#111827]">
              {isEn ? "Rating Score (1 to 5)" : "Skor Penilaian (1 sampai 5)"}
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
                  <span>
                    {star} {isEn ? (star === 1 ? "Star" : "Stars") : "Bintang"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="komentar-ulasan"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Short Comment (Optional)" : "Komentar Singkat (Opsional)"}
            </label>
            <textarea
              id="komentar-ulasan"
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={
                isEn
                  ? "Example: Item matched the description and arrived on time."
                  : "Contoh: Barang sesuai deskripsi dan datang tepat waktu."
              }
              className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReviewTarget(null)}
              className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold"
            >
              {isEn ? "Cancel" : "Batal"}
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full border-2 border-[#111827] bg-[#15803D] px-5 text-xs font-bold text-white"
            >
              {isEn ? "Submit Review" : "Kirim Ulasan"}
            </button>
          </div>
        </form>
      </ModalDialog>
    </main>
  );
}
