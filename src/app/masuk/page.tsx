"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import {
  resetPasswordAction,
  signInWithIdentifierAction,
  signUpStudentAction,
} from "@/app/masuk/actions";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { EN_KTM_STATUS_LABELS, FACULTIES, getDisplayLabel } from "@/lib/preview-data";

type AuthMode = "masuk" | "daftar" | "reset";

function AuthConfirmErrorBanner({ isEn }: { isEn: boolean }) {
  const params = useSearchParams();
  if (params.get("verif") !== "gagal") return null;

  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-4 text-xs font-bold text-[#991B1B]"
    >
      {isEn
        ? "Email verification or password recovery link is invalid or expired. Request a new link or try signing in again."
        : "Tautan verifikasi email atau pemulihan kata sandi tidak valid atau sudah kedaluwarsa. Silakan kirim ulang atau coba masuk kembali."}
    </div>
  );
}

export default function MasukPage() {
  const { authUserId, profile, refreshSupabaseData, signOutAccount, locale } =
    useMarketplace();
  const isEn = locale === "en";

  const [mode, setMode] = useState<AuthMode>("masuk");
  const [submitting, setSubmitting] = useState(false);

  // Mode Masuk
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const loginIdRef = useRef<HTMLInputElement>(null);
  const loginPwdRef = useRef<HTMLInputElement>(null);

  // Mode Daftar Mahasiswa
  const [regNim, setRegNim] = useState("");
  const [regName, setRegName] = useState("");
  const [regFaculty, setRegFaculty] = useState<string>(FACULTIES[0]);
  const [regProdi, setRegProdi] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regWa, setRegWa] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regConsent, setRegConsent] = useState(false);
  const [regError, setRegError] = useState("");
  const [regNotice, setRegNotice] = useState("");
  const regNimRef = useRef<HTMLInputElement>(null);
  const regPwdRef = useRef<HTMLInputElement>(null);

  // Mode Lupa Sandi
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const resetIdRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess("");
    if (!loginIdentifier.trim()) {
      setLoginError(
        isEn
          ? "Enter your Student ID (NIM) or active email address."
          : "Masukkan NIM atau alamat email aktif Anda."
      );
      loginIdRef.current?.focus();
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError(
        isEn ? "Password must be at least 6 characters." : "Kata sandi minimal 6 karakter."
      );
      loginPwdRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await signInWithIdentifierAction({
        identifier: loginIdentifier,
        password: loginPassword,
      });
      if (!res.ok) {
        setLoginError(
          res.error ?? (isEn ? "Failed to sign in." : "Gagal masuk ke akun.")
        );
        loginIdRef.current?.focus();
        return;
      }
      setLoginError("");
      setLoginSuccess(
        isEn
          ? "Signed in to UnilakMart. Loading your account session..."
          : "Berhasil masuk ke UnilakMart. Mengambil sesi akun Anda..."
      );
      await refreshSupabaseData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegNotice("");
    if (!/^\d{8,14}$/.test(regNim.trim())) {
      setRegError(
        isEn
          ? "Student ID (NIM) must be 8 to 14 numeric digits."
          : "NIM mahasiswa harus berisi 8 sampai 14 digit angka."
      );
      regNimRef.current?.focus();
      return;
    }
    if (regName.trim().length < 3 || !regProdi.trim()) {
      setRegError(
        isEn
          ? "Fill in your full name and study program matching your Student ID card."
          : "Lengkapi nama lengkap dan program studi sesuai KTM."
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegError(
        isEn
          ? "Enter a valid active email address for verification."
          : "Masukkan format alamat email aktif yang valid untuk verifikasi."
      );
      return;
    }
    if (regWa.replace(/\D/g, "").length < 10) {
      setRegError(
        isEn
          ? "Enter an active WhatsApp number of at least 10 digits."
          : "Masukkan nomor WhatsApp aktif minimal 10 digit."
      );
      return;
    }
    if (regPassword.length < 8) {
      setRegError(
        isEn
          ? "Registration password must be at least 8 characters."
          : "Kata sandi pendaftaran minimal 8 karakter."
      );
      regPwdRef.current?.focus();
      return;
    }
    if (!regConsent) {
      setRegError(
        isEn
          ? "UU PDP privacy consent must be checked before registering on UnilakMart."
          : "Persetujuan UU PDP wajib dicentang sebelum mendaftar di UnilakMart."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await signUpStudentAction({
        nim: regNim,
        name: regName,
        faculty: regFaculty,
        prodi: regProdi,
        email: regEmail,
        wa: regWa,
        password: regPassword,
        pdpConsent: regConsent,
      });
      if (!res.ok) {
        setRegError(res.error ?? (isEn ? "Registration failed." : "Pendaftaran gagal."));
        regNimRef.current?.focus();
        return;
      }
      setRegError("");
      setRegNotice(
        res.needsEmailConfirm
          ? isEn
            ? `Registration for NIM ${regNim.trim()} succeeded. Check ${regEmail.trim()} for your email verification link before signing in.`
            : `Pendaftaran atas NIM ${regNim.trim()} berhasil. Periksa kotak masuk ${regEmail.trim()} untuk tautan verifikasi email sebelum masuk.`
          : isEn
            ? `Account for NIM ${regNim.trim()} created and active. Next, upload your Student ID photo on Profile.`
            : `Akun atas NIM ${regNim.trim()} berhasil dibuat dan aktif. Lanjutkan unggah foto KTM di halaman Profil.`
      );
      if (!res.needsEmailConfirm) {
        await refreshSupabaseData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(false);
    if (!resetIdentifier.trim()) {
      setResetError(
        isEn
          ? "Enter your NIM or account email first."
          : "Masukkan NIM atau email akun Anda terlebih dahulu."
      );
      resetIdRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPasswordAction({ identifier: resetIdentifier });
      if (!res.ok) {
        setResetError(
          res.error ??
            (isEn ? "Failed to process recovery request." : "Gagal memproses pemulihan.")
        );
        resetIdRef.current?.focus();
        return;
      }
      setResetError("");
      setResetSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
          {isEn ? "Unilak Student Account" : "Akun Mahasiswa Unilak"}
        </h1>
        <p className="text-sm font-medium text-[#475569]">
          {isEn
            ? "Sign in with NIM or email, register with UU PDP privacy consent, or reset your password."
            : "Masuk dengan NIM atau email, daftar akun baru dengan persetujuan UU PDP, atau atur ulang kata sandi."}
        </p>
      </div>

      <Suspense fallback={null}>
        <AuthConfirmErrorBanner isEn={isEn} />
      </Suspense>

      {authUserId && (
        <section
          aria-label={isEn ? "Active session status" : "Status sesi aktif"}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4"
        >
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#14532D]">
              {isEn ? "Active Supabase Session:" : "Sesi Supabase Aktif:"} {profile.name}
            </p>
            <p className="truncate text-xs font-semibold text-[#334155]">
              {profile.email} • {isEn ? "KTM Status:" : "Status KTM:"}{" "}
              {getDisplayLabel(locale, profile.ktmStatus, EN_KTM_STATUS_LABELS)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profil"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 text-xs font-bold text-white"
            >
              {isEn ? "Profile & KTM" : "Ke Profil & KTM"}
            </Link>
            <button
              type="button"
              onClick={() => void signOutAccount()}
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold text-[#111827]"
            >
              {isEn ? "Sign Out" : "Keluar Akun"}
            </button>
          </div>
        </section>
      )}

      <div
        role="tablist"
        aria-label={isEn ? "Account form options" : "Pilihan formulir akun"}
        className="grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-1.5"
      >
        {(
          [
            { id: "masuk", label: isEn ? "Sign In" : "Masuk" },
            { id: "daftar", label: isEn ? "Register NIM" : "Daftar NIM" },
            { id: "reset", label: isEn ? "Reset Password" : "Lupa Sandi" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={`min-h-11 rounded-xl px-2 text-xs font-extrabold transition-colors sm:text-sm ${
              mode === tab.id
                ? "bg-[#15803D] text-white"
                : "text-[#111827] hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "masuk" && (
        <form
          method="post"
          onSubmit={handleLoginSubmit}
          aria-labelledby="judul-tab-masuk"
          className="min-w-0 space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
          noValidate
        >
          <div>
            <h2 id="judul-tab-masuk" className="text-lg font-extrabold text-[#111827]">
              {isEn ? "Sign In to Campus Account" : "Masuk ke Akun Kampus"}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#475569]">
              {isEn
                ? "Login sessions run through Supabase Auth without exposing whether a NIM or email is registered."
                : "Sesi login diproses melalui Supabase Auth tanpa membocorkan status keterdaftaran NIM maupun email Anda."}
            </p>
          </div>

          <div>
            <label
              htmlFor="login-identifier"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Student ID (NIM) or Email" : "NIM atau Email"}{" "}
              <span aria-hidden="true">*</span>
            </label>
            <input
              ref={loginIdRef}
              id="login-identifier"
              name="username"
              type="text"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              required
              aria-invalid={Boolean(loginError)}
              aria-describedby={loginError ? "login-error-msg" : undefined}
              value={loginIdentifier}
              onChange={(e) => {
                setLoginIdentifier(e.target.value);
                setLoginError("");
              }}
              placeholder={
                isEn ? "name@student.unilak.ac.id or NIM" : "nama@student.unilak.ac.id atau NIM"
              }
              className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="login-password"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Password" : "Kata Sandi"} <span aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="inline-flex min-h-11 items-center text-xs font-bold text-[#15803D] underline"
              >
                {isEn ? "Forgot password?" : "Lupa kata sandi?"}
              </button>
            </div>
            <PasswordInput
              ref={loginPwdRef}
              id="login-password"
              name="password"
              visible={showLoginPwd}
              onToggleVisible={() => setShowLoginPwd((prev) => !prev)}
              toggleShowLabel={isEn ? "Show password" : "Tampilkan kata sandi"}
              toggleHideLabel={isEn ? "Hide password" : "Sembunyikan kata sandi"}
              autoComplete="current-password"
              enterKeyHint="done"
              required
              aria-invalid={Boolean(loginError)}
              aria-describedby={loginError ? "login-error-msg" : undefined}
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                setLoginError("");
              }}
              placeholder={isEn ? "Minimum 6 characters" : "Minimal 6 karakter"}
              className="font-medium"
            />
          </div>

          {loginError && (
            <div
              id="login-error-msg"
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              {isEn ? "Notice:" : "Perhatian:"} {loginError}
            </div>
          )}

          {loginSuccess && (
            <div
              role="status"
              className="space-y-2 rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-bold text-[#14532D]"
            >
              <p>{loginSuccess}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/profil"
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white"
                >
                  {isEn ? "Open Profile & KTM" : "Buka Profil & KTM"}
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-1.5 text-xs font-bold text-[#111827]"
                >
                  {isEn ? "Go to Catalog" : "Ke Katalog"}
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-60"
          >
            {submitting
              ? isEn
                ? "Processing..."
                : "Memproses..."
              : isEn
                ? "Sign In to UnilakMart"
                : "Masuk ke UnilakMart"}
          </button>
        </form>
      )}

      {mode === "daftar" && (
        <form
          method="post"
          onSubmit={handleRegisterSubmit}
          aria-labelledby="judul-tab-daftar"
          className="min-w-0 space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
          noValidate
        >
          <div>
            <h2 id="judul-tab-daftar" className="text-lg font-extrabold text-[#111827]">
              {isEn ? "Active Unilak Student Registration" : "Daftar Mahasiswa Aktif Unilak"}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#475569]">
              {isEn
                ? "Each NIM is strictly limited to one account. Continue Student ID photo verification in Profile after signing up."
                : "Satu NIM hanya dapat dipakai satu akun. Verifikasi foto KTM dilanjutkan di halaman Profil setelah mendaftar."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-nim"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Student NIM (Must Be Unique)" : "NIM Mahasiswa (Wajib Unik)"}{" "}
                <span aria-hidden="true">*</span>
              </label>
              <input
                ref={regNimRef}
                id="reg-nim"
                name="nim"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(regError)}
                aria-describedby="hint-reg-nim"
                required
                value={regNim}
                onChange={(e) => {
                  setRegNim(e.target.value);
                  setRegError("");
                }}
                placeholder={isEn ? "Example: 2355201099" : "Contoh: 2355201099"}
                className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
              <p id="hint-reg-nim" className="mt-1 text-[11px] font-medium text-[#475569]">
                {isEn
                  ? "Must be 8 to 14 numeric digits per your Unilak Student ID."
                  : "Wajib 8 sampai 14 digit angka sesuai KTM Unilak."}
              </p>
            </div>

            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Full Name (Per Student ID)" : "Nama Lengkap Sesuai KTM"}{" "}
                <span aria-hidden="true">*</span>
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  setRegError("");
                }}
                placeholder={isEn ? "Student full name" : "Nama lengkap mahasiswa"}
                className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-faculty"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Faculty" : "Fakultas"}
              </label>
              <select
                id="reg-faculty"
                name="faculty"
                value={regFaculty}
                onChange={(e) => setRegFaculty(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
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
                htmlFor="reg-prodi"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Study Program" : "Program Studi"} <span aria-hidden="true">*</span>
              </label>
              <input
                id="reg-prodi"
                name="prodi"
                type="text"
                required
                value={regProdi}
                onChange={(e) => {
                  setRegProdi(e.target.value);
                  setRegError("");
                }}
                placeholder={isEn ? "Example: Informatics Engineering" : "Contoh: Teknik Informatika"}
                className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Active Email (Verification Required)" : "Email Aktif (Wajib Verifikasi)"}{" "}
                <span aria-hidden="true">*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                required
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setRegError("");
                }}
                placeholder={isEn ? "name@student.unilak.ac.id" : "nama@student.unilak.ac.id"}
                className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="reg-wa"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Active WhatsApp Number" : "Nomor WhatsApp Aktif"}{" "}
                <span aria-hidden="true">*</span>
              </label>
              <input
                id="reg-wa"
                name="tel"
                type="tel"
                autoComplete="tel"
                required
                value={regWa}
                onChange={(e) => {
                  setRegWa(e.target.value);
                  setRegError("");
                }}
                placeholder="0812xxxxxxxx"
                className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Password" : "Kata Sandi"} <span aria-hidden="true">*</span>
            </label>
            <PasswordInput
              ref={regPwdRef}
              id="reg-password"
              name="new_password"
              visible={showRegPwd}
              onToggleVisible={() => setShowRegPwd((prev) => !prev)}
              toggleShowLabel={isEn ? "Show new password" : "Tampilkan kata sandi baru"}
              toggleHideLabel={isEn ? "Hide new password" : "Sembunyikan kata sandi baru"}
              autoComplete="new-password"
              minLength={8}
              aria-invalid={Boolean(regError)}
              aria-describedby="hint-reg-pwd"
              required
              value={regPassword}
              onChange={(e) => {
                setRegPassword(e.target.value);
                setRegError("");
              }}
              placeholder={isEn ? "Minimum 8 characters" : "Minimal 8 karakter"}
              className="font-semibold"
            />
            <p id="hint-reg-pwd" className="mt-1 text-[11px] font-medium text-[#475569]">
              {isEn
                ? "Use 8 or more characters. Password manager paste is supported."
                : "Gunakan 8 karakter atau lebih. Tempel kata sandi dari pengelola sandi didukung."}
            </p>
          </div>

          <label className="flex min-h-11 items-start gap-3 rounded-2xl border-2 border-[#111827] bg-[#FEF9C3] p-3.5 text-xs font-semibold leading-snug text-[#111827]">
            <input
              type="checkbox"
              checked={regConsent}
              onChange={(e) => {
                setRegConsent(e.target.checked);
                setRegError("");
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#15803D]"
            />
            <span>
              {isEn ? (
                <>
                  I agree to Indonesia Law No. 27/2022 (UU PDP) privacy terms that my
                  WhatsApp number will be shared with the counterparty only after the order
                  is approved (<strong>Scheduled</strong>).
                </>
              ) : (
                <>
                  Saya menyetujui kebijakan privasi UU No. 27 Tahun 2022 (UU PDP) bahwa
                  nomor WhatsApp saya akan dibagikan kepada lawan transaksi setelah pesanan
                  diterima (<strong>Dijadwalkan</strong>).
                </>
              )}
            </span>
          </label>

          {regError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              {isEn ? "Notice:" : "Perhatian:"} {regError}
            </div>
          )}

          {regNotice && (
            <div
              role="status"
              className="space-y-2 rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-bold text-[#14532D]"
            >
              <p>{regNotice}</p>
              <Link
                href="/profil"
                className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white"
              >
                {isEn ? "Upload KTM Photo in Profile" : "Unggah Foto KTM di Profil"}
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-5 py-2.5 text-sm font-extrabold text-[#111827] hover:bg-[#FDE047] disabled:opacity-60"
          >
            {submitting
              ? isEn
                ? "Registering..."
                : "Mendaftarkan..."
              : isEn
                ? "Register Student Account"
                : "Daftar Akun Mahasiswa"}
          </button>
        </form>
      )}

      {mode === "reset" && (
        <form
          method="post"
          onSubmit={handleResetSubmit}
          aria-labelledby="judul-tab-reset"
          className="min-w-0 space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
          noValidate
        >
          <div>
            <h2 id="judul-tab-reset" className="text-lg font-extrabold text-[#111827]">
              {isEn ? "Reset Password" : "Atur Ulang Kata Sandi"}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#475569]">
              {isEn
                ? "Enter your NIM or email. The system sends a recovery link without revealing NIM registration status."
                : "Masukkan NIM atau email Anda. Sistem mengirim tautan pemulihan lewat email tanpa membocorkan status keterdaftaran NIM."}
            </p>
          </div>

          <div>
            <label
              htmlFor="reset-identifier"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Registered NIM or Email" : "NIM atau Email Terdaftar"}{" "}
              <span aria-hidden="true">*</span>
            </label>
            <input
              ref={resetIdRef}
              id="reset-identifier"
              name="reset_identifier"
              type="text"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={Boolean(resetError)}
              value={resetIdentifier}
              onChange={(e) => {
                setResetIdentifier(e.target.value);
                setResetError("");
              }}
              placeholder={
                isEn ? "2255201045 or name@student.unilak.ac.id" : "2255201045 atau nama@student.unilak.ac.id"
              }
              className="mt-1 min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          {resetError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              {isEn ? "Notice:" : "Perhatian:"} {resetError}
            </div>
          )}

          {resetSent && (
            <div
              role="status"
              className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-bold text-[#14532D]"
            >
              {isEn
                ? "If the NIM or email matches an active account, a password reset link has been sent to the registered email."
                : "Jika NIM atau email cocok dengan akun aktif, tautan atur ulang kata sandi dikirim ke email terdaftar."}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-60"
          >
            {submitting
              ? isEn
                ? "Sending..."
                : "Mengirim..."
              : isEn
                ? "Send Reset Link"
                : "Kirim Tautan Atur Ulang"}
          </button>
        </form>
      )}
    </main>
  );
}
