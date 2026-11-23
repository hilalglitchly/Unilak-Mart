"use client";

import { useRef, useState } from "react";
import { resetPasswordAction } from "@/app/masuk/actions";
import { AuthSplitShell } from "@/components/AuthSplitShell";
import { useMarketplace } from "@/components/MarketplaceProvider";

export default function LupaSandiPage() {
  const { locale } = useMarketplace();
  const isEn = locale === "en";

  const [submitting, setSubmitting] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const resetIdRef = useRef<HTMLInputElement>(null);

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
    <AuthSplitShell
      variant="lupa-sandi"
      title={isEn ? "Reset Password" : "Atur Ulang Kata Sandi"}
      subtitle={
        isEn
          ? "Enter your registered NIM or email to receive a password recovery link in your inbox."
          : "Masukkan NIM atau email terdaftar untuk menerima tautan pemulihan kata sandi di kotak masuk Anda."
      }
      footerPrompt={isEn ? "Remember your password?" : "Sudah ingat kata sandi Anda?"}
      footerLinkLabel={isEn ? "Back to Sign In" : "Kembali ke Masuk"}
      footerLinkHref="/masuk"
    >
      <form
        method="post"
        onSubmit={handleResetSubmit}
        className="min-w-0 space-y-4"
        noValidate
      >
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
              isEn ? "Example: 2355201045 or email" : "Contoh: 2355201045 atau email"
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
              : "Jika NIM atau email cocok dengan akun aktif, tautan atur ulang kata sandi telah dikirim ke email terdaftar."}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-5 py-2.5 text-sm font-extrabold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-60"
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
    </AuthSplitShell>
  );
}
