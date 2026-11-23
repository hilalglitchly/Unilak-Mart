"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { signUpStudentAction } from "@/app/masuk/actions";
import { AuthSplitShell } from "@/components/AuthSplitShell";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { FACULTIES } from "@/lib/preview-data";

export default function DaftarPage() {
  const { refreshSupabaseData, locale } = useMarketplace();
  const isEn = locale === "en";

  const [submitting, setSubmitting] = useState(false);
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
          ? "You must check the UU PDP privacy consent before registering."
          : "Persetujuan privasi UU PDP wajib dicentang sebelum mendaftar."
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
        setRegError(
          res.error ?? (isEn ? "Failed to register account." : "Gagal mendaftarkan akun.")
        );
        regNimRef.current?.focus();
        return;
      }

      setRegError("");
      setRegNotice(
        res.needsEmailConfirm
          ? isEn
            ? "Account created. Open the verification email in your inbox, then continue uploading your Student ID photo in Profile."
            : "Akun berhasil dibuat. Buka email verifikasi di kotak masuk Anda, lalu lanjutkan unggah foto KTM di halaman Profil."
          : isEn
            ? "Account created and signed in. Continue uploading your Student ID photo in Profile so an admin can verify your account."
            : "Akun berhasil dibuat dan langsung masuk. Lanjutkan unggah foto KTM di halaman Profil agar akun Anda diverifikasi admin."
      );
      await refreshSupabaseData();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitShell
      variant="daftar"
      title={isEn ? "Create Student Account" : "Buat Akun Mahasiswa"}
      subtitle={
        isEn
          ? "Each NIM is strictly limited to one account. Upload your Student ID photo in Profile after registering."
          : "Satu NIM hanya untuk satu akun. Lanjutkan verifikasi foto KTM di halaman Profil setelah mendaftar."
      }
      footerPrompt={isEn ? "Already have an account?" : "Sudah punya akun?"}
      footerLinkLabel={isEn ? "Sign in here" : "Masuk di sini"}
      footerLinkHref="/masuk"
    >
      <form
        method="post"
        onSubmit={handleRegisterSubmit}
        className="min-w-0 space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-nim"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Student NIM (Unique)" : "NIM Mahasiswa (Unik)"}{" "}
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
              {isEn ? "8 to 14 digits matching your KTM." : "8 sampai 14 digit sesuai KTM."}
            </p>
          </div>

          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Full Name (Per KTM)" : "Nama Lengkap Sesuai KTM"}{" "}
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

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Active Email" : "Email Aktif"} <span aria-hidden="true">*</span>
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
              {isEn ? "Active WhatsApp" : "Nomor WhatsApp Aktif"}{" "}
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
              : "Gunakan 8 karakter atau lebih. Tempel sandi dari password manager didukung."}
          </p>
        </div>

        <label className="flex min-h-11 items-start gap-3 rounded-2xl border-2 border-[#111827] bg-[#FEF9C3] p-3 text-xs font-semibold leading-snug text-[#111827]">
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
                I agree to UU PDP privacy terms that my WhatsApp number is shared only
                after a COD order is approved (<strong>Scheduled</strong>).
              </>
            ) : (
              <>
                Saya menyetujui ketentuan UU PDP bahwa nomor WhatsApp saya baru dibagikan
                setelah pesanan COD disetujui (<strong>Dijadwalkan</strong>).
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
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-extrabold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-60"
        >
          {submitting
            ? isEn
              ? "Registering..."
              : "Mendaftarkan..."
            : isEn
              ? "Create Account"
              : "Buat Akun Mahasiswa"}
        </button>
      </form>
    </AuthSplitShell>
  );
}
