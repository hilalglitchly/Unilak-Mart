"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getAdminKtmSignedUrlAction } from "@/app/admin/actions";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  EN_CATEGORY_LABELS,
  EN_KTM_STATUS_LABELS,
  getDisplayLabel,
  type CategoryId,
} from "@/lib/preview-data";

type AdminTab = "semua" | "ktm" | "laporan" | "pengguna" | "spot";

const EN_REPORT_STATUS: Record<string, string> = {
  Baru: "New",
  Disembunyikan: "Hidden",
  Selesai: "Resolved",
};

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
    addCodSpot,
    categoryRefs,
    toggleCategoryActive,
    adminUsers,
    toggleUserUmkm,
    toggleUserSuspended,
    runMaintenance,
    locale,
  } = useMarketplace();
  const isEn = locale === "en";

  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [adminNotice, setAdminNotice] = useState("");
  const [adminError, setAdminError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("semua");
  const [userSearch, setUserSearch] = useState("");
  const [spotName, setSpotName] = useState("");
  const [spotLocation, setSpotLocation] = useState("");
  const [spotHours, setSpotHours] = useState("08.00 - 17.00 WIB");
  const [maintLoading, setMaintLoading] = useState(false);

  const isNonAdminSignedUser =
    Boolean(authUserId) && profile.systemRole !== "admin";

  const activeListingCount = products.filter((p) => !p.hidden).length;
  const pendingKtmCount = ktmQueue.filter((q) => q.status === "Menunggu").length;
  const openReportCount = reports.filter((r) => r.status === "Baru").length;
  const verifiedUserCount = adminUsers.filter(
    (u) => u.ktmStatus === "Terverifikasi" && !u.deletedAt
  ).length;
  const filteredUsers = adminUsers.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.nim.toLowerCase().includes(q) ||
      u.faculty.toLowerCase().includes(q)
    );
  });

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
            {isEn ? "UnilakMart Administrator Panel" : "Panel Administrator UnilakMart"}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#475569]">
            {authUserId
              ? isEn
                ? "Direct moderation connected to Supabase PostgreSQL database & private KTM bucket."
                : "Moderasi langsung ke database PostgreSQL Supabase & bucket privat KTM."
              : isEn
                ? "Guest preview mode. Sign in with an Administrator account to process live KTM requests."
                : "Mode pratinjau tamu. Masuk sebagai akun Administrator untuk memproses antrean KTM riil."}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#F8FAFC]"
        >
          {isEn ? "Back to Home" : "Kembali ke Beranda"}
        </Link>
      </div>

      {isNonAdminSignedUser ? (
        <section
          role="alert"
          className="space-y-3 rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-6"
        >
          <h2 className="text-lg font-extrabold text-[#991B1B]">
            {isEn ? "Administrator Access Only" : "Akses Khusus Administrator"}
          </h2>
          <p className="text-xs font-semibold leading-relaxed text-[#111827]">
            {isEn ? (
              <>
                The active account ({profile.email}) is a standard student role (
                <code>system_role = &apos;user&apos;</code>). Per security design,
                moderation tools can only be opened by a designated Administrator in{" "}
                <code>public.profiles</code>.
              </>
            ) : (
              <>
                Akun aktif ({profile.email}) berperan sebagai mahasiswa biasa (
                <code>system_role = &apos;user&apos;</code>). Sesuai rancangan keamanan,
                halaman moderasi hanya dapat dibuka oleh akun Administrator yang ditunjuk di
                tabel <code>public.profiles</code>.
              </>
            )}
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
                {isEn ? "Users:" : "Pengguna:"}{" "}
                <strong className="text-[#111827]">{adminUsers.length}</strong>{" "}
                <span className="text-[#15803D]">
                  ({verifiedUserCount} {isEn ? "Verif" : "Verif"})
                </span>
              </span>
              <span>
                {isEn ? "Active Listings:" : "Listing Aktif:"}{" "}
                <strong className="text-[#15803D]">{activeListingCount}</strong>
              </span>
              <span>
                {isEn ? "KTM Queue:" : "Antrean KTM:"}{" "}
                <strong className="text-[#111827]">{pendingKtmCount}</strong>
              </span>
              <span>
                {isEn ? "COD Orders:" : "Pesanan COD:"}{" "}
                <strong className="text-[#111827]">{orders.length}</strong>
              </span>
              <span>
                {isEn ? "New Reports:" : "Laporan Baru:"}{" "}
                <strong className="text-[#991B1B]">{openReportCount}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={maintLoading}
                onClick={async () => {
                  setAdminError("");
                  setAdminNotice("");
                  setMaintLoading(true);
                  try {
                    const res = await runMaintenance();
                    if (!res.ok) {
                      setAdminError(
                        res.error ??
                          (isEn
                            ? "Failed to run automated maintenance."
                            : "Gagal menjalankan pemeliharaan otomatis.")
                      );
                      return;
                    }
                    const s = res.summary;
                    setAdminNotice(
                      isEn
                        ? `Maintenance done: ${s?.expiredOrders ?? 0} expired (24h), ${s?.completedOrders ?? 0} auto-completed (48h), ${s?.deletedRejectedKtmFiles ?? 0} rejected KTM files (>7d) deleted.`
                        : `Pemeliharaan selesai: ${s?.expiredOrders ?? 0} kedaluwarsa (24j), ${s?.completedOrders ?? 0} selesai otomatis (48j), ${s?.deletedRejectedKtmFiles ?? 0} berkas KTM ditolak (>7h) dihapus.`
                    );
                  } finally {
                    setMaintLoading(false);
                  }
                }}
                className="min-h-11 rounded-xl border-2 border-[#111827] bg-[#FEF9C3] px-3 text-xs font-extrabold text-[#111827] hover:bg-[#FEF08A] disabled:opacity-60"
              >
                {maintLoading
                  ? isEn
                    ? "Running..."
                    : "Memproses..."
                  : isEn
                    ? "Run Maintenance (24h/48h/KTM)"
                    : "Jalankan Pemeliharaan (24j/48j/KTM)"}
              </button>

              <div
                role="tablist"
                aria-label={isEn ? "Admin section filter" : "Filter bagian admin"}
                className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap"
              >
                {(
                  [
                    { id: "semua", label: isEn ? "All" : "Semua" },
                    {
                      id: "ktm",
                      label: isEn
                        ? `KTM Queue (${pendingKtmCount})`
                        : `Antrean KTM (${pendingKtmCount})`,
                    },
                    {
                      id: "laporan",
                      label: isEn
                        ? `Reports (${openReportCount})`
                        : `Laporan (${openReportCount})`,
                    },
                    {
                      id: "pengguna",
                      label: isEn
                        ? `Users (${adminUsers.length})`
                        : `Pengguna (${adminUsers.length})`,
                    },
                    {
                      id: "spot",
                      label: isEn ? "COD Spots & Categories" : "Spot COD & Kategori",
                    },
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
          </div>

          {adminError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3.5 text-xs font-extrabold text-[#991B1B]"
            >
              {isEn ? "Notice:" : "Perhatian:"} {adminError}
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
                  {isEn ? "KTM Photo Verification Queue" : "Antrean Verifikasi Foto KTM"}
                </h2>

                {ktmQueue.length === 0 ? (
                  <p className="rounded-xl border border-[#111827]/20 bg-[#F8FAFC] p-4 text-xs font-semibold text-[#475569]">
                    {isEn
                      ? "No KTM verification requests in the queue yet."
                      : "Belum ada antrean verifikasi KTM yang masuk."}
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
                              {item.prodi} ({item.faculty}) • {isEn ? "File:" : "Berkas:"}{" "}
                              <code>{item.photoLabel}</code>
                            </p>
                          </div>
                          <span className="rounded-md border border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold">
                            {getDisplayLabel(locale, item.status, EN_KTM_STATUS_LABELS)}
                          </span>
                        </div>

                        {signedUrls[item.id] && (
                          <div className="rounded-xl border border-[#111827]/30 bg-white p-2">
                            <Image
                              unoptimized
                              src={signedUrls[item.id]}
                              alt={isEn ? `KTM photo NIM ${item.nim}` : `Foto KTM NIM ${item.nim}`}
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
                            {isEn ? "Rejection reason:" : "Alasan ditolak:"} {item.rejectionReason}
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
                                        res.error ??
                                          (isEn
                                            ? "Failed to load KTM signed URL."
                                            : "Gagal memuat signed URL KTM.")
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
                                  {isEn ? "View KTM Photo" : "Lihat Foto KTM"}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  setAdminError("");
                                  const res = await approveKtm(item.id);
                                  if (!res.ok) {
                                    setAdminError(
                                      res.error ??
                                        (isEn ? "Failed to approve KTM." : "Gagal menyetujui KTM.")
                                    );
                                    return;
                                  }
                                  setAdminNotice(
                                    isEn
                                      ? `KTM ${item.nim} approved and photo automatically removed from the private bucket.`
                                      : `KTM ${item.nim} disetujui dan foto otomatis dihapus dari bucket privat.`
                                  );
                                }}
                                className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white"
                              >
                                {isEn ? "Approve & Auto-Delete Photo" : "Setujui & Hapus Foto Otomatis"}
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <label htmlFor={`tolak-${item.id}`} className="sr-only">
                                {isEn
                                  ? `Rejection reason for ${item.nim}`
                                  : `Alasan penolakan untuk ${item.nim}`}
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
                                placeholder={
                                  isEn
                                    ? "Enter rejection reason if declining..."
                                    : "Isi alasan penolakan jika ditolak..."
                                }
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
                                      res.error ??
                                        (isEn ? "Failed to reject KTM." : "Gagal menolak KTM.")
                                    );
                                    return;
                                  }
                                  setAdminNotice(
                                    isEn
                                      ? `KTM ${item.nim} rejected with logged reason.`
                                      : `KTM ${item.nim} ditolak dengan alasan tercatat.`
                                  );
                                }}
                                className="inline-flex min-h-11 items-center rounded-xl border border-[#991B1B] bg-white px-4 py-1.5 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
                              >
                                {isEn ? "Reject" : "Tolak"}
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
                      {isEn ? "Report Moderation" : "Moderasi Laporan"}
                    </h2>
                    {reports.length === 0 ? (
                      <p className="rounded-xl border border-[#111827]/20 bg-[#F8FAFC] p-4 text-xs font-semibold text-[#475569]">
                        {isEn
                          ? "No violation reports submitted yet."
                          : "Belum ada laporan pelanggaran masuk."}
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
                                {getDisplayLabel(locale, rep.status, EN_REPORT_STATUS)}
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
                                            (isEn
                                              ? "Failed to hide listing."
                                              : "Gagal menyembunyikan listing.")
                                        );
                                        return;
                                      }
                                      setAdminNotice(
                                        isEn
                                          ? `Listing "${rep.targetTitle}" hidden from public catalog.`
                                          : `Listing "${rep.targetTitle}" disembunyikan dari katalog publik.`
                                      );
                                    }}
                                    className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-3.5 text-xs font-bold text-white"
                                  >
                                    {isEn ? "Hide Listing" : "Sembunyikan Listing"}
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
                                        res.error ??
                                          (isEn
                                            ? "Failed to resolve report."
                                            : "Gagal menandai laporan.")
                                      );
                                      return;
                                    }
                                    setAdminNotice(
                                      isEn
                                        ? `Report "${rep.targetTitle}" marked Resolved.`
                                        : `Laporan "${rep.targetTitle}" ditandai Selesai.`
                                    );
                                  }}
                                  className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827]"
                                >
                                  {isEn ? "Mark Resolved" : "Tandai Selesai"}
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
                    className="space-y-4 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-5"
                  >
                    <h2
                      id="judul-spot-admin"
                      className="text-lg font-extrabold text-[#111827]"
                    >
                      {isEn
                        ? "Campus COD Spots & Catalog Categories"
                        : "Daftar Spot COD Kampus & Kategori"}
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
                              {spot.location} • {spot.hours}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              setAdminError("");
                              const res = await toggleCodSpot(spot.id);
                              if (!res.ok) {
                                setAdminError(
                                  res.error ??
                                    (isEn
                                      ? "Failed to toggle COD spot status."
                                      : "Gagal mengubah status Spot COD.")
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
                            {spot.active ? (isEn ? "Active" : "Aktif") : isEn ? "Inactive" : "Nonaktif"}
                          </button>
                        </li>
                      ))}
                    </ul>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAdminError("");
                        setAdminNotice("");
                        const res = await addCodSpot({
                          name: spotName,
                          location: spotLocation,
                          hours: spotHours,
                        });
                        if (!res.ok) {
                          setAdminError(
                            res.error ??
                              (isEn ? "Failed to add COD spot." : "Gagal menambah Spot COD.")
                          );
                          return;
                        }
                        setSpotName("");
                        setSpotLocation("");
                        setAdminNotice(
                          isEn
                            ? "New campus COD spot added."
                            : "Spot COD kampus baru berhasil ditambahkan."
                        );
                      }}
                      className="space-y-2 rounded-xl border border-[#111827]/25 bg-white p-3.5 text-xs"
                    >
                      <p className="font-extrabold text-[#111827]">
                        {isEn ? "+ Add New COD Spot (FR-19)" : "+ Tambah Spot COD Baru (FR-19)"}
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <input
                          type="text"
                          value={spotName}
                          onChange={(e) => setSpotName(e.target.value)}
                          placeholder={
                            isEn ? "Spot name (e.g. Rectorate Lobby)" : "Nama spot (mis. Lobi Rektorat)"
                          }
                          aria-label={isEn ? "New COD spot name" : "Nama Spot COD baru"}
                          className="min-h-11 rounded-xl border border-[#111827] px-2.5 text-xs font-medium"
                        />
                        <input
                          type="text"
                          value={spotLocation}
                          onChange={(e) => setSpotLocation(e.target.value)}
                          placeholder={isEn ? "Building location detail" : "Detail lokasi gedung"}
                          aria-label={isEn ? "New COD spot location detail" : "Detail lokasi Spot COD baru"}
                          className="min-h-11 rounded-xl border border-[#111827] px-2.5 text-xs font-medium"
                        />
                        <input
                          type="text"
                          value={spotHours}
                          onChange={(e) => setSpotHours(e.target.value)}
                          placeholder={isEn ? "Operating hours" : "Jam layanan"}
                          aria-label={isEn ? "New COD spot hours" : "Jam layanan Spot COD baru"}
                          className="min-h-11 rounded-xl border border-[#111827] px-2.5 text-xs font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="min-h-11 rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 text-xs font-extrabold text-[#111827]"
                      >
                        {isEn ? "Save COD Spot" : "Simpan Spot COD"}
                      </button>
                    </form>

                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-extrabold text-[#111827]">
                        {isEn ? "Catalog Category Status (FR-48)" : "Status Kategori Katalog (FR-48)"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categoryRefs.map((cat) => (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={async () => {
                              setAdminError("");
                              const res = await toggleCategoryActive(cat.slug);
                              if (!res.ok) {
                                setAdminError(
                                  res.error ??
                                    (isEn
                                      ? "Failed to toggle category status."
                                      : "Gagal mengubah status kategori.")
                                );
                              }
                            }}
                            aria-pressed={cat.active}
                            className={`min-h-11 rounded-xl border-2 border-[#111827] px-3 text-xs font-bold ${
                              cat.active
                                ? "bg-white text-[#14532D]"
                                : "bg-[#E2E8F0] text-[#475569] line-through"
                            }`}
                          >
                            {isEn ? EN_CATEGORY_LABELS[cat.slug as CategoryId] ?? cat.name : cat.name}:{" "}
                            {cat.active ? (isEn ? "Active" : "Aktif") : isEn ? "Inactive" : "Nonaktif"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {(activeTab === "semua" || activeTab === "pengguna") && (
            <section
              aria-labelledby="judul-pengguna-admin"
              className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    id="judul-pengguna-admin"
                    className="text-lg font-extrabold text-[#111827]"
                  >
                    {isEn
                      ? "Manage Users, UMKM Sellers & Suspensions (FR-47, FR-48)"
                      : "Kelola Pengguna, Penjual UMKM, & Penangguhan (FR-47, FR-48)"}
                  </h2>
                  <p className="text-xs font-medium text-[#475569]">
                    {isEn
                      ? "Mark official UMKM sellers or suspend accounts for policy/no-show violations."
                      : "Tandai penjual UMKM resmi atau tangguhkan akun pelanggar aturan/no-show."}
                  </p>
                </div>
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={
                    isEn ? "Search name, NIM, or faculty..." : "Cari nama, NIM, atau fakultas..."
                  }
                  aria-label={isEn ? "Search student accounts" : "Cari akun mahasiswa"}
                  className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-sm font-medium sm:w-64"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <p className="rounded-xl border border-[#111827]/20 bg-[#F8FAFC] p-4 text-xs font-semibold text-[#475569]">
                  {isEn
                    ? "No accounts match your search filter."
                    : "Tidak ada akun yang cocok dengan filter pencarian."}
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {filteredUsers.map((u) => (
                    <li
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#111827]/25 bg-[#F8FAFC] p-3.5 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-extrabold text-[#111827]">
                            {u.name}
                          </span>
                          <span className="rounded border border-[#111827]/30 bg-white px-2 py-0.5 text-[11px] font-bold">
                            NIM {u.nim}
                          </span>
                          <span className="rounded border border-[#111827]/30 bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#14532D]">
                            {getDisplayLabel(locale, u.ktmStatus, EN_KTM_STATUS_LABELS)}
                          </span>
                          {u.isUmkm && (
                            <span className="rounded border border-[#111827] bg-[#FACC15] px-2 py-0.5 text-[11px] font-extrabold">
                              UMKM
                            </span>
                          )}
                          {u.isSuspended && (
                            <span className="rounded border border-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-extrabold text-[#991B1B]">
                              {isEn ? "Suspended" : "Ditangguhkan"}
                            </span>
                          )}
                          {u.systemRole === "admin" && (
                            <span className="rounded border border-[#111827] bg-[#111827] px-2 py-0.5 text-[11px] font-extrabold text-white">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-[#475569]">
                          {u.prodi} ({u.faculty}) • {u.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setAdminError("");
                            setAdminNotice("");
                            const res = await toggleUserUmkm(u.id);
                            if (!res.ok) {
                              setAdminError(
                                res.error ??
                                  (isEn
                                    ? "Failed to update account UMKM status."
                                    : "Gagal mengubah status UMKM akun.")
                              );
                              return;
                            }
                            setAdminNotice(
                              isEn
                                ? `UMKM status updated for ${u.name}.`
                                : `Status UMKM untuk ${u.name} diperbarui.`
                            );
                          }}
                          className={`min-h-11 rounded-xl border-2 border-[#111827] px-3.5 text-xs font-bold ${
                            u.isUmkm
                              ? "bg-[#FEF9C3] text-[#111827]"
                              : "bg-white text-[#111827]"
                          }`}
                        >
                          {u.isUmkm
                            ? isEn
                              ? "Revoke UMKM"
                              : "Cabut UMKM"
                            : isEn
                              ? "Mark UMKM"
                              : "Tandai UMKM"}
                        </button>
                        <button
                          type="button"
                          disabled={u.systemRole === "admin"}
                          onClick={async () => {
                            setAdminError("");
                            setAdminNotice("");
                            const res = await toggleUserSuspended(u.id);
                            if (!res.ok) {
                              setAdminError(
                                res.error ??
                                  (isEn
                                    ? "Failed to update suspension status."
                                    : "Gagal mengubah status penangguhan.")
                              );
                              return;
                            }
                            setAdminNotice(
                              u.isSuspended
                                ? isEn
                                  ? `Account ${u.name} reactivated.`
                                  : `Akun ${u.name} diaktifkan kembali.`
                                : isEn
                                  ? `Account ${u.name} temporarily suspended.`
                                  : `Akun ${u.name} ditangguhkan sementara.`
                            );
                          }}
                          className={`min-h-11 rounded-xl border-2 px-3.5 text-xs font-bold disabled:opacity-40 ${
                            u.isSuspended
                              ? "border-[#15803D] bg-[#15803D] text-white"
                              : "border-[#991B1B] bg-white text-[#991B1B] hover:bg-[#FEF2F2]"
                          }`}
                        >
                          {u.isSuspended
                            ? isEn
                              ? "Activate Account"
                              : "Aktifkan Akun"
                            : isEn
                              ? "Suspend Account"
                              : "Tangguhkan Akun"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
