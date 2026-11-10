"use client";

import Link from "next/link";
import { useState } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { FACULTIES, type KtmStatus } from "@/lib/preview-data";

const KTM_STATUS_STEPS: KtmStatus[] = [
  "Belum Verifikasi",
  "Menunggu",
  "Terverifikasi",
  "Ditolak",
];

export default function ProfilPage() {
  const { profile, updateProfile, submitKtmVerification, deleteOwnAccount } =
    useMarketplace();

  const [nim, setNim] = useState(profile.nim);
  const [name, setName] = useState(profile.name);
  const [prodi, setProdi] = useState(profile.prodi);
  const [faculty, setFaculty] = useState(profile.faculty);
  const [email, setEmail] = useState(profile.email);
  const [wa, setWa] = useState(profile.wa);
  const [pdpConsent, setPdpConsent] = useState(profile.pdpConsent);
  const [photoName, setPhotoName] = useState(profile.ktmPhotoName ?? "");
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleSubmitKtm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim.trim() || !wa.trim() || !email.trim()) {
      setFormError("Mohon lengkapi NIM, email aktif, dan nomor WhatsApp.");
      return;
    }
    if (!pdpConsent) {
      setFormError(
        "Persetujuan UU PDP wajib dicentang (FR-01): nomor WhatsApp dibagikan hanya saat status pesanan Dijadwalkan."
      );
      return;
    }
    updateProfile({ name: name.trim() || profile.name });
    submitKtmVerification({
      nim: nim.trim(),
      wa: wa.trim(),
      email: email.trim(),
      faculty,
      prodi: prodi.trim() || "Teknik Informatika",
      pdpConsent,
      photoName,
    });
    setFormError("");
    setSaveMessage(
      "Pengajuan verifikasi KTM dikirim ke antrean Admin. Cek status atau proses persetujuan di /admin."
    );
  };

  const handleSaveProfileOnly = () => {
    updateProfile({
      name: name.trim() || profile.name,
      prodi: prodi.trim() || profile.prodi,
      faculty,
    });
    setSaveMessage("Data profil tampilan diperbarui.");
  };

  const handleDeleteAccount = () => {
    const res = deleteOwnAccount();
    if (!res.ok) {
      setDeleteError(res.error ?? "Gagal menghapus akun.");
      return;
    }
    setDeleteError("");
    setDeleteSuccess(true);
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block rounded-md border-2 border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold text-[#111827]">
            VERIFIKASI MAHASISWA &amp; PRIVASI UU PDP
          </span>
          <h1 className="mt-1.5 text-2xl font-extrabold text-[#111827] sm:text-3xl">
            Profil Mahasiswa &amp; Status KTM
          </h1>
        </div>

        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#111827] px-4 py-2 text-xs font-bold text-[#FACC15]"
        >
          Buka Panel Administrator R1
        </Link>
      </div>

      {/* 4 Status KTM FR-02 */}
      <section
        aria-label="Status verifikasi KTM"
        className="space-y-3 rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-5 shadow-[4px_4px_0px_#111827]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-[#111827]">
            Status Akun Saat Ini: {profile.ktmStatus}
          </h2>
          {profile.deletedAt && (
            <span className="rounded-md border border-[#991B1B] bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-bold text-[#991B1B]">
              Akun Dianonimkan (FR-08)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {KTM_STATUS_STEPS.map((st) => (
            <div
              key={st}
              className={`rounded-xl border-2 px-3 py-2 text-xs font-extrabold ${
                profile.ktmStatus === st
                  ? "border-[#111827] bg-[#15803D] text-white"
                  : "border-[#111827]/25 bg-white text-[#334155]"
              }`}
            >
              {st}
            </div>
          ))}
        </div>

        {profile.ktmReason && (
          <p className="rounded-xl border border-[#991B1B] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]">
            Alasan Penolakan Admin: {profile.ktmReason} (Foto dihapus maksimal 7 hari
            setelah ditolak).
          </p>
        )}

        <p className="text-xs font-medium text-[#334155]">
          Foto KTM disimpan di bucket privat <code>ktm-documents</code> dan langsung
          dihapus otomatis segera setelah verifikasi disetujui (NFR-07).
        </p>
      </section>

      {/* Form Pendaftaran / Pengajuan Verifikasi KTM */}
      <form
        onSubmit={handleSubmitKtm}
        className="space-y-4 rounded-3xl border-[3px] border-[#111827] bg-white p-6 shadow-[5px_5px_0px_#111827]"
        noValidate
      >
        <h2 className="text-lg font-extrabold text-[#111827]">
          Data Identitas &amp; Unggah Foto KTM Unilak
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profil-nama"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Nama Tampilan (Sesuai KTM)
            </label>
            <input
              id="profil-nama"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="profil-nim"
              className="block text-xs font-extrabold text-[#111827]"
            >
              NIM Mahasiswa Aktif Unilak (Satu NIM, Satu Akun)
            </label>
            <input
              id="profil-nim"
              type="text"
              inputMode="numeric"
              value={nim}
              onChange={(e) => {
                setNim(e.target.value);
                setFormError("");
              }}
              placeholder="Masukkan NIM sesuai Kartu Tanda Mahasiswa"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profil-fakultas"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Fakultas
            </label>
            <select
              id="profil-fakultas"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold sm:text-sm"
            >
              {FACULTIES.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="profil-prodi"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Program Studi
            </label>
            <input
              id="profil-prodi"
              type="text"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profil-email"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Email Aktif (Verifikasi Wajib FR-01)
            </label>
            <input
              id="profil-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError("");
              }}
              placeholder="nama@email.com"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="profil-wa"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Nomor WhatsApp Aktif
            </label>
            <input
              id="profil-wa"
              type="tel"
              autoComplete="tel"
              value={wa}
              onChange={(e) => {
                setWa(e.target.value);
                setFormError("");
              }}
              placeholder="Contoh: 0812xxxxxxxx"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="foto-ktm"
            className="block text-xs font-extrabold text-[#111827]"
          >
            Unggah Foto KTM Unilak (Bucket Privat)
          </label>
          <input
            id="foto-ktm"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPhotoName(e.target.files?.[0]?.name ?? "ktm-preview.jpg")
            }
            className="mt-1 block min-h-11 w-full rounded-xl border-2 border-[#111827] bg-[#F8FAFC] p-2 text-sm font-semibold"
          />
          {photoName && (
            <p className="mt-1 text-xs font-bold text-[#15803D]">
              Berkas siap diunggah: {photoName}
            </p>
          )}
        </div>

        <label className="flex min-h-11 items-start gap-3 rounded-2xl border-2 border-[#111827] bg-[#FEF9C3] p-3.5 text-xs font-semibold leading-snug text-[#111827]">
          <input
            type="checkbox"
            checked={pdpConsent}
            onChange={(e) => {
              setPdpConsent(e.target.checked);
              setFormError("");
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#15803D]"
          />
          <span>
            Saya menyetujui ketentuan UU No. 27 Tahun 2022 (UU PDP) bahwa nomor WhatsApp
            saya baru dibagikan kepada lawan transaksi setelah status pesanan{" "}
            <strong>Dijadwalkan</strong>.
          </span>
        </label>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
          >
            Perhatian: {formError}
          </div>
        )}

        {saveMessage && (
          <div
            role="status"
            className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3 text-xs font-bold text-[#14532D]"
          >
            {saveMessage}
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeleteSuccess(false);
              setDeleteModalOpen(true);
            }}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#991B1B] bg-[#FEF2F2] px-4 py-2 text-xs font-bold text-[#991B1B]"
          >
            Hapus Akun Mandiri (FR-08)
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveProfileOnly}
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
            >
              Simpan Perubahan Profil
            </button>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827]"
            >
              Ajukan Verifikasi KTM
            </button>
          </div>
        </div>
      </form>

      {/* Dialog Hapus Akun Mandiri FR-08 */}
      <ModalDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        titleId="judul-hapus-akun"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-hapus-akun" className="text-lg font-extrabold text-[#111827]">
            Konfirmasi Hapus Akun Mandiri (FR-08)
          </h2>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(false)}
            aria-label="Tutup dialog hapus akun"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {deleteSuccess ? (
            <div role="status" className="rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4">
              <p className="text-sm font-extrabold text-[#15803D]">
                Akun berhasil dianonimkan (UU PDP).
              </p>
              <p className="mt-1 text-xs font-medium text-[#111827]">
                Data pribadi (nama, NIM, email, dan WhatsApp) dihapus sambil menjaga
                integritas riwayat transaksi selesai.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium leading-relaxed text-[#334155]">
                Sesuai ketentuan UU PDP, Anda dapat menghapus akun dan menganonimkan PII
                hanya bila tidak ada pesanan aktif yang sedang berlangsung.
              </p>
              {deleteError && (
                <div
                  role="alert"
                  className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
                >
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-5 text-xs font-bold text-white"
                >
                  Hapus &amp; Anonimkan Akun
                </button>
              </div>
            </>
          )}
        </div>
      </ModalDialog>
    </main>
  );
}

