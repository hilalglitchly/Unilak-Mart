"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getAdminKtmSignedUrlAction } from "@/app/admin/actions";
import { useMarketplace } from "@/components/MarketplaceProvider";

type AdminTab = "semua" | "ktm" | "laporan" | "spot";

export default function AdminPage() {
  const {
    authUserId,
    profile,
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
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [adminNotice, setAdminNotice] = useState("");
  const [adminError, setAdminError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("semua");

  const isNonAdminSignedUser =
    Boolean(authUserId) && profile.systemRole !== "admin";

  const activeListingCount = products.filter((p) => !p.hidden).length;
  const pendingKtmCount = ktmQueue.filter((q) => q.status === "Menunggu").length;
  const openReportCount = reports.filter((r) => r.status === "Baru").length;

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
            Panel Administrator UnilakMart
          </h1>
          <p className="mt-1 text-sm font-medium text-[#475569]">
            {authUserId
              ? "Moderasi langsung ke database PostgreSQL Supabase & bucket privat KTM."
              : "Mode pratinjau tamu. Masuk sebagai akun Administrator untuk memproses antrean KTM riil."}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#F8FAFC]"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {isNonAdminSignedUser ? (
        <section
          role="alert"
          className="space-y-3 rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-6"
        >
          <h2 className="text-lg font-extrabold text-[#991B1B]">
            Akses Khusus Administrator
          </h2>
          <p className="text-xs font-semibold leading-relaxed text-[#111827]">
            Akun aktif ({profile.email}) berperan sebagai mahasiswa biasa (
            <code>system_role = &apos;user&apos;</code>). Sesuai rancangan keamanan,
            halaman moderasi hanya dapat dibuka oleh akun Administrator yang ditunjuk di
            tabel <code>public.profiles</code>.
          </p>
          <p className="rounded-xl border border-[#111827]/25 bg-white p-3 font-mono text-[11px] text-[#334155]">
            update public.profiles set system_role = &apos;admin&apos;, ktm_status =
            &apos;Terverifikasi&apos; where email = &apos;{profile.email}&apos;;
          </p>
        </section>
      ) : (
        <>
          {/* Ringkasan metrik ringkas + Tab Fokus */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-3.5 text-xs font-bold text-[#334155]">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Listing Aktif:{" "}
                <strong className="text-[#15803D]">{activeListingCount}</strong>
              </span>
              <span>
                Antrean KTM:{" "}
                <strong className="text-[#111827]">{pendingKtmCount}</strong>
              </span>
              <span>
                Pesanan: <strong className="text-[#111827]">{orders.length}</strong>
              </span>
              <span>
                Laporan Baru:{" "}
                <strong className="text-[#991B1B]">{openReportCount}</strong>
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Filter bagian admin"
              className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap"
            >
              {(
                [
                  { id: "semua", label: "Semua" },
                  { id: "ktm", label: `Antrean KTM (${pendingKtmCount})` },
                  { id: "laporan", label: `Laporan (${openReportCount})` },
                  { id: "spot", label: "Titik COD" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-11 rounded-xl px-3.5 text-xs font-extrabold transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#15803D] text-white"
                      : "border border-[#111827]/25 bg-white text-[#111827] hover:bg-[#F0FDF4]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {adminError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3.5 text-xs font-extrabold text-[#991B1B]"
            >
              Perhatian: {adminError}
            </div>
          )}

          {adminNotice && (
            <div
              role="status"
              className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-extrabold text-[#14532D]"
            >
              {adminNotice}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {(activeTab === "semua" || activeTab === "ktm") && (
              <section
                aria-labelledby="judul-antrean-ktm"
                className={`space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 ${
                  activeTab === "ktm" ? "lg:col-span-12" : "lg:col-span-7"
                }`}
              >
                <h2
                  id="judul-antrean-ktm"
                  className="text-lg font-extrabold text-[#111827]"
                >
                  Antrean Verifikasi Foto KTM
                </h2>

                {ktmQueue.length === 0 ? (
                  <p className="rounded-xl border border-[#111827]/20 bg-[#F8FAFC] p-4 text-xs font-semibold text-[#475569]">
                    Belum ada antrean verifikasi KTM yang masuk.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {ktmQueue.map((item) => (
                      <li
                        key={item.id}
                        className="space-y-2.5 rounded-xl border border-[#111827]/30 bg-[#F8FAFC] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-extrabold text-[#111827]">
                              {item.name} • NIM {item.nim}
                            </p>
                            <p className="text-xs font-semibold text-[#475569]">
                              {item.prodi} ({item.faculty}) • Berkas:{" "}
                              <code>{item.photoLabel}</code>
                            </p>
                          </div>
                          <span className="rounded-md border border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold">
                            {item.status}
                          </span>
                        </div>

                        {signedUrls[item.id] && (
                          <div className="rounded-xl border border-[#111827]/30 bg-white p-2">
                            <Image
                              unoptimized
                              src={signedUrls[item.id]}
                              alt={`Foto KTM NIM ${item.nim}`}
                              width={420}
                              height={240}
                              className="max-h-56 w-auto rounded-lg object-contain"
                            />
                          </div>
                        )}

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
                              {authUserId && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setAdminError("");
                                    const res = await getAdminKtmSignedUrlAction(
                                      item.photoLabel
                                    );
                                    if (!res.ok || !res.url) {
                                      setAdminError(
                                        res.error ?? "Gagal memuat signed URL KTM."
                                      );
                                      return;
                                    }
                                    setSignedUrls((prev) => ({
                                      ...prev,
                                      [item.id]: res.url!,
                                    }));
                                  }}
                                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3.5 py-1.5 text-xs font-bold text-[#111827]"
                                >
                                  Lihat Foto KTM
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  setAdminError("");
                                  const res = await approveKtm(item.id);
                                  if (!res.ok) {
                                    setAdminError(
                                      res.error ?? "Gagal menyetujui KTM."
                                    );
                                    return;
                                  }
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
                                className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  setAdminError("");
                                  const reason =
                                    rejectReasons[item.id]?.trim() ||
                                    "Foto KTM buram atau NIM tidak terbaca jelas.";
                                  const res = await rejectKtm(item.id, reason);
                                  if (!res.ok) {
                                    setAdminError(
                                      res.error ?? "Gagal menolak KTM."
                                    );
                                    return;
                                  }
                                  setAdminNotice(
                                    `KTM ${item.nim} ditolak dengan alasan tercatat.`
                                  );
                                }}
                                className="inline-flex min-h-11 items-center rounded-xl border border-[#991B1B] bg-white px-4 py-1.5 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {(activeTab === "semua" ||
              activeTab === "laporan" ||
              activeTab === "spot") && (
              <div
                className={`space-y-6 ${
                  activeTab === "semua" ? "lg:col-span-5" : "lg:col-span-12"
                }`}
              >
                {(activeTab === "semua" || activeTab === "laporan") && (
                  <section
                    aria-labelledby="judul-moderasi"
                    className="space-y-3 rounded-2xl border-2 border-[#111827] bg-white p-5"
                  >
                    <h2
                      id="judul-moderasi"
                      className="text-lg font-extrabold text-[#111827]"
                    >
                      Moderasi Laporan
                    </h2>
                    {reports.length === 0 ? (
                      <p className="rounded-xl border border-[#111827]/20 bg-[#F8FAFC] p-4 text-xs font-semibold text-[#475569]">
                        Belum ada laporan pelanggaran masuk.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {reports.map((rep) => (
                          <li
                            key={rep.id}
                            className="space-y-2 rounded-xl border border-[#111827]/25 bg-[#F8FAFC] p-3.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-[#111827]">
                                [{rep.targetType}] {rep.targetTitle}
                              </span>
                              <span className="rounded border border-[#111827]/40 bg-white px-2 py-0.5 font-extrabold">
                                {rep.status}
                              </span>
                            </div>
                            <p className="font-medium text-[#334155]">{rep.reason}</p>
                            {rep.status === "Baru" && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {rep.targetType === "Listing" && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setAdminError("");
                                      const res = await resolveReport(
                                        rep.id,
                                        "hide"
                                      );
                                      if (!res.ok) {
                                        setAdminError(
                                          res.error ??
                                            "Gagal menyembunyikan listing."
                                        );
                                        return;
                                      }
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
                                  onClick={async () => {
                                    setAdminError("");
                                    const res = await resolveReport(
                                      rep.id,
                                      "dismiss"
                                    );
                                    if (!res.ok) {
                                      setAdminError(
                                        res.error ?? "Gagal menandai laporan."
                                      );
                                      return;
                                    }
                                    setAdminNotice(
                                      `Laporan "${rep.targetTitle}" ditandai Selesai.`
                                    );
                                  }}
                                  className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827]"
                                >
                                  Tandai Selesai
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {(activeTab === "semua" || activeTab === "spot") && (
                  <section
                    aria-labelledby="judul-spot-admin"
                    className="space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-5"
                  >
                    <h2
                      id="judul-spot-admin"
                      className="text-lg font-extrabold text-[#111827]"
                    >
                      Daftar Spot COD Kampus
                    </h2>
                    <ul className="space-y-2">
                      {codSpots.map((spot) => (
                        <li
                          key={spot.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-[#111827]/25 bg-white px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-[#111827]">
                              {spot.name}
                            </p>
                            <p className="text-[11px] font-medium text-[#475569]">
                              {spot.hours}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              setAdminError("");
                              const res = await toggleCodSpot(spot.id);
                              if (!res.ok) {
                                setAdminError(
                                  res.error ?? "Gagal mengubah status Spot COD."
                                );
                              }
                            }}
                            aria-pressed={spot.active}
                            className={`min-h-11 rounded-full border-2 border-[#111827] px-3.5 text-xs font-extrabold ${
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
                )}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
