"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { EN_KTM_STATUS_LABELS, getDisplayLabel } from "@/lib/preview-data";

interface AuthSplitShellProps {
  variant: "masuk" | "daftar" | "lupa-sandi";
  title: string;
  subtitle: string;
  children: ReactNode;
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  topBanner?: ReactNode;
}

function AuthCampusIllustration({
  variant,
  isEn,
}: {
  variant: AuthSplitShellProps["variant"];
  isEn: boolean;
}) {
  const badgeText =
    variant === "daftar"
      ? isEn
        ? "1 NIM • 1 ACCOUNT"
        : "1 NIM • 1 AKUN"
      : variant === "lupa-sandi"
        ? isEn
          ? "SAFE RECOVERY"
          : "PEMULIHAN AMAN"
        : isEn
          ? "0% ADMIN FEE"
          : "0% BIAYA ADMIN";

  return (
    <svg
      viewBox="0 0 360 300"
      className="mx-auto h-auto w-full max-w-[270px] lg:max-w-[300px]"
      role="img"
      aria-label={
        isEn
          ? "UnilakMart student marketplace campus illustration"
          : "Ilustrasi pasar kampus mahasiswa UnilakMart"
      }
    >
      {/* Lingkaran latar kartun selaras tema beranda */}
      <circle
        cx="182"
        cy="154"
        r="116"
        fill="#DCFCE7"
        stroke="#111827"
        strokeWidth="3"
        className="svg-hero-halo"
      />

      {/* Kartu ponsel / etalase katalog kampus */}
      <rect
        x="116"
        y="48"
        width="132"
        height="196"
        rx="20"
        fill="#111827"
        className="svg-dark-shadow"
      />
      <rect
        x="110"
        y="42"
        width="132"
        height="196"
        rx="20"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="3.5"
        className="svg-stroke-edge"
      />
      <rect
        x="126"
        y="62"
        width="100"
        height="54"
        rx="12"
        fill="#15803D"
        stroke="#111827"
        strokeWidth="2.5"
      />
      <circle
        cx="154"
        cy="89"
        r="14"
        fill="#FACC15"
        stroke="#111827"
        strokeWidth="2.5"
      />
      <path
        d="M148 89 L152.5 93.5 L161 84.5"
        fill="none"
        stroke="#111827"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="176" y="79" width="38" height="7" rx="3.5" fill="#FFFFFF" />
      <rect x="176" y="92" width="28" height="6" rx="3" fill="#DCFCE7" />

      {/* Daftar baris fitur di dalam kartu */}
      <rect
        x="126"
        y="130"
        width="100"
        height="18"
        rx="8"
        fill="#F0FDF4"
        stroke="#111827"
        strokeWidth="2"
      />
      <rect
        x="126"
        y="156"
        width="100"
        height="18"
        rx="8"
        fill="#FEF9C3"
        stroke="#111827"
        strokeWidth="2"
      />
      <rect
        x="126"
        y="186"
        width="100"
        height="28"
        rx="14"
        fill="#15803D"
        stroke="#111827"
        strokeWidth="2.5"
      />
      <text
        x="176"
        y="204"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="11"
        fontWeight="bold"
      >
        UNILAKMART
      </text>

      {/* Lencana mengambang kiri (KTM Terverifikasi) */}
      <rect
        x="26"
        y="94"
        width="104"
        height="56"
        rx="14"
        fill="#FACC15"
        stroke="#111827"
        strokeWidth="3"
        className="svg-stroke-edge"
      />
      <circle cx="48" cy="118" r="10" fill="#15803D" stroke="#111827" strokeWidth="2" />
      <rect x="64" y="111" width="52" height="7" rx="3.5" fill="#111827" />
      <rect x="64" y="123" width="38" height="6" rx="3" fill="#111827" opacity="0.65" />

      {/* Lencana mengambang kanan (Tas COD Kampus) */}
      <rect
        x="230"
        y="132"
        width="96"
        height="68"
        rx="14"
        fill="#15803D"
        stroke="#111827"
        strokeWidth="3"
        className="svg-stroke-edge"
      />
      <path
        d="M262 132 C262 118 294 118 294 132"
        fill="none"
        stroke="#111827"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="svg-stroke-edge"
      />
      <circle cx="278" cy="164" r="15" fill="#FACC15" stroke="#111827" strokeWidth="2.5" />
      <text
        x="278"
        y="169"
        textAnchor="middle"
        fill="#111827"
        fontSize="11"
        fontWeight="bold"
      >
        COD
      </text>

      {/* Pita teks status bawah */}
      <rect
        x="94"
        y="250"
        width="172"
        height="28"
        rx="14"
        fill="#111827"
        className="svg-dark-shape"
      />
      <text
        x="180"
        y="268"
        textAnchor="middle"
        fill="#FACC15"
        fontSize="11"
        fontWeight="bold"
      >
        {badgeText}
      </text>
    </svg>
  );
}

