"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { compressListingImages, type CompressedListingImage } from "@/lib/listing-images";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  CONDITIONS,
  EDITABLE_LISTING_CATEGORIES,
  EN_CATEGORY_LABELS,
  EN_CONDITION_LABELS,
  EN_KTM_STATUS_LABELS,
  FACULTIES,
  INITIAL_COD_SPOTS,
  formatRupiah,
  getDisplayLabel,
  type AppLocale,
  type ItemCondition,
  type KtmStatus,
  type ProductItem,
  type UserProfile,
} from "@/lib/preview-data";

function RecoveryModeNotice({ isEn }: { isEn: boolean }) {
  const params = useSearchParams();
  if (params.get("mode") !== "reset-sandi") return null;

  return (
    <div
      role="status"
      className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3 text-xs font-extrabold text-[#14532D]"
    >
      {isEn
        ? "Password recovery link verified. Enter your new password below."
        : "Tautan pemulihan kata sandi terverifikasi. Silakan ketik kata sandi baru Anda di bawah ini."}
    </div>
  );
}

function PasswordChangeCard({
  authUserId,
  isEn,
}: {
  authUserId: string | null;
  isEn: boolean;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdNotice, setPwdNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdNotice("");
    if (newPassword.length < 8) {
      setPwdError(
        isEn
          ? "New password must be at least 8 characters."
          : "Kata sandi baru minimal 8 karakter."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(
        isEn ? "Password confirmation does not match." : "Konfirmasi kata sandi belum cocok."
      );
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
          setPwdNotice(
            isEn
              ? "Account password updated in Supabase Auth."
              : "Kata sandi akun berhasil diperbarui di Supabase Auth."
          );
          return;
        }
      }

      setPwdError("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdNotice(
        isEn
          ? "Guest preview mode: password update validated locally. Sign in via /masuk to save to Supabase Auth."
          : "Mode pratinjau tamu: pembaruan kata sandi tervalidasi lokal. Masuk via /masuk untuk menyimpan ke Supabase Auth."
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
          {isEn ? "Account Security & Change Password" : "Keamanan Akun & Ubah Kata Sandi"}
        </h2>
        <p className="text-xs font-medium text-[#475569]">
          {isEn
            ? "Update your account password periodically or after opening a Password Reset email link."
            : "Perbarui kata sandi akun Anda secara berkala atau setelah membuka tautan Lupa Sandi dari email."}
        </p>
      </div>

      <Suspense fallback={null}>
        <RecoveryModeNotice isEn={isEn} />
      </Suspense>

      <form onSubmit={handlePasswordSubmit} className="space-y-3" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profil-pwd-baru"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "New Password (min. 8 chars)" : "Kata Sandi Baru (min. 8 karakter)"}
            </label>
            <PasswordInput
              id="profil-pwd-baru"
              visible={showNewPwd}
              onToggleVisible={() => setShowNewPwd((v) => !v)}
              toggleShowLabel={isEn ? "Show new password" : "Tampilkan kata sandi baru"}
              toggleHideLabel={isEn ? "Hide new password" : "Sembunyikan kata sandi baru"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwdError("");
              }}
              placeholder={isEn ? "Minimum 8 characters" : "Minimal 8 karakter"}
              className="font-medium"
            />
          </div>
          <div>
            <label
              htmlFor="profil-pwd-konfirm"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Confirm New Password" : "Ulangi Kata Sandi Baru"}
            </label>
            <PasswordInput
              id="profil-pwd-konfirm"
              visible={showConfirmPwd}
              onToggleVisible={() => setShowConfirmPwd((v) => !v)}
              toggleShowLabel={isEn ? "Show confirm password" : "Tampilkan konfirmasi kata sandi"}
              toggleHideLabel={isEn ? "Hide confirm password" : "Sembunyikan konfirmasi kata sandi"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwdError("");
              }}
              placeholder={isEn ? "Re-type new password" : "Ketik ulang kata sandi baru"}
              className="font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-full border-2 border-[#111827] bg-[#15803D] px-5 text-xs font-bold text-white hover:bg-[#166534] disabled:opacity-60"
          >
            {saving
              ? isEn
                ? "Saving..."
                : "Menyimpan..."
              : isEn
                ? "Update Password"
                : "Perbarui Kata Sandi"}
          </button>
        </div>

        {pwdError && (
          <div
            role="alert"
            className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
          >
            {isEn ? "Notice:" : "Perhatian:"} {pwdError}
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
  locale,
  onSaveProfile,
  onSubmitKtm,
  onOpenDelete,
}: {
  profile: UserProfile;
  authUserId: string | null;
  locale: AppLocale;
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
  const isEn = locale === "en";
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
      setFormError(
        isEn
          ? "Please fill in your NIM, active email, and WhatsApp number."
          : "Mohon lengkapi NIM, email aktif, dan nomor WhatsApp."
      );
      return;
    }
    if (authUserId && !photoFile && !profile.ktmPhotoName) {
      setFormError(
        isEn
          ? "Choose a Student ID (KTM) photo file first to upload to the private bucket."
          : "Pilih file foto KTM Unilak terlebih dahulu untuk diunggah ke bucket privat."
      );
      return;
    }
    if (!pdpConsent) {
      setFormError(
        isEn
          ? "UU PDP consent is required: your WhatsApp number is shared only when an order reaches Scheduled status."
          : "Persetujuan UU PDP wajib dicentang: nomor WhatsApp dibagikan hanya saat status pesanan Dijadwalkan."
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
        setFormError(
          res.error ??
            (isEn ? "Failed to submit KTM verification." : "Gagal mengirim verifikasi KTM.")
        );
        return;
      }
      setFormError("");
      setSaveMessage(
        authUserId
          ? isEn
            ? "KTM photo uploaded to the private bucket and verification request saved to Supabase."
            : "Foto KTM berhasil diunggah ke bucket privat dan pengajuan verifikasi tersimpan di Supabase."
          : isEn
            ? "KTM verification request sent to the Admin queue. Check status or approve in /admin."
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
        ? isEn
          ? "Display profile data saved to Supabase database."
          : "Data profil tampilan tersimpan ke database Supabase."
        : isEn
          ? "Display profile data updated."
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
        {isEn ? "Identity Data & Upload KTM Photo" : "Data Identitas & Unggah Foto KTM"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profil-nama"
            className="block text-xs font-extrabold text-[#111827]"
          >
            {isEn ? "Display Name (Per Student ID)" : "Nama Tampilan (Sesuai KTM)"}
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
            {isEn
              ? "Active Unilak Student NIM (One NIM, One Account)"
              : "NIM Mahasiswa Aktif Unilak (Satu NIM, Satu Akun)"}
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
            placeholder={
              isEn
                ? "Enter NIM matching your Student ID"
                : "Masukkan NIM sesuai Kartu Tanda Mahasiswa"
            }
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
            {isEn ? "Faculty" : "Fakultas"}
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
            {isEn ? "Study Program" : "Program Studi"}
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
            {isEn ? "Active Email" : "Email Aktif"}
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
            placeholder={isEn ? "name@email.com" : "nama@email.com"}
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="profil-wa"
            className="block text-xs font-extrabold text-[#111827]"
          >
            {isEn ? "Active WhatsApp Number" : "Nomor WhatsApp Aktif"}
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
            placeholder={isEn ? "Example: 0812xxxxxxxx" : "Contoh: 0812xxxxxxxx"}
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="foto-ktm"
          className="block text-xs font-extrabold text-[#111827]"
        >
          {isEn
            ? "Upload Unilak Student ID (KTM) Photo (Private Bucket)"
            : "Unggah Foto KTM Unilak (Bucket Privat)"}
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
            {isEn ? "Ready to upload:" : "Berkas siap diunggah:"} {photoName}
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
          {isEn ? (
            <>
              I agree to UU No. 27/2022 (UU PDP) terms that my WhatsApp number is shared
              with the counterparty only once the order reaches{" "}
              <strong>Scheduled</strong> status.
            </>
          ) : (
            <>
              Saya menyetujui ketentuan UU No. 27 Tahun 2022 (UU PDP) bahwa nomor WhatsApp
              saya baru dibagikan kepada lawan transaksi setelah status pesanan{" "}
              <strong>Dijadwalkan</strong>.
            </>
          )}
        </span>
      </label>

      {formError && (
        <div
          role="alert"
          className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
        >
          {isEn ? "Notice:" : "Perhatian:"} {formError}
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
          {isEn ? "Delete Account (Self-Service)" : "Hapus Akun Mandiri"}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSaveProfileOnly()}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
          >
            {isEn ? "Save Profile Changes" : "Simpan Perubahan Profil"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white hover:bg-[#166534] disabled:opacity-60"
          >
            {submitting
              ? isEn
                ? "Uploading..."
                : "Mengunggah..."
              : isEn
                ? "Submit KTM Verification"
                : "Ajukan Verifikasi KTM"}
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
    codSpots,
    updateMyListing,
    deleteMyListing,
    toggleListingStockZero,
    profile,
    updateProfile,
    submitKtmVerification,
    deleteOwnAccount,
    locale,
  } = useMarketplace();
  const isEn = locale === "en";
  const activeCodSpotNames = (codSpots.length > 0 ? codSpots : INITIAL_COD_SPOTS)
    .filter((spot) => spot.active)
    .map((spot) => spot.name);

  const [listingMessage, setListingMessage] = useState("");
  const [listingError, setListingError] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});

  const myListings = products.filter((item) => myListingIds.includes(item.id));

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const editingProduct = editingProductId
    ? myListings.find((item) => item.id === editingProductId) ?? null
    : null;
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<ProductItem["category"]>("buku");
  const [editFaculty, setEditFaculty] = useState<string>(FACULTIES[0]);
  const [editCondition, setEditCondition] = useState<ItemCondition>("Bekas Seperti Baru");
  const [editIsFree, setEditIsFree] = useState(false);
  const [editPriceText, setEditPriceText] = useState("");
  const [editAlwaysAvailable, setEditAlwaysAvailable] = useState(false);
  const [editStock, setEditStock] = useState(1);
  const [editIsUmkm, setEditIsUmkm] = useState(false);
  const [editCodSpots, setEditCodSpots] = useState<string[]>([]);
  const [editKeepImages, setEditKeepImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<CompressedListingImage[]>([]);
  const [editCompressing, setEditCompressing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const openEditModal = (item: ProductItem) => {
    setEditingProductId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditFaculty(item.faculty);
    setEditCondition(item.condition);
    setEditIsFree(item.price === 0);
    setEditPriceText(item.price > 0 ? String(item.price) : "");
    setEditAlwaysAvailable(Boolean(item.alwaysAvailable));
    setEditStock(Math.max(1, item.stock));
    setEditIsUmkm(Boolean(item.isUmkm));
    setEditCodSpots(
      item.codSpots.length > 0 ? item.codSpots : activeCodSpotNames.slice(0, 1)
    );
    setEditKeepImages(item.uploadedImages ?? []);
    setEditNewImages([]);
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingProductId(null);
    setEditNewImages([]);
    setEditError("");
  };

  const handleEditPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const totalNow = editKeepImages.length + editNewImages.length;
    const remaining = Math.max(0, 5 - totalNow);
    if (remaining === 0) {
      setEditError(
        isEn ? "Maximum 5 photos per listing." : "Maksimal 5 foto per listing."
      );
      e.target.value = "";
      return;
    }

    setEditError("");
    setEditCompressing(true);
    try {
      const processed = await compressListingImages(files, remaining);
      setEditNewImages((prev) =>
        [...prev, ...processed].slice(0, Math.max(0, 5 - editKeepImages.length))
      );
    } catch {
      setEditError(
        isEn
          ? "Failed to compress image in browser. Make sure the file is JPG, PNG, or WebP."
          : "Gagal mengompres gambar di browser. Pastikan berkas berformat JPG, PNG, atau WebP."
      );
    } finally {
      setEditCompressing(false);
      e.target.value = "";
    }
  };

  const toggleEditSpot = (spotName: string) => {
    setEditCodSpots((prev) =>
      prev.includes(spotName)
        ? prev.filter((item) => item !== spotName)
        : [...prev, spotName]
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    if (trimmedTitle.length < 5) {
      setEditError(
        isEn
          ? "Listing title must be at least 5 characters."
          : "Judul listing minimal 5 karakter."
      );
      return;
    }
    if (trimmedDescription.length < 10) {
      setEditError(
        isEn
          ? "Description must be at least 10 characters."
          : "Deskripsi minimal 10 karakter."
      );
      return;
    }

    const numericPrice = editIsFree
      ? 0
      : Number(editPriceText.replace(/[^\d]/g, ""));
    if (!editIsFree && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
      setEditError(
        isEn
          ? "Enter a valid price or check Free (Rp0)."
          : "Masukkan nominal harga yang valid atau centang Gratis Rp0."
      );
      return;
    }
    if (editCodSpots.length === 0) {
      setEditError(
        isEn ? "Select at least 1 campus COD spot." : "Pilih minimal 1 titik COD kampus."
      );
      return;
    }

    setEditSaving(true);
    setEditError("");
    setListingError("");
    setListingMessage("");

    try {
      const res = await updateMyListing(editingProduct.id, {
        title: trimmedTitle,
        description: trimmedDescription,
        category: editCategory,
        faculty: editFaculty,
        condition: editCondition,
        price: numericPrice,
        alwaysAvailable: editAlwaysAvailable,
        stock: editAlwaysAvailable ? Math.max(1, editStock) : Math.max(0, editStock),
        isUmkm: editIsUmkm,
        codSpots: editCodSpots,
        keepImages: editKeepImages,
        uploadedFiles: editNewImages.map((img) => img.file),
        previewImages: editNewImages.map((img) => img.url),
      });

      if (!res.ok) {
        setEditError(
          res.error ??
            (isEn ? "Failed to save listing updates." : "Gagal menyimpan perubahan listing.")
        );
        return;
      }

      setPriceDrafts((prev) => ({
        ...prev,
        [editingProduct.id]: String(numericPrice),
      }));
      setStockDrafts((prev) => ({
        ...prev,
        [editingProduct.id]: String(
          editAlwaysAvailable ? Math.max(1, editStock) : Math.max(0, editStock)
        ),
      }));
      setListingMessage(
        isEn
          ? `Updated details for "${trimmedTitle}".`
          : `Detail listing "${trimmedTitle}" diperbarui.`
      );
      closeEditModal();
    } finally {
      setEditSaving(false);
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    const res = await deleteOwnAccount();
    if (!res.ok) {
      setDeleteError(
        res.error ?? (isEn ? "Failed to delete account." : "Gagal menghapus akun.")
      );
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
            {isEn
              ? "Student Profile & KTM Verification"
              : "Profil Mahasiswa & Verifikasi KTM"}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#475569]">
            {authUserId
              ? isEn
                ? "Connected to Supabase Auth. Verified accounts can sell, place COD orders, and leave reviews."
                : "Akun terhubung ke sesi Supabase Auth. Akun Terverifikasi dapat menjual, memesan, dan memberi ulasan."
              : isEn
                ? "Guest preview mode. Sign in via /masuk to save changes to your Supabase account."
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
              {isEn ? "Sign Out" : "Keluar Akun"}
            </button>
          ) : (
            <Link
              href="/masuk"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#F0FDF4]"
            >
              {isEn ? "Sign In / Switch Account" : "Masuk / Ganti Akun"}
            </Link>
          )}
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#FEF9C3]"
          >
            {isEn ? "Admin Panel" : "Panel Admin"}
          </Link>
        </div>
      </div>

      {/* Ringkasan Status KTM */}
      <section
        aria-label={isEn ? "KTM verification status" : "Status verifikasi KTM"}
        className="space-y-2.5 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-[#111827]">
            {isEn ? "KTM Verification Status:" : "Status Verifikasi KTM:"}{" "}
            <span className="ml-1 inline-block rounded-md border border-[#111827] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#14532D]">
              {getDisplayLabel(locale, profile.ktmStatus, EN_KTM_STATUS_LABELS)}
            </span>
          </h2>
          {profile.deletedAt && (
            <span className="rounded-md border border-[#991B1B] bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-bold text-[#991B1B]">
              {isEn ? "Account Anonymized" : "Akun Dianonimkan"}
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
              {getDisplayLabel(locale, st, EN_KTM_STATUS_LABELS)}
            </li>
          ))}
        </ol>

        {profile.ktmReason && (
          <p className="rounded-xl border border-[#991B1B] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]">
            {isEn
              ? `Admin Rejection Reason: ${profile.ktmReason} (Photo removed within 7 days of rejection).`
              : `Alasan Penolakan Admin: ${profile.ktmReason} (Foto dihapus maksimal 7 hari setelah ditolak).`}
          </p>
        )}

        <p className="text-xs font-medium text-[#475569]">
          {isEn
            ? "KTM photos are stored in a private bucket and automatically deleted once verified."
            : "Foto KTM disimpan di bucket privat dan langsung dihapus otomatis setelah verifikasi disetujui."}
        </p>
      </section>

      <ProfilIdentityForm
        key={`${authUserId ?? "preview"}-${profile.email}-${profile.deletedAt ?? ""}`}
        profile={profile}
        authUserId={authUserId}
        locale={locale}
        onSaveProfile={updateProfile}
        onSubmitKtm={submitKtmVerification}
        onOpenDelete={() => {
          setDeleteError("");
          setDeleteSuccess(false);
          setDeleteModalOpen(true);
        }}
      />

      <PasswordChangeCard authUserId={authUserId} isEn={isEn} />

      {/* Panel Kelola Listing Penjual */}
      <section
        id="listing-saya"
        aria-labelledby="judul-listing-saya"
        className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="judul-listing-saya" className="text-lg font-extrabold text-[#111827]">
              {isEn ? `My Listings (${myListings.length})` : `Listing Saya (${myListings.length})`}
            </h2>
            <p className="text-xs font-medium text-[#475569]">
              {isEn
                ? "Edit price or stock, deactivate temporarily, or mark as sold."
                : "Ubah harga/stok, nonaktifkan sementara, atau tandai terjual."}
            </p>
          </div>
          <Link
            href="/jual"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#FDE047]"
          >
            {isEn ? "+ Post Listing" : "+ Pasang Listing"}
          </Link>
        </div>

        {listingError && (
          <div
            role="alert"
            className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
          >
            {isEn ? "Notice:" : "Perhatian:"} {listingError}
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
            {isEn ? "No listings under this account yet." : "Belum ada listing milik akun ini."}
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
              const displayStatus = item.hidden
                ? isEn
                  ? "Inactive"
                  : "Nonaktif"
                : isSold
                  ? isEn
                    ? "Sold Out"
                    : "Terjual"
                  : isEn
                    ? "Active"
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
                        {displayStatus}
                      </span>
                      <h3 className="mt-1 text-sm font-extrabold text-[#111827]">
                        <Link href={`/listing/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs font-semibold text-[#475569]">
                        {formatRupiah(item.price, locale)} •{" "}
                        {item.alwaysAvailable
                          ? isEn
                            ? "Always available"
                            : "Selalu tersedia"
                          : isEn
                            ? `Stock: ${item.stock}`
                            : `Stok: ${item.stock}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:items-end">
                    <div>
                      <label
                        htmlFor={`harga-${item.id}`}
                        className="block text-[11px] font-bold text-[#334155]"
                      >
                        {isEn ? "Edit Price (Rp)" : "Ubah Harga (Rp)"}
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
                        {isEn ? "Edit Stock" : "Ubah Stok"}
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
                            res.error ??
                              (isEn
                                ? "Failed to update price or stock."
                                : "Gagal memperbarui harga atau stok.")
                          );
                          return;
                        }
                        setListingMessage(
                          isEn
                            ? `Updated price/stock for "${item.title}".`
                            : `Perubahan harga/stok "${item.title}" disimpan.`
                        );
                      }}
                      className="col-span-2 min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3 text-xs font-bold text-[#111827] hover:bg-[#DCFCE7] sm:col-span-1"
                    >
                      {isEn ? "Save Numbers" : "Simpan Angka"}
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
                          setListingError(
                            res.error ??
                              (isEn ? "Failed to update stock status." : "Gagal mengubah status stok.")
                          );
                          return;
                        }
                        setListingMessage(
                          isSold
                            ? isEn
                              ? `"${item.title}" reactivated with stock 1.`
                              : `"${item.title}" diaktifkan kembali dengan stok 1.`
                            : isEn
                              ? `"${item.title}" marked Sold Out (stock 0).`
                              : `"${item.title}" ditandai Terjual (stok 0).`
                        );
                      }}
                      className="min-h-11 rounded-xl border-2 border-[#111827] bg-[#15803D] px-3.5 text-xs font-bold text-white"
                    >
                      {isSold
                        ? isEn
                          ? "Restock (1)"
                          : "Aktifkan Stok (1)"
                        : isEn
                          ? "Mark Sold Out"
                          : "Tandai Terjual"}
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
                          setListingError(
                            res.error ??
                              (isEn ? "Failed to change visibility." : "Gagal mengubah visibilitas.")
                          );
                          return;
                        }
                        setListingMessage(
                          item.hidden
                            ? isEn
                              ? `"${item.title}" published back to the catalog.`
                              : `"${item.title}" ditayangkan kembali di katalog.`
                            : isEn
                              ? `"${item.title}" deactivated temporarily.`
                              : `"${item.title}" dinonaktifkan sementara.`
                        );
                      }}
                      className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827]"
                    >
                      {item.hidden
                        ? isEn
                          ? "Reactivate"
                          : "Tayangkan Kembali"
                        : isEn
                          ? "Deactivate"
                          : "Nonaktifkan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="min-h-11 rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-3.5 text-xs font-bold text-[#111827] hover:bg-[#DCFCE7]"
                    >
                      {isEn ? "Edit Details" : "Edit Detail"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setListingError("");
                        setListingMessage("");
                        const res = await deleteMyListing(item.id);
                        if (!res.ok) {
                          setListingError(
                            res.error ??
                              (isEn ? "Failed to delete listing." : "Gagal menghapus listing.")
                          );
                          return;
                        }
                        setListingMessage(
                          isEn
                            ? `Listing "${item.title}" deleted.`
                            : `Listing "${item.title}" dihapus.`
                        );
                      }}
                      className="min-h-11 rounded-xl border border-[#991B1B]/60 bg-white px-3.5 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
                    >
                      {isEn ? "Delete Listing" : "Hapus Listing"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Dialog Edit Detail Listing */}
      <ModalDialog
        open={Boolean(editingProduct)}
        onClose={closeEditModal}
        titleId="judul-edit-listing"
      >
        {editingProduct && (
          <form onSubmit={(e) => void handleSaveEdit(e)} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="judul-edit-listing" className="text-lg font-extrabold text-[#111827]">
                  {isEn ? "Edit Listing Details" : "Edit Detail Listing"}
                </h2>
                <p className="text-xs font-medium text-[#475569]">
                  {isEn
                    ? "Update title, price, stock, photos, category, or COD spots."
                    : "Perbarui judul, harga, stok, foto, kategori, atau titik COD."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label={isEn ? "Close edit listing dialog" : "Tutup dialog edit listing"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
              >
                ✕
              </button>
            </div>

            <div>
              <label
                htmlFor="edit-judul-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Item / Service Title" : "Judul Barang / Jasa"}{" "}
                <span aria-hidden="true">*</span>
              </label>
              <input
                id="edit-judul-listing"
                type="text"
                required
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  setEditError("");
                }}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="edit-kategori-listing"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  {isEn ? "Category" : "Kategori"}
                </label>
                <select
                  id="edit-kategori-listing"
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(e.target.value as ProductItem["category"])
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
                >
                  {EDITABLE_LISTING_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isEn ? EN_CATEGORY_LABELS[cat.id] : cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-kondisi-listing"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  {isEn ? "Condition" : "Kondisi"}
                </label>
                <select
                  id="edit-kondisi-listing"
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value as ItemCondition)}
                  className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {isEn ? EN_CONDITION_LABELS[cond] : cond}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-fakultas-listing"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  {isEn ? "Faculty" : "Fakultas"}
                </label>
                <select
                  id="edit-fakultas-listing"
                  value={editFaculty}
                  onChange={(e) => setEditFaculty(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
                >
                  {FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-[#111827]/25 bg-[#F8FAFC] p-3">
                <label
                  htmlFor="edit-harga-listing"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  {isEn ? "Price (Rp)" : "Harga (Rp)"}
                </label>
                <input
                  id="edit-harga-listing"
                  type="number"
                  min={0}
                  step={500}
                  disabled={editIsFree}
                  value={editIsFree ? "0" : editPriceText}
                  onChange={(e) => {
                    setEditPriceText(e.target.value);
                    setEditError("");
                  }}
                  className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] disabled:opacity-50 sm:text-sm"
                />
                <label className="flex min-h-10 items-center gap-2 text-xs font-bold text-[#111827]">
                  <input
                    type="checkbox"
                    checked={editIsFree}
                    onChange={(e) => setEditIsFree(e.target.checked)}
                    className="h-5 w-5 shrink-0 accent-[#15803D]"
                  />
                  <span>{isEn ? "Free Campus Share (Rp0)" : "Gratis / Berbagi Rp0"}</span>
                </label>
              </div>

              <div className="space-y-2 rounded-xl border border-[#111827]/25 bg-[#F8FAFC] p-3">
                <label
                  htmlFor="edit-stok-listing"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  {isEn ? "Stock" : "Stok"}
                </label>
                <input
                  id="edit-stok-listing"
                  type="number"
                  min={0}
                  max={999}
                  disabled={editAlwaysAvailable}
                  value={editAlwaysAvailable ? 1 : editStock}
                  onChange={(e) => setEditStock(Math.max(0, Number(e.target.value) || 0))}
                  className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] disabled:opacity-50 sm:text-sm"
                />
                <label className="flex min-h-10 items-center gap-2 text-xs font-bold text-[#111827]">
                  <input
                    type="checkbox"
                    checked={editAlwaysAvailable}
                    onChange={(e) => setEditAlwaysAvailable(e.target.checked)}
                    className="h-5 w-5 shrink-0 accent-[#15803D]"
                  />
                  <span>
                    {isEn ? "Always available (Pre-order / Service)" : "Selalu tersedia (Pre-order / Jasa)"}
                  </span>
                </label>
              </div>
            </div>

            <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-[#111827]/25 bg-[#FEF9C3] px-3 py-2 text-xs font-bold text-[#111827]">
              <input
                type="checkbox"
                checked={editIsUmkm}
                onChange={(e) => setEditIsUmkm(e.target.checked)}
                className="h-5 w-5 shrink-0 accent-[#15803D]"
              />
              <span>
                {isEn
                  ? "Show in Free Student UMKM Showcase strip"
                  : "Tampilkan di Etalase UMKM Mahasiswa Gratis"}
              </span>
            </label>

            <div>
              <label
                htmlFor="edit-deskripsi-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Description" : "Deskripsi"}{" "}
                <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="edit-deskripsi-listing"
                rows={3}
                required
                value={editDescription}
                onChange={(e) => {
                  setEditDescription(e.target.value);
                  setEditError("");
                }}
                className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-foto-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Listing Photos (Max 5)" : "Foto Listing (Maks. 5 Foto)"}
              </label>
              <input
                id="edit-foto-listing"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => void handleEditPhotoChange(e)}
                className="block min-h-11 w-full rounded-xl border-2 border-[#111827] bg-[#F8FAFC] p-2 text-xs font-semibold text-[#111827]"
              />
              {editCompressing && (
                <p role="status" className="text-xs font-bold text-[#15803D]">
                  {isEn ? "Compressing images..." : "Mengompres gambar..."}
                </p>
              )}
              {(editKeepImages.length > 0 || editNewImages.length > 0) && (
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {editKeepImages.map((url, idx) => (
                    <li
                      key={`${url}-${idx}`}
                      className="rounded-xl border border-[#111827] bg-[#F8FAFC] p-2"
                    >
                      <Image
                        unoptimized
                        src={url}
                        alt={isEn ? `Saved photo ${idx + 1}` : `Foto tersimpan ${idx + 1}`}
                        width={120}
                        height={88}
                        className="h-20 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditKeepImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="mt-1 min-h-9 w-full rounded-lg border border-[#111827]/40 bg-white text-[11px] font-bold text-[#991B1B]"
                      >
                        {isEn ? "Remove Photo" : "Hapus Foto"}
                      </button>
                    </li>
                  ))}
                  {editNewImages.map((img, idx) => (
                    <li
                      key={`${img.name}-${idx}`}
                      className="rounded-xl border-2 border-[#15803D] bg-[#F0FDF4] p-2"
                    >
                      <Image
                        unoptimized
                        src={img.url}
                        alt={isEn ? `New photo ${idx + 1}` : `Foto baru ${idx + 1}`}
                        width={120}
                        height={88}
                        className="h-20 w-full rounded-lg object-cover"
                      />
                      <p className="mt-0.5 text-[10px] font-bold text-[#14532D]">
                        {img.compressedKb} KB
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setEditNewImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="mt-1 min-h-9 w-full rounded-lg border border-[#111827]/40 bg-white text-[11px] font-bold text-[#991B1B]"
                      >
                        {isEn ? "Remove New" : "Batalkan"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <fieldset className="space-y-2 rounded-xl border border-[#111827]/30 bg-[#F8FAFC] p-3">
              <legend className="px-1 text-xs font-extrabold text-[#111827]">
                {isEn ? "Campus COD Spots" : "Titik COD Kampus"}
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeCodSpotNames.map((spotName) => (
                  <label
                    key={spotName}
                    className="flex min-h-10 items-center gap-2 rounded-lg border border-[#111827]/25 bg-white px-2.5 text-xs font-bold text-[#111827]"
                  >
                    <input
                      type="checkbox"
                      checked={editCodSpots.includes(spotName)}
                      onChange={() => toggleEditSpot(spotName)}
                      className="h-4 w-4 shrink-0 accent-[#15803D]"
                    />
                    <span>{spotName}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {editError && (
              <div
                role="alert"
                className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
              >
                {editError}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeEditModal}
                className="min-h-11 rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold text-[#111827]"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button
                type="submit"
                disabled={editSaving || editCompressing}
                className="min-h-11 rounded-full border-2 border-[#111827] bg-[#15803D] px-5 text-xs font-extrabold text-white hover:bg-[#166534] disabled:opacity-60"
              >
                {editSaving
                  ? isEn
                    ? "Saving..."
                    : "Menyimpan..."
                  : isEn
                    ? "Save Listing Changes"
                    : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </ModalDialog>

      {/* Dialog Hapus Akun Mandiri */}
      <ModalDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        titleId="judul-hapus-akun"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="judul-hapus-akun" className="text-lg font-extrabold text-[#111827]">
            {isEn ? "Confirm Self-Service Account Deletion" : "Konfirmasi Hapus Akun Mandiri"}
          </h2>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(false)}
            aria-label={isEn ? "Close delete account dialog" : "Tutup dialog hapus akun"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {deleteSuccess ? (
            <div role="status" className="rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4">
              <p className="text-sm font-extrabold text-[#15803D]">
                {isEn
                  ? "Account successfully anonymized (UU PDP)."
                  : "Akun berhasil dianonimkan (UU PDP)."}
              </p>
              <p className="mt-1 text-xs font-medium text-[#111827]">
                {isEn
                  ? "Personal data (name, NIM, email, and WhatsApp) has been erased while preserving completed transaction audit integrity."
                  : "Data pribadi (nama, NIM, email, dan WhatsApp) dihapus sambil menjaga integritas riwayat transaksi selesai."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium leading-relaxed text-[#334155]">
                {isEn
                  ? "Per UU PDP rules, you can delete your account and anonymize PII only when no active COD orders are in progress."
                  : "Sesuai ketentuan UU PDP, Anda dapat menghapus akun dan menganonimkan PII hanya bila tidak ada pesanan aktif yang sedang berlangsung."}
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
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteAccount()}
                  className="min-h-11 rounded-full border-2 border-[#111827] bg-[#991B1B] px-5 text-xs font-bold text-white"
                >
                  {isEn ? "Delete & Anonymize Account" : "Hapus & Anonimkan Akun"}
                </button>
              </div>
            </>
          )}
        </div>
      </ModalDialog>
    </main>
  );
}
