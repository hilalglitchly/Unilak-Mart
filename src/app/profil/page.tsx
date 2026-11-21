"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  FACULTIES,
  formatRupiah,
  type KtmStatus,
  type UserProfile,
} from "@/lib/preview-data";

function RecoveryModeNotice() {
  const params = useSearchParams();
  if (params.get("mode") !== "reset-sandi") return null;

  return (
    <div
      role="status"
      className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3 text-xs font-extrabold text-[#14532D]"
    >
      Tautan pemulihan kata sandi terverifikasi. Silakan ketik kata sandi baru Anda di
      bawah ini.
    </div>
  );
}

function PasswordChangeCard({ authUserId }: { authUserId: string | null }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdNotice, setPwdNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdNotice("");
    if (newPassword.length < 8) {
      setPwdError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Konfirmasi kata sandi belum cocok.");
      return;
    }

    setSaving(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const activeUser = authUserId
          ? { id: authUserId }
          : (await supabase.auth.getUser()).data.user;

        if (activeUser) {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            setPwdError(error.message);
            return;
          }
          setPwdError("");
          setNewPassword("");
          setConfirmPassword("");
          setPwdNotice("Kata sandi akun berhasil diperbarui di Supabase Auth.");
          return;
        }
      }

      setPwdError("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdNotice(
        "Mode pratinjau tamu: pembaruan kata sandi tervalidasi lokal. Masuk via /masuk untuk menyimpan ke Supabase Auth."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="ubah-sandi"
      aria-labelledby="judul-ubah-sandi"
      className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
    >
      <div>
        <h2 id="judul-ubah-sandi" className="text-lg font-extrabold text-[#111827]">
          Keamanan Akun &amp; Ubah Kata Sandi
        </h2>
        <p className="text-xs font-medium text-[#475569]">
          Perbarui kata sandi akun Anda secara berkala atau setelah membuka tautan Lupa
          Sandi dari email.
        </p>
      </div>

      <Suspense fallback={null}>
        <RecoveryModeNotice />
      </Suspense>

      <form onSubmit={handlePasswordSubmit} className="space-y-3" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profil-pwd-baru"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Kata Sandi Baru (min. 8 karakter)
            </label>
            <input
              id="profil-pwd-baru"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwdError("");
              }}
              placeholder="Minimal 8 karakter"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="profil-pwd-konfirm"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Ulangi Kata Sandi Baru
            </label>
            <input
              id="profil-pwd-konfirm"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwdError("");
              }}
              placeholder="Ketik ulang kata sandi baru"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="min-h-11 rounded-xl border border-[#111827]/30 bg-[#F8FAFC] px-3 text-xs font-bold text-[#111827]"
          >
            {showPwd ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-full border-2 border-[#111827] bg-[#15803D] px-5 text-xs font-bold text-white hover:bg-[#166534] disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Perbarui Kata Sandi"}
          </button>
        </div>

        {pwdError && (
          <div
            role="alert"
            className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
          >
            Perhatian: {pwdError}
          </div>
        )}
        {pwdNotice && (
          <div
            role="status"
            className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3 text-xs font-bold text-[#14532D]"
          >
            {pwdNotice}
          </div>
        )}
      </form>
    </section>
  );
}

const KTM_STATUS_STEPS: KtmStatus[] = [
  "Belum Verifikasi",
  "Menunggu",
  "Terverifikasi",
  "Ditolak",
];

function ProfilIdentityForm({
  profile,
  authUserId,
  onSaveProfile,
  onSubmitKtm,
  onOpenDelete,
}: {
  profile: UserProfile;
  authUserId: string | null;
  onSaveProfile: (patch: Partial<UserProfile>) => Promise<void> | void;
  onSubmitKtm: (input: {
    nim: string;
    name?: string;
    wa: string;
    email: string;
    faculty: string;
    prodi: string;
    pdpConsent: boolean;
    photoName: string;
    photoFile?: File | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  onOpenDelete: () => void;
}) {
  const [nim, setNim] = useState(profile.nim);
  const [name, setName] = useState(profile.name);
  const [prodi, setProdi] = useState(profile.prodi);
  const [faculty, setFaculty] = useState(profile.faculty);
  const [email, setEmail] = useState(profile.email);
  const [wa, setWa] = useState(profile.wa);
  const [pdpConsent, setPdpConsent] = useState(profile.pdpConsent);
  const [photoName, setPhotoName] = useState(profile.ktmPhotoName ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitKtm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage("");
    if (!nim.trim() || !wa.trim() || !email.trim()) {
      setFormError("Mohon lengkapi NIM, email aktif, dan nomor WhatsApp.");
      return;
    }
    if (authUserId && !photoFile && !profile.ktmPhotoName) {
      setFormError("Pilih file foto KTM Unilak terlebih dahulu untuk diunggah ke bucket privat.");
      return;
    }
    if (!pdpConsent) {
      setFormError(
        "Persetujuan UU PDP wajib dicentang: nomor WhatsApp dibagikan hanya saat status pesanan Dijadwalkan."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmitKtm({
        nim: nim.trim(),
        name: name.trim() || profile.name,
        wa: wa.trim(),
        email: email.trim(),
        faculty,
        prodi: prodi.trim() || "Teknik Informatika",
        pdpConsent,
        photoName,
        photoFile,
      });
      if (!res.ok) {
        setFormError(res.error ?? "Gagal mengirim verifikasi KTM.");
        return;
      }
      setFormError("");
      setSaveMessage(
        authUserId
          ? "Foto KTM berhasil diunggah ke bucket privat dan pengajuan verifikasi tersimpan di Supabase."
          : "Pengajuan verifikasi KTM dikirim ke antrean Admin. Cek status atau proses persetujuan di /admin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfileOnly = async () => {
    setFormError("");
    await onSaveProfile({
      name: name.trim() || profile.name,
      prodi: prodi.trim() || profile.prodi,
      faculty,
      wa: wa.trim() || profile.wa,
    });
    setSaveMessage(
      authUserId
        ? "Data profil tampilan tersimpan ke database Supabase."
        : "Data profil tampilan diperbarui."
    );
  };

  return (
    <form
      onSubmit={handleSubmitKtm}
      className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
      noValidate
    >
      <h2 className="text-lg font-extrabold text-[#111827]">
        Data Identitas &amp; Unggah Foto KTM
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
            Email Aktif
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
          onChange={(e) => {
            const picked = e.target.files?.[0] ?? null;
            setPhotoFile(picked);
            setPhotoName(picked?.name ?? "ktm-preview.jpg");
            setFormError("");
          }}
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

      <div className="flex flex-wrap justify-between gap-3 border-t border-[#111827]/15 pt-4">
        <button
          type="button"
          onClick={onOpenDelete}
          className="inline-flex min-h-11 items-center rounded-xl border border-[#991B1B]/60 bg-white px-4 py-2 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
        >
          Hapus Akun Mandiri
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSaveProfileOnly()}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
          >
            Simpan Perubahan Profil
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white hover:bg-[#166534] disabled:opacity-60"
          >
            {submitting ? "Mengunggah..." : "Ajukan Verifikasi KTM"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ProfilPage() {
  const {
    authUserId,
    signOutAccount,
    products,
    myListingIds,
    updateMyListing,
    deleteMyListing,
    toggleListingStockZero,
    profile,
    updateProfile,
    submitKtmVerification,
    deleteOwnAccount,
  } = useMarketplace();

  const [listingMessage, setListingMessage] = useState("");
  const [listingError, setListingError] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});

  const myListings = products.filter((item) => myListingIds.includes(item.id));

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    const res = await deleteOwnAccount();
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
      className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
            Profil Mahasiswa &amp; Verifikasi KTM
          </h1>
          <p className="mt-1 text-sm font-medium text-[#475569]">
            {authUserId
              ? "Akun terhubung ke sesi Supabase Auth. Akun Terverifikasi dapat menjual, memesan, dan memberi ulasan."
              : "Mode pratinjau tamu. Masuk lewat /masuk untuk menyimpan perubahan ke akun Supabase Anda."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {authUserId ? (
            <button
              type="button"
              onClick={() => void signOutAccount()}
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#FEF2F2]"
            >
              Keluar Akun
            </button>
          ) : (
            <Link
              href="/masuk"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#F0FDF4]"
            >
              Masuk / Ganti Akun
            </Link>
          )}
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#FEF9C3]"
          >
            Panel Admin
          </Link>
        </div>
      </div>

      {/* Ringkasan Status KTM */}
      <section
        aria-label="Status verifikasi KTM"
        className="space-y-2.5 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-[#111827]">
            Status Verifikasi KTM:{" "}
            <span className="ml-1 inline-block rounded-md border border-[#111827] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#14532D]">
              {profile.ktmStatus}
            </span>
          </h2>
          {profile.deletedAt && (
            <span className="rounded-md border border-[#991B1B] bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-bold text-[#991B1B]">
              Akun Dianonimkan
            </span>
          )}
        </div>

        <ol className="grid grid-cols-2 gap-2 text-xs font-bold sm:flex sm:flex-wrap">
          {KTM_STATUS_STEPS.map((st) => (
            <li
              key={st}
              className={`rounded-lg px-2.5 py-1.5 text-center sm:py-1 sm:text-left ${
                profile.ktmStatus === st
                  ? "bg-[#15803D] text-white"
                  : "bg-white/80 text-[#475569]"
              }`}
            >
              {st}
            </li>
          ))}
        </ol>

        {profile.ktmReason && (
          <p className="rounded-xl border border-[#991B1B] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]">
            Alasan Penolakan Admin: {profile.ktmReason} (Foto dihapus maksimal 7 hari
            setelah ditolak).
          </p>
        )}

        <p className="text-xs font-medium text-[#475569]">
          Foto KTM disimpan di bucket privat dan langsung dihapus otomatis setelah
          verifikasi disetujui.
        </p>
      </section>

      <ProfilIdentityForm
        key={`${authUserId ?? "preview"}-${profile.email}-${profile.deletedAt ?? ""}`}
        profile={profile}
        authUserId={authUserId}
        onSaveProfile={updateProfile}
        onSubmitKtm={submitKtmVerification}
        onOpenDelete={() => {
          setDeleteError("");
          setDeleteSuccess(false);
          setDeleteModalOpen(true);
        }}
      />

      <PasswordChangeCard authUserId={authUserId} />

      {/* Panel Kelola Listing Penjual */}
      <section
        id="listing-saya"
        aria-labelledby="judul-listing-saya"
        className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="judul-listing-saya" className="text-lg font-extrabold text-[#111827]">
              Listing Saya ({myListings.length})
            </h2>
            <p className="text-xs font-medium text-[#475569]">
              Ubah harga/stok, nonaktifkan sementara, atau tandai terjual.
            </p>
          </div>
          <Link
            href="/jual"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#FDE047]"
          >
            + Pasang Listing
          </Link>
        </div>

        {listingError && (
          <div
            role="alert"
            className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
          >
            Perhatian: {listingError}
          </div>
        )}

        {listingMessage && (
          <div
            role="status"
            className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3 text-xs font-bold text-[#14532D]"
          >
            {listingMessage}
          </div>
        )}

        {myListings.length === 0 ? (
          <div className="rounded-xl border border-[#111827]/25 bg-[#F8FAFC] p-5 text-center text-xs font-semibold text-[#475569]">
            Belum ada listing milik akun ini.
          </div>
        ) : (
          <ul className="space-y-3">
            {myListings.map((item) => {
              const isSold = !item.alwaysAvailable && item.stock <= 0;
              const statusText = item.hidden
                ? "Nonaktif"
                : isSold
                  ? "Terjual"
                  : "Aktif";
              const priceVal = priceDrafts[item.id] ?? String(item.price);
              const stockVal = stockDrafts[item.id] ?? String(item.stock);

              return (
                <li
                  key={item.id}
                  className="space-y-3 rounded-xl border-2 border-[#111827] bg-[#F8FAFC] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-block rounded-md border border-[#111827] px-2 py-0.5 text-[11px] font-extrabold ${
                          statusText === "Aktif"
                            ? "bg-[#DCFCE7] text-[#14532D]"
                            : statusText === "Terjual"
                              ? "bg-[#FEF2F2] text-[#991B1B]"
                              : "bg-white text-[#475569]"
                        }`}
                      >
                        {statusText}
                      </span>
                      <h3 className="mt-1 text-sm font-extrabold text-[#111827]">
                        <Link href={`/listing/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs font-semibold text-[#475569]">
                        {formatRupiah(item.price)} •{" "}
                        {item.alwaysAvailable ? "Selalu tersedia" : `Stok: ${item.stock}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:items-end">
                    <div>
                      <label
                        htmlFor={`harga-${item.id}`}
                        className="block text-[11px] font-bold text-[#334155]"
                      >
                        Ubah Harga (Rp)
                      </label>
                      <input
                        id={`harga-${item.id}`}
                        type="number"
                        min={0}
                        value={priceVal}
                        onChange={(e) =>
                          setPriceDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-[#111827] bg-white px-2.5 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`stok-${item.id}`}
                        className="block text-[11px] font-bold text-[#334155]"
                      >
                        Ubah Stok
                      </label>
                      <input
                        id={`stok-${item.id}`}
                        type="number"
                        min={0}
                        value={stockVal}
                        onChange={(e) =>
                          setStockDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-[#111827] bg-white px-2.5 text-sm font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setListingError("");
                        setListingMessage("");
                        const res = await updateMyListing(item.id, {
                          price: Number(priceVal) || 0,
                          stock: Math.max(0, Number(stockVal) || 0),
                        });
                        if (!res.ok) {
                          setListingError(
                            res.error ?? "Gagal memperbarui harga atau stok."
                          );
                          return;
                        }
                        setListingMessage(`Perubahan harga/stok "${item.title}" disimpan.`);
                      }}
                      className="col-span-2 min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3 text-xs font-bold text-[#111827] hover:bg-[#DCFCE7] sm:col-span-1"
                    >
                      Simpan Angka
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      onClick={async () => {
                        setListingError("");
                        setListingMessage("");
                        const res = await toggleListingStockZero(item.id);
                        if (!res.ok) {
                          setListingError(res.error ?? "Gagal mengubah status stok.");
                          return;
                        }
                        setListingMessage(
                          isSold
                            ? `"${item.title}" diaktifkan kembali dengan stok 1.`
                            : `"${item.title}" ditandai Terjual (stok 0).`
                        );
                      }}
                      className="min-h-11 rounded-xl border-2 border-[#111827] bg-[#15803D] px-3.5 text-xs font-bold text-white"
                    >
                      {isSold ? "Aktifkan Stok (1)" : "Tandai Terjual"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setListingError("");
                        setListingMessage("");
                        const res = await updateMyListing(item.id, {
                          hidden: !item.hidden,
                        });
                        if (!res.ok) {
                          setListingError(res.error ?? "Gagal mengubah visibilitas.");
                          return;
                        }
                        setListingMessage(
                          item.hidden
                            ? `"${item.title}" ditayangkan kembali di katalog.`
                            : `"${item.title}" dinonaktifkan sementara.`
                        );
                      }}
                      className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827]"
                    >
                      {item.hidden ? "Tayangkan Kembali" : "Nonaktifkan"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setListingError("");
                        setListingMessage("");
                        const res = await deleteMyListing(item.id);
                        if (!res.ok) {
                          setListingError(res.error ?? "Gagal menghapus listing.");
                          return;
                        }
                        setListingMessage(`Listing "${item.title}" dihapus.`);
                      }}
                      className="min-h-11 rounded-xl border border-[#991B1B]/60 bg-white px-3.5 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
                    >
                      Hapus Listing
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Dialog Hapus Akun Mandiri */}
      <ModalDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        titleId="judul-hapus-akun"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-hapus-akun" className="text-lg font-extrabold text-[#111827]">
            Konfirmasi Hapus Akun Mandiri
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
                  onClick={() => void handleDeleteAccount()}
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