export function AuthSplitShell({
  variant,
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkLabel,
  footerLinkHref,
  topBanner,
}: AuthSplitShellProps) {
  const { authUserId, profile, signOutAccount, locale } = useMarketplace();
  const isEn = locale === "en";
  const isAdmin = Boolean(authUserId) && profile.systemRole === "admin";

  const panelTagline =
    variant === "daftar"
      ? isEn
        ? "Join verified Unilak students for safe campus COD trading."
        : "Gabung bersama mahasiswa Unilak untuk jual-beli COD kampus yang aman."
      : variant === "lupa-sandi"
        ? isEn
          ? "Regain access to your campus account safely via your registered email."
          : "Pulihkan akses akun kampus Anda dengan aman melalui email terdaftar."
        : isEn
          ? "Buy and sell textbooks, dorm essentials, and student UMKM with 0% fee."
          : "Jual-beli buku kuliah, barang kos, dan UMKM mahasiswa dengan 0% biaya admin.";

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
    >
      {topBanner}

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
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#FACC15] px-4 text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Admin Panel" : "Panel Admin"}
              </Link>
            )}
            <button
              type="button"
              onClick={() => void signOutAccount()}
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
            >
              {isEn ? "Log Out" : "Keluar Akun"}
            </button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 overflow-hidden rounded-3xl border-2 border-[#111827] bg-white shadow-[5px_5px_0px_#111827] md:grid-cols-12">
        {/* Panel Kiri: Ilustrasi & Identitas UnilakMart */}
        <div className="flex flex-col justify-between gap-5 border-b-2 border-[#111827] bg-[#F0FDF4] p-6 md:col-span-5 md:border-r-2 md:border-b-0 md:p-8">
          <div className="space-y-2">
            <span className="inline-block rounded-lg border border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111827]">
              {isEn ? "Unilak Campus Marketplace" : "Pasar Kampus Unilak"}
            </span>
            <p className="text-sm font-bold leading-relaxed text-[#14532D]">
              {panelTagline}
            </p>
          </div>

          <div className="hidden md:block">
            <AuthCampusIllustration variant={variant} isEn={isEn} />
          </div>

          <ul className="hidden space-y-2 text-xs font-bold text-[#111827] md:block">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#111827] bg-[#DCFCE7] text-[10px] text-[#14532D]">
                ✓
              </span>
              <span>
                {isEn
                  ? "Verified Unilak Student ID (1 NIM, 1 Account)"
                  : "Verifikasi KTM Unilak (1 NIM, 1 Akun)"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#111827] bg-[#FEF9C3] text-[10px] text-[#111827]">
                ✓
              </span>
              <span>
                {isEn
                  ? "Safe campus COD spots with WhatsApp privacy guard"
                  : "Titik COD kampus aman & privasi WhatsApp terjaga"}
              </span>
            </li>
          </ul>
        </div>

        {/* Panel Kanan: Formulir Terfokus */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-7 lg:p-10">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
              {title}
            </h1>
            <p className="text-xs font-medium leading-relaxed text-[#475569] sm:text-sm">
              {subtitle}
            </p>
          </div>

          {children}

          <div className="mt-6 border-t border-[#111827]/15 pt-5 text-center text-xs font-semibold text-[#475569] sm:text-sm">
            <span>{footerPrompt} </span>
            <Link
              href={footerLinkHref}
              className="inline-flex min-h-11 items-center font-extrabold text-[#15803D] underline decoration-2 underline-offset-4 hover:text-[#166534]"
            >
              {footerLinkLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
