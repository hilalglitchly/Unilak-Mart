"use client";

import Link from "next/link";
import { useState } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";

export default function AdminPage() {
  const {
    products,
    orders,
    ktmQueue,
    approveKtm,
    rejectKtm,
    reports,
    resolveReport,
    codSpots,
    toggleCodSpot,
  } = useMarketplace();

  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [adminNotice, setAdminNotice] = useState("");

  const activeListingCount = products.filter((p) => !p.hidden).length;
  const pendingKtmCount = ktmQueue.filter((q) => q.status === "Menunggu").length;
  const openReportCount = reports.filter((r) => r.status === "Baru").length;

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block rounded-md border-2 border-[#111827] bg-[#111827] px-2.5 py-0.5 text-xs font-extrabold text-[#FACC15]">
            PANEL ADMINISTRATOR RILIS 1 (FR-03, FR-46 s.d. FR-49)
          </span>
          <h1 className="mt-1.5 text-2xl font-extrabold text-[#111827] sm:text-3xl">
            Verifikasi KTM, Moderasi &amp; Spot COD Kampus
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {adminNotice && (
        <div
          role="status"
          className="rounded-2xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-extrabold text-[#14532D]"
        >
          {adminNotice}
        </div>
      )}

      {/* Statistik Ringkas Dihitung Nyata dari State Pratinjau R1 (FR-49) */}
      <section aria-label="Statistik ringkas pratinjau" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4">
          <span className="text-[11px] font-bold text-[#334155]">
            Listing Aktif [PRATINJAU]
          </span>
          <p className="mt-1 text-2xl font-extrabold text-[#15803D]">
            {activeListingCount}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#111827] bg-[#FEF9C3] p-4">
          <span className="text-[11px] font-bold text-[#334155]">
            Antrean KTM Menunggu
          </span>
          <p className="mt-1 text-2xl font-extrabold text-[#111827]">
            {pendingKtmCount}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#111827] bg-white p-4">
          <span className="text-[11px] font-bold text-[#334155]">
            Pesanan COD [PRATINJAU]
          </span>
          <p className="mt-1 text-2xl font-extrabold text-[#111827]">
            {orders.length}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-4">
          <span className="text-[11px] font-bold text-[#334155]">
            Laporan Baru (FR-46)
          </span>
          <p className="mt-1 text-2xl font-extrabold text-[#991B1B]">
            {openReportCount}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Antrean Verifikasi KTM Manual FR-03 */}
        <section
          aria-labelledby="judul-antrean-ktm"
          className="space-y-4 rounded-3xl border-[3px] border-[#111827] bg-white p-5 shadow-[5px_5px_0px_#111827] lg:col-span-7"
        >
          <h2 id="judul-antrean-ktm" className="text-lg font-extrabold text-[#111827]">
            Antrean Verifikasi Foto KTM (FR-03)
          </h2>

          <ul className="space-y-3">
            {ktmQueue.map((item) => (
              <li
                key={item.id}
                className="space-y-2.5 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-[#111827]">
                      {item.name} • NIM {item.nim}
                    </p>
                    <p className="text-xs font-semibold text-[#334155]">
                      {item.prodi} ({item.faculty}) • Signed URL Privat:{" "}
                      <code>{item.photoLabel}</code>
                    </p>
                  </div>
                  <span className="rounded-md border border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold">
                    {item.status}
                  </span>
                </div>

                {item.photoDeletedNote && (
                  <p className="text-xs font-bold text-[#15803D]">
                    {item.photoDeletedNote}
                  </p>
                )}
                {item.rejectionReason && (
                  <p className="text-xs font-bold text-[#991B1B]">
                    Alasan ditolak: {item.rejectionReason}
                  </p>
                )}

                {item.status === "Menunggu" && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          approveKtm(item.id);
                          setAdminNotice(
                            `KTM ${item.nim} disetujui dan foto otomatis dihapus dari bucket privat.`
                          );
                        }}
                        className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white"
                      >
                        Setujui &amp; Hapus Foto Otomatis
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label htmlFor={`tolak-${item.id}`} className="sr-only">
                        Alasan penolakan untuk {item.nim}
                      </label>
                      <input
                        id={`tolak-${item.id}`}
                        type="text"
                        value={rejectReasons[item.id] ?? ""}
                        onChange={(e) =>
                          setRejectReasons((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="Isi alasan penolakan jika ditolak..."
                        className="min-h-11 flex-1 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const reason =
                            rejectReasons[item.id]?.trim() ||
                            "Foto KTM buram atau NIM tidak terbaca jelas.";
                          rejectKtm(item.id, reason);
                          setAdminNotice(`KTM ${item.nim} ditolak dengan alasan tercatat.`);
                        }}
                        className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#991B1B] bg-[#FEF2F2] px-4 py-1.5 text-xs font-bold text-[#991B1B]"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Kolom Kanan: Moderasi Laporan + Pengelolaan Spot COD */}
        <div className="space-y-6 lg:col-span-5">
          <section
            aria-labelledby="judul-moderasi"
            className="space-y-3 rounded-3xl border-[3px] border-[#111827] bg-white p-5 shadow-[5px_5px_0px_#111827]"
          >
            <h2 id="judul-moderasi" className="text-lg font-extrabold text-[#111827]">
              Post-Moderasi Laporan (FR-46)
            </h2>
            <ul className="space-y-3">
              {reports.map((rep) => (
                <li
                  key={rep.id}
                  className="space-y-2 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#111827]">
                      [{rep.targetType}] {rep.targetTitle}
                    </span>
                    <span className="rounded border border-[#111827] bg-white px-2 py-0.5 font-extrabold">
                      {rep.status}
                    </span>
                  </div>
                  <p className="font-medium text-[#334155]">{rep.reason}</p>
                  {rep.status === "Baru" && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rep.targetType === "Listing" && (
                        <button
                          type="button"
                          onClick={() => {
                            resolveReport(rep.id, "hide");
                            setAdminNotice(
                              `Listing "${rep.targetTitle}" disembunyikan dari katalog publik.`
                            );
                          }}
                          className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-3.5 text-xs font-bold text-white"
                        >
                          Sembunyikan Listing
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => resolveReport(rep.id, "dismiss")}
                        className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827]"
                      >
                        Tandai Selesai
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="judul-spot-admin"
            className="space-y-3 rounded-3xl border-[3px] border-[#111827] bg-[#FEF9C3] p-5 shadow-[5px_5px_0px_#111827]"
          >
            <h2 id="judul-spot-admin" className="text-lg font-extrabold text-[#111827]">
              Kelola Daftar Spot COD (FR-19, FR-48)
            </h2>
            <ul className="space-y-2">
              {codSpots.map((spot) => (
                <li
                  key={spot.id}
                  className="flex items-center justify-between gap-2 rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-extrabold text-[#111827]">{spot.name}</p>
                    <p className="text-[11px] font-medium text-[#334155]">
                      {spot.hours}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCodSpot(spot.id)}
                    aria-pressed={spot.active}
                    className={`min-h-11 rounded-full border-2 border-[#111827] px-3 text-xs font-extrabold ${
                      spot.active
                        ? "bg-[#15803D] text-white"
                        : "bg-[#E2E8F0] text-[#334155]"
                    }`}
                  >
                    {spot.active ? "Aktif" : "Nonaktif"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
