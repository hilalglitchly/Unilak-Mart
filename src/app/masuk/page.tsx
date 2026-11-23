"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { signInWithIdentifierAction } from "@/app/masuk/actions";
import { AuthSplitShell } from "@/components/AuthSplitShell";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { resolveSafeRedirectPath } from "@/lib/auth-redirect";

function MasukPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSupabaseData, locale } = useMarketplace();
  const isEn = locale === "en";

  const legacyTab = searchParams.get("tab");
  const verifFailed = searchParams.get("verif") === "gagal";
  const redirectTarget = resolveSafeRedirectPath(searchParams.get("next"), "/");

  // Pertahankan kompatibilitas tautan lama /masuk?tab=daftar atau ?tab=reset
  useEffect(() => {
    if (legacyTab === "daftar") {
      router.replace("/daftar");
    } else if (legacyTab === "reset") {
      router.replace("/lupa-sandi");
    }
  }, [legacyTab, router]);

  const [submitting, setSubmitting] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const loginIdRef = useRef<HTMLInputElement>(null);
  const loginPwdRef = useRef<HTMLInputElement>(null);

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
          ? "Signed in to UnilakMart. Redirecting you..."
          : "Berhasil masuk ke UnilakMart. Mengarahkan Anda..."
      );
      await refreshSupabaseData();
      router.replace(redirectTarget);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitShell
      variant="masuk"
      title={isEn ? "Hello, Welcome back" : "Halo, Selamat Datang Kembali"}
      subtitle={
        isEn
          ? "Sign in with your Unilak NIM or registered email to manage listings and campus COD orders."
          : "Masuk memakai NIM Unilak atau email terdaftar untuk mengelola listing dan pesanan COD kampus."
      }
      footerPrompt={isEn ? "Don't have an account?" : "Belum punya akun?"}
      footerLinkLabel={isEn ? "Sign up here" : "Daftar di sini"}
      footerLinkHref="/daftar"
      topBanner={
        verifFailed ? (
          <div
            role="alert"
            className="rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-4 text-xs font-bold text-[#991B1B]"
          >
            {isEn
              ? "Email verification or password recovery link is invalid or expired. Request a new link or try signing in again."
              : "Tautan verifikasi email atau pemulihan kata sandi tidak valid atau sudah kedaluwarsa. Silakan kirim ulang atau coba masuk kembali."}
          </div>
        ) : null
      }
    >
      <form
        method="post"
        onSubmit={handleLoginSubmit}
        className="min-w-0 space-y-4"
        noValidate
      >
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="login-password"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Password" : "Kata Sandi"} <span aria-hidden="true">*</span>
            </label>
            <Link
              href="/lupa-sandi"
              className="inline-flex min-h-11 items-center text-xs font-extrabold text-[#15803D] underline decoration-2 underline-offset-4 hover:text-[#166534]"
            >
              {isEn ? "Forgot password?" : "Lupa kata sandi?"}
            </Link>
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
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-extrabold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-60"
        >
          {submitting
            ? isEn
              ? "Processing..."
              : "Memproses..."
            : isEn
              ? "Login"
              : "Masuk"}
        </button>
      </form>
    </AuthSplitShell>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={<main id="konten-utama" className="mx-auto max-w-5xl px-4 py-8" />}>
      <MasukPageContent />
    </Suspense>
  );
}
