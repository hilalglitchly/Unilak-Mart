"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { FACULTIES } from "@/lib/preview-data";

type AuthMode = "masuk" | "daftar" | "reset";

export default function MasukPage() {
  const { profile, loginPreviewAccount, registerPreviewAccount } = useMarketplace();

  const [mode, setMode] = useState<AuthMode>("masuk");

  // Mode Masuk
  const [loginIdentifier, setLoginIdentifier] = useState(
    profile.nim || profile.email || ""
  );
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
  const [regDone, setRegDone] = useState(false);
  const regNimRef = useRef<HTMLInputElement>(null);

  // Mode Lupa Sandi
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const resetIdRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess("");
    if (!loginIdentifier.trim()) {
      setLoginError("Masukkan NIM atau alamat email aktif Anda.");
      loginIdRef.current?.focus();
      return;
    }
    if (loginPassword.trim().length < 6) {
      setLoginError("Kata sandi minimal 6 karakter.");
      loginPwdRef.current?.focus();
      return;
    }

    const res = loginPreviewAccount({ identifier: loginIdentifier });
    if (!res.ok) {
      setLoginError(res.error ?? "Gagal masuk ke akun.");
      loginIdRef.current?.focus();
      return;
    }
    setLoginError("");
    setLoginSuccess(
      `Sesi pratinjau aktif untuk ${loginIdentifier.trim()}. Lanjutkan ke Profil atau Katalog.`
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegDone(false);
    if (!/^\d{8,14}$/.test(regNim.trim())) {
      setRegError("NIM mahasiswa harus berisi 8 sampai 14 digit angka.");
      regNimRef.current?.focus();
      return;
    }
    if (regName.trim().length < 3 || !regProdi.trim()) {
      setRegError("Lengkapi nama lengkap dan program studi sesuai KTM.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegError("Masukkan format alamat email aktif yang valid untuk verifikasi.");
      return;
    }
    if (regWa.replace(/\D/g, "").length < 10) {
      setRegError("Masukkan nomor WhatsApp aktif minimal 10 digit.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Kata sandi pendaftaran minimal 8 karakter.");
      return;
    }
    if (!regConsent) {
      setRegError(
        "Persetujuan UU PDP wajib dicentang sebelum mendaftar di UnilakMart."
      );
      return;
    }

    const res = registerPreviewAccount({
      nim: regNim,
      name: regName,
      faculty: regFaculty,
      prodi: regProdi,
      email: regEmail,
      wa: regWa,
      pdpConsent: regConsent,
    });
    if (!res.ok) {
      setRegError(res.error ?? "Pendaftaran gagal.");
      regNimRef.current?.focus();
      return;
    }
    setRegError("");
    setRegDone(true);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setResetError("Masukkan NIM atau email akun Anda terlebih dahulu.");
      resetIdRef.current?.focus();
      return;
    }
    setResetError("");
    // Tidak membocorkan apakah NIM/email terdaftar atau tidak
    setResetSent(true);
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
          Akun Mahasiswa Unilak
        </h1>
        <p className="text-sm font-medium text-[#475569]">
          Masuk dengan NIM atau email, daftar akun baru dengan persetujuan UU PDP,
          atau atur ulang kata sandi.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Pilihan formulir akun"
        className="grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-1.5"
      >
        {(
          [
            { id: "masuk", label: "Masuk" },
            { id: "daftar", label: "Daftar NIM" },
            { id: "reset", label: "Lupa Sandi" },
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
          className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
          noValidate
        >
          <div>
            <h2 id="judul-tab-masuk" className="text-lg font-extrabold text-[#111827]">
              Masuk ke Akun Kampus
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#475569]">
              Mode pratinjau R1 menyimulasikan sesi tanpa membocorkan status keterdaftaran
              NIM sebelum Supabase Auth tersambung.
            </p>
          </div>

          <div>
            <label
              htmlFor="login-identifier"
              className="block text-xs font-extrabold text-[#111827]"
            >
              NIM atau Email <span aria-hidden="true">*</span>
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
              placeholder="2255201045 atau nama@student.unilak.ac.id"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="login-password"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Kata Sandi <span aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="inline-flex min-h-11 items-center text-xs font-bold text-[#15803D] underline"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                ref={loginPwdRef}
                id="login-password"
                name="password"
                type={showLoginPwd ? "text" : "password"}
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
                placeholder="Minimal 6 karakter"
                className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
              />
              <button
                type="button"
                aria-pressed={showLoginPwd}
                aria-label={
                  showLoginPwd ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
                onClick={() => setShowLoginPwd((prev) => !prev)}
                className="min-h-11 shrink-0 rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-3 text-xs font-bold text-[#111827]"
              >
                {showLoginPwd ? "Tutup" : "Lihat"}
              </button>
            </div>
          </div>

          {loginError && (
            <div
              id="login-error-msg"
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              Perhatian: {loginError}
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
                  Buka Profil &amp; KTM
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-1.5 text-xs font-bold text-[#111827]"
                >
                  Ke Katalog
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166534]"
          >
            Masuk ke UnilakMart
          </button>
        </form>
      )}

      {mode === "daftar" && (
        <form
          method="post"
          onSubmit={handleRegisterSubmit}
          aria-labelledby="judul-tab-daftar"
          className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
          noValidate
        >
          <div>
            <h2 id="judul-tab-daftar" className="text-lg font-extrabold text-[#111827]">
              Daftar Mahasiswa Aktif Unilak
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#475569]">
              Satu NIM hanya dapat dipakai satu akun. Verifikasi KTM dilakukan di
              halaman Profil setelah mendaftar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-nim"
                className="block text-xs font-extrabold text-[#111827]"
              >
                NIM Mahasiswa <span aria-hidden="true">*</span>
              </label>
              <input
                ref={regNimRef}
                id="reg-nim"
                name="nim"
                type="text"
                inputMode="numeric"
                autoCorrect="off"
                spellCheck={false}
                required
                aria-invalid={Boolean(regError)}
                aria-describedby="hint-reg-nim"
                value={regNim}
                onChange={(e) => {
                  setRegNim(e.target.value);
                  setRegError("");
                }}
                placeholder="Contoh: 2355201099"
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
              <p id="hint-reg-nim" className="mt-1 text-[11px] font-medium text-[#475569]">
                NIM contoh 2355201000 disiapkan untuk uji penolakan NIM ganda.
              </p>
            </div>

            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Nama Lengkap Sesuai KTM <span aria-hidden="true">*</span>
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
                placeholder="Nama lengkap mahasiswa"
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-faculty"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Fakultas
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
                Program Studi <span aria-hidden="true">*</span>
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
                placeholder="Contoh: Teknik Informatika"
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Email Aktif (Wajib Verifikasi) <span aria-hidden="true">*</span>
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
                placeholder="nama@student.unilak.ac.id"
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="reg-wa"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Nomor WhatsApp Aktif <span aria-hidden="true">*</span>
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
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Kata Sandi <span aria-hidden="true">*</span>
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="reg-password"
                name="new_password"
                type={showRegPwd ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                aria-describedby="hint-reg-pwd"
                required
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  setRegError("");
                }}
                placeholder="Minimal 8 karakter"
                className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              />
              <button
                type="button"
                aria-pressed={showRegPwd}
                aria-label={
                  showRegPwd ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"
                }
                onClick={() => setShowRegPwd((prev) => !prev)}
                className="min-h-11 shrink-0 rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-3 text-xs font-bold text-[#111827]"
              >
                {showRegPwd ? "Tutup" : "Lihat"}
              </button>
            </div>
            <p id="hint-reg-pwd" className="mt-1 text-[11px] font-medium text-[#475569]">
              Gunakan 8 karakter atau lebih. Tempel kata sandi dari pengelola sandi didukung.
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
              Saya menyetujui kebijakan privasi UU No. 27 Tahun 2022 (UU PDP) bahwa
              nomor WhatsApp saya akan dibagikan kepada lawan transaksi setelah pesanan
              diterima (<strong>Dijadwalkan</strong>).
            </span>
          </label>

          {regError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              Perhatian: {regError}
            </div>
          )}

          {regDone && (
            <div
              role="status"
              className="space-y-2 rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-bold text-[#14532D]"
            >
              <p>
                Akun terdaftar atas NIM {regNim.trim()} (simulasi verifikasi email
                terkirim). Status akun saat ini Belum Verifikasi sampai foto KTM
                diunggah.
              </p>
              <Link
                href="/profil"
                className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white"
              >
                Unggah Foto KTM di Profil
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-5 py-2.5 text-sm font-extrabold text-[#111827] hover:bg-[#FDE047]"
          >
            Daftar Akun Mahasiswa
          </button>
        </form>
      )}

      {mode === "reset" && (
        <form
          method="post"
          onSubmit={handleResetSubmit}
          aria-labelledby="judul-tab-reset"
          className="space-y-4 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-6"
          noValidate
        >
          <div>
            <h2 id="judul-tab-reset" className="text-lg font-extrabold text-[#111827]">
              Atur Ulang Kata Sandi
            </h2>
            <p className="mt-0.5 text-xs font-medium text-[#475569]">
              Masukkan NIM atau email Anda. Sistem mengirim tautan pemulihan lewat
              email tanpa membocorkan status keterdaftaran NIM.
            </p>
          </div>

          <div>
            <label
              htmlFor="reset-identifier"
              className="block text-xs font-extrabold text-[#111827]"
            >
              NIM atau Email Terdaftar <span aria-hidden="true">*</span>
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
              value={resetIdentifier}
              onChange={(e) => {
                setResetIdentifier(e.target.value);
                setResetError("");
              }}
              placeholder="2255201045 atau nama@student.unilak.ac.id"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          {resetError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              Perhatian: {resetError}
            </div>
          )}

          {resetSent && (
            <div
              role="status"
              className="rounded-xl border-2 border-[#111827] bg-[#DCFCE7] p-3.5 text-xs font-bold text-[#14532D]"
            >
              Jika NIM atau email cocok dengan akun aktif, tautan atur ulang kata
              sandi dikirim ke email terdaftar (Simulasi Custom SMTP R1).
            </div>
          )}

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166534]"
          >
            Kirim Tautan Atur Ulang
          </button>
        </form>
      )}
    </main>
  );
}
