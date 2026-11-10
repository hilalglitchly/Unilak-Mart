"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";

function DesktopNavLinks({ activeOrdersCount }: { activeOrdersCount: number }) {
  const pathname = usePathname();
  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
      <Link
        href="/"
        className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
          isActivePath("/")
            ? "bg-[#DCFCE7] text-[#14532D] font-extrabold"
            : "text-[#111827] hover:bg-[#F0FDF4]"
        }`}
      >
        Beranda
      </Link>
      <Link
        href="/#katalog"
        className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#111827] hover:bg-[#F0FDF4]"
      >
        Cari
      </Link>
      <Link
        href="/jual"
        className={`inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] px-3.5 text-xs font-extrabold transition-transform active:translate-x-[1px] active:translate-y-[1px] sm:text-sm ${
          isActivePath("/jual")
            ? "bg-[#15803D] text-white"
            : "bg-[#FACC15] text-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-[#FDE047]"
        }`}
      >
        + Jual
      </Link>
      <Link
        href="/pesanan"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${
          isActivePath("/pesanan")
            ? "bg-[#DCFCE7] text-[#14532D] font-extrabold"
            : "text-[#111827] hover:bg-[#F0FDF4]"
        }`}
      >
        <span>Pesanan</span>
        {activeOrdersCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#111827] bg-[#FACC15] px-1 text-[11px] font-extrabold text-[#111827]">
            {activeOrdersCount}
          </span>
        )}
      </Link>
    </nav>
  );
}

function MobileBottomNav({ activeOrdersCount }: { activeOrdersCount: number }) {
  const pathname = usePathname();
  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigasi bawah mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#111827] bg-white px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-3px_0_#111827] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1">
        <li>
          <Link
            href="/"
            className={`flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-bold ${
              pathname === "/"
                ? "border-2 border-[#111827] bg-[#DCFCE7] text-[#14532D]"
                : "text-[#111827] hover:bg-[#F0FDF4]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.5Z" />
            </svg>
            <span>Beranda</span>
          </Link>
        </li>

        <li>
          <Link
            href="/#katalog"
            className="flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-bold text-[#111827] hover:bg-[#F0FDF4]"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4 4" strokeLinecap="round" />
            </svg>
            <span>Cari</span>
          </Link>
        </li>

        <li>
          <Link
            href="/jual"
            className={`flex min-h-12 flex-col items-center justify-center rounded-xl border-2 border-[#111827] px-1 text-[11px] font-extrabold ${
              isActivePath("/jual")
                ? "bg-[#15803D] text-white"
                : "bg-[#FACC15] text-[#111827]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden="true"
            >
              <path d="M10 4v12M4 10h12" strokeLinecap="round" />
            </svg>
            <span>Jual</span>
          </Link>
        </li>

        <li>
          <Link
            href="/pesanan"
            className={`relative flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-bold ${
              isActivePath("/pesanan")
                ? "border-2 border-[#111827] bg-[#DCFCE7] text-[#14532D]"
                : "text-[#111827] hover:bg-[#F0FDF4]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="12" height="13" rx="2" />
              <path d="M7 8h6M7 11.5h4" strokeLinecap="round" />
            </svg>
            <span>Pesanan</span>
            {activeOrdersCount > 0 && (
              <span className="absolute top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#111827] bg-[#FACC15] px-1 text-[10px] font-extrabold text-[#111827]">
                {activeOrdersCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link
            href="/profil"
            className={`flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-bold ${
              isActivePath("/profil") || isActivePath("/admin")
                ? "border-2 border-[#111827] bg-[#DCFCE7] text-[#14532D]"
                : "text-[#111827] hover:bg-[#F0FDF4]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="10" cy="7" r="3.2" />
              <path d="M4 17a6 6 0 0 1 12 0" strokeLinecap="round" />
            </svg>
            <span>Profil</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    savedIds,
    onlySaved,
    setOnlySaved,
    orders,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    profile,
  } = useMarketplace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeOrdersCount = orders.filter(
    (o) =>
      o.status === "Menunggu" ||
      o.status === "Dijadwalkan" ||
      o.status === "Sudah Diserahkan"
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      router.push("/#katalog");
    } else {
      document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111827]">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:border-2 focus:border-[#111827] focus:bg-[#FACC15] focus:px-4 focus:py-2.5 focus:font-bold focus:text-[#111827]"
      >
        Lewati ke konten utama
      </a>

      {/* Header Responsif Desktop + Mobile */}
      <header className="border-b-2 border-[#111827] bg-white lg:sticky lg:top-0 lg:z-40">
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            {/* Brand Logo */}
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl py-1 sm:gap-3 sm:px-1"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-[#111827] bg-[#15803D] text-lg font-extrabold text-[#FACC15] shadow-[2px_2px_0px_#111827] sm:h-11 sm:w-11 sm:text-xl">
                U
              </span>
              <span className="text-sm font-extrabold tracking-tight text-[#111827] sm:text-xl lg:text-2xl">
                unilakmart.id
              </span>
            </Link>

            {/* Form Pencarian dalam <search> semantik */}
            <search className="order-3 w-full lg:order-2 lg:w-auto lg:max-w-md lg:flex-1">
              <form onSubmit={handleSearchSubmit}>
                <label htmlFor="cari-produk" className="sr-only">
                  Cari buku kuliah, jajanan UMKM, atau perlengkapan kos di Unilak
                </label>
                <div className="flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-3 py-1 shadow-[2px_2px_0px_#111827] focus-within:bg-white">
                  <input
                    id="cari-produk"
                    name="q"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari buku kuliah, UMKM, kos di Unilak..."
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    className="w-full min-w-0 bg-transparent text-base font-medium text-[#111827] placeholder:text-[#475569] focus:outline-none sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mr-1 min-h-9 min-w-9 rounded-lg px-2 text-xs font-bold text-[#111827] hover:bg-[#E2E8F0]"
                      aria-label="Hapus kata kunci pencarian"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="submit"
                    aria-label="Cari produk di katalog"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] text-[#111827] hover:bg-[#FDE047] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <circle cx="8.5" cy="8.5" r="5.5" />
                      <path d="M13 13L17 17" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </form>
            </search>

            {/* Navigasi 5 Menu + Lonceng Notifikasi */}
            <div className="order-2 flex items-center gap-1.5 sm:gap-2 lg:order-3">
              <Suspense
                fallback={
                  <div className="hidden items-center gap-1 md:flex">
                    <span className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#111827]">
                      Beranda
                    </span>
                    <span className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#111827]">
                      Cari
                    </span>
                    <span className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-3.5 text-sm font-extrabold text-[#111827]">
                      + Jual
                    </span>
                    <span className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#111827]">
                      Pesanan
                    </span>
                  </div>
                }
              >
                <DesktopNavLinks activeOrdersCount={activeOrdersCount} />
              </Suspense>

              {/* Ikon Lonceng Notifikasi (FR-25) */}
              <button
                type="button"
                onClick={() => setNotifOpen(true)}
                aria-label={
                  unreadCount > 0
                    ? `Buka notifikasi (${unreadCount} belum dibaca)`
                    : "Buka notifikasi"
                }
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#111827] bg-white text-[#111827] hover:bg-[#F0FDF4] active:translate-x-[1px] active:translate-y-[1px]"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M15 8a5 5 0 0 0-10 0c0 4-2 5.5-2 5.5h14s-2-1.5-2-5.5Z" />
                  <path d="M8.5 16.5a1.5 1.5 0 0 0 3 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-1 text-[10px] font-extrabold text-[#111827]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Tombol Profil / Masuk KTM */}
              <Link
                href="/profil"
                className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border-2 border-[#111827] bg-[#15803D] px-3 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px] sm:px-4 sm:text-sm"
              >
                <span className="sm:hidden">Profil</span>
                <span className="hidden sm:inline">
                  {profile.ktmStatus === "Terverifikasi" ? "Profil KTM" : "Masuk KTM"}
                </span>
              </Link>

              {/* Tombol Menu Sekunder Mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="menu-mobile"
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-2.5 py-2 text-xs font-bold text-[#111827] md:hidden"
              >
                Menu
              </button>
            </div>
          </div>

          {/* Drawer Sekunder Mobile */}
          {mobileMenuOpen && (
            <nav
              id="menu-mobile"
              aria-label="Menu sekunder mobile"
              className="mt-3 flex flex-col gap-1 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-3 md:hidden"
            >
              <Link
                href="/#kategori"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-[#111827] hover:bg-white"
              >
                Jelajahi Kategori Kampus
              </Link>
              <Link
                href="/#titik-cod"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-[#111827] hover:bg-white"
              >
                Daftar Titik COD Kampus
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOnlySaved((prev) => !prev);
                  setMobileMenuOpen(false);
                  if (typeof window !== "undefined" && window.location.pathname !== "/") {
                    router.push("/#katalog");
                  } else {
                    document
                      .getElementById("katalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                aria-pressed={onlySaved}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-left font-semibold text-[#111827] hover:bg-white"
              >
                {onlySaved
                  ? "Tampilkan semua listing"
                  : `Listing Disimpan (${savedIds.length})`}
              </button>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-[#15803D] hover:bg-white"
              >
                Panel Administrator R1
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Konten Utama (padding bawah pada mobile agar tidak tertutup Bottom Nav) */}
      <div className="flex-1 pb-24 md:pb-0">{children}</div>

      {/* Footer R1 */}
      <footer className="border-t-2 border-[#111827] bg-[#F0FDF4] pb-24 md:pb-0">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-4 py-6 text-xs font-semibold text-[#334155] sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <p>
            UnilakMart Rilis 1 MVP • Pasar Kampus &amp; Etalase UMKM Mahasiswa Universitas
            Lancang Kuning.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/#etalase-umkm"
              className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
            >
              Etalase UMKM
            </Link>
            <Link
              href="/#katalog"
              className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
            >
              Katalog
            </Link>
            <Link
              href="/#titik-cod"
              className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
            >
              Titik COD
            </Link>
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
            >
              Admin R1
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar 5 Menu Konsisten (UI-02) */}
      <Suspense fallback={null}>
        <MobileBottomNav activeOrdersCount={activeOrdersCount} />
      </Suspense>

      {/* Dialog Notifikasi In-App (FR-25) */}
      <ModalDialog
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        titleId="judul-modal-notifikasi"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block rounded-md border-2 border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold text-[#111827]">
              Notifikasi In-App R1
            </span>
            <h2
              id="judul-modal-notifikasi"
              className="mt-2 text-lg font-extrabold text-[#111827]"
            >
              Kabar Pesanan &amp; Verifikasi
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setNotifOpen(false)}
            aria-label="Tutup dialog notifikasi"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold text-[#111827] hover:bg-[#E2E8F0]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#334155]">
            {unreadCount} notifikasi belum dibaca
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="min-h-11 rounded-xl border-2 border-[#111827] bg-[#F0FDF4] px-3 py-1.5 text-xs font-bold text-[#14532D] hover:bg-[#DCFCE7]"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-5 text-center">
            <p className="text-sm font-bold text-[#111827]">
              Belum ada notifikasi baru
            </p>
            <p className="mt-1 text-xs font-medium text-[#334155]">
              Pembaruan status KTM, pesanan COD, dan laporan akan muncul di sini.
            </p>
          </div>
        ) : (
          <ul className="mt-3 max-h-[55vh] space-y-2.5 overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`rounded-2xl border-2 border-[#111827] p-3.5 ${
                  notif.read ? "bg-white" : "bg-[#FEF9C3]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#111827]">
                      {notif.title}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-[#334155]">
                      {notif.message}
                    </p>
                    <p className="mt-1.5 text-[11px] font-bold text-[#475569]">
                      {notif.timestamp} • {!notif.read ? "Belum dibaca" : "Sudah dibaca"}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href={notif.href}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setNotifOpen(false);
                    }}
                    className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#166534]"
                  >
                    Buka Halaman Terkait
                  </Link>
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notif.id)}
                      className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3 py-1.5 text-xs font-bold text-[#111827]"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ModalDialog>
    </div>
  );
}
