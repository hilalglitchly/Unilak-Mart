"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ModalDialog } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";

function DesktopNavLinks({ activeOrdersCount }: { activeOrdersCount: number }) {
  const pathname = usePathname();
  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav aria-label="Navigasi utama" className="hidden items-center gap-1.5 md:flex">
      <Link
        href="/"
        aria-current={isActivePath("/") ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-bold transition-colors ${
          isActivePath("/")
            ? "bg-[#DCFCE7] text-[#14532D] underline decoration-2 underline-offset-4"
            : "text-[#111827] hover:bg-[#F0FDF4]"
        }`}
      >
        Beranda
      </Link>
      <Link
        href="/jual"
        aria-current={isActivePath("/jual") ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] px-4 text-sm font-extrabold transition-transform active:translate-x-[1px] active:translate-y-[1px] ${
          isActivePath("/jual")
            ? "bg-[#15803D] text-white"
            : "bg-[#FACC15] text-[#111827] hover:bg-[#FDE047]"
        }`}
      >
        + Jual
      </Link>
      <Link
        href="/pesanan"
        aria-current={isActivePath("/pesanan") ? "page" : undefined}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition-colors ${
          isActivePath("/pesanan")
            ? "bg-[#DCFCE7] text-[#14532D] underline decoration-2 underline-offset-4"
            : "text-[#111827] hover:bg-[#F0FDF4]"
        }`}
      >
        <span>Pesanan</span>
        {activeOrdersCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FACC15] px-1.5 text-[11px] font-extrabold text-[#111827] ring-1 ring-[#111827]">
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
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#111827] bg-white pt-1.5 pr-[max(0.5rem,env(safe-area-inset-right,0px))] pb-[max(0.45rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1">
        <li>
          <Link
            href="/"
            aria-label="Beranda"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center rounded-xl px-1 ${
              pathname === "/"
                ? "bg-[#DCFCE7] text-[#14532D] ring-1 ring-[#111827]"
                : "text-[#111827] hover:bg-[#F0FDF4]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              aria-hidden="true"
            >
              <path d="M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.5Z" />
            </svg>
          </Link>
        </li>

        <li>
          <Link
            href="/#katalog"
            aria-label="Cari produk"
            onClick={() => {
              if (typeof window !== "undefined" && window.location.pathname === "/") {
                document.getElementById("cari-produk")?.focus();
              }
            }}
            className="flex min-h-11 items-center justify-center rounded-xl px-1 text-[#111827] hover:bg-[#F0FDF4]"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              aria-hidden="true"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4 4" strokeLinecap="round" />
            </svg>
          </Link>
        </li>

        <li>
          <Link
            href="/jual"
            aria-label="Pasang listing"
            aria-current={isActivePath("/jual") ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] px-1 ${
              isActivePath("/jual")
                ? "bg-[#15803D] text-white"
                : "bg-[#FACC15] text-[#111827]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M10 4v12M4 10h12" strokeLinecap="round" />
            </svg>
          </Link>
        </li>

        <li>
          <Link
            href="/pesanan"
            aria-label={
              activeOrdersCount > 0
                ? `Pesanan (${activeOrdersCount} aktif)`
                : "Pesanan"
            }
            aria-current={isActivePath("/pesanan") ? "page" : undefined}
            className={`relative flex min-h-11 items-center justify-center rounded-xl px-1 ${
              isActivePath("/pesanan")
                ? "bg-[#DCFCE7] text-[#14532D] ring-1 ring-[#111827]"
                : "text-[#111827] hover:bg-[#F0FDF4]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="12" height="13" rx="2" />
              <path d="M7 8h6M7 11.5h4" strokeLinecap="round" />
            </svg>
            {activeOrdersCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-[calc(50%-18px)] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FACC15] px-1 text-[10px] font-extrabold text-[#111827] ring-1 ring-[#111827]"
              >
                {activeOrdersCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <Link
            href="/profil"
            aria-label="Profil"
            aria-current={isActivePath("/profil") || isActivePath("/admin") ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center rounded-xl px-1 ${
              isActivePath("/profil") || isActivePath("/admin")
                ? "bg-[#DCFCE7] text-[#14532D] ring-1 ring-[#111827]"
                : "text-[#111827] hover:bg-[#F0FDF4]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              aria-hidden="true"
            >
              <circle cx="10" cy="7" r="3.2" />
              <path d="M4 17a6 6 0 0 1 12 0" strokeLinecap="round" />
            </svg>
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
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const syncHeaderHeight = () => {
      const h = Math.ceil(headerEl.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--site-header-height", `${h}px`);
    };

    syncHeaderHeight();
    const ro = new ResizeObserver(syncHeaderHeight);
    ro.observe(headerEl);
    return () => ro.disconnect();
  }, []);

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
    <div className="flex min-h-dvh flex-col bg-white text-[#111827]">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:border-2 focus:border-[#111827] focus:bg-[#FACC15] focus:px-4 focus:py-2.5 focus:font-bold focus:text-[#111827]"
      >
        Lewati ke konten utama
      </a>

      {/* Header satu baris bersih di desktop, ringkas di mobile */}
      <header
        ref={headerRef}
        className="border-b-2 border-[#111827] bg-white lg:sticky lg:top-0 lg:z-40"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-2.5 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-xl py-0.5 pr-1"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] text-base font-extrabold text-[#FACC15] sm:h-10 sm:w-10 sm:text-lg">
                U
              </span>
              <span className="text-base font-extrabold tracking-tight text-[#111827] sm:text-xl">
                unilakmart.id
              </span>
            </Link>

            {/* Form Pencarian dalam <search> semantik */}
            <search className="order-3 w-full lg:order-2 lg:w-auto lg:max-w-md lg:flex-1">
              <form onSubmit={handleSearchSubmit}>
                <label htmlFor="cari-produk" className="sr-only">
                  Cari buku kuliah, jajanan UMKM, atau perlengkapan kos di Unilak
                </label>
                <div className="flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-3 py-1 transition-colors focus-within:bg-white">
                  <input
                    id="cari-produk"
                    name="q"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari buku, barang kos, atau UMKM..."
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    className="w-full min-w-0 bg-transparent text-base font-medium text-[#111827] placeholder:text-[#475569] focus:outline-none sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-[#111827] hover:bg-[#E2E8F0]"
                      aria-label="Hapus kata kunci pencarian"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="submit"
                    aria-label="Cari produk di katalog"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FACC15] text-[#111827] ring-1 ring-[#111827] hover:bg-[#FDE047] active:translate-x-[1px] active:translate-y-[1px]"
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

            {/* Navigasi Utama + Lonceng Notifikasi + Akun */}
            <div className="order-2 flex items-center gap-2 lg:order-3">
              <Suspense
                fallback={
                  <div className="hidden items-center gap-1.5 md:flex">
                    <span className="inline-flex min-h-11 items-center px-3.5 text-sm font-bold text-[#111827]">
                      Beranda
                    </span>
                    <span className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-4 text-sm font-extrabold text-[#111827]">
                      + Jual
                    </span>
                    <span className="inline-flex min-h-11 items-center px-3.5 text-sm font-bold text-[#111827]">
                      Pesanan
                    </span>
                  </div>
                }
              >
                <DesktopNavLinks activeOrdersCount={activeOrdersCount} />
              </Suspense>

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
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FACC15] px-1 text-[10px] font-extrabold text-[#111827] ring-2 ring-[#111827]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profil pada desktop/tablet (di mobile sudah ada pada navigasi bawah) */}
              <Link
                href="/profil"
                className="hidden min-h-11 items-center justify-center whitespace-nowrap rounded-xl border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-sm font-bold text-white hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px] md:inline-flex"
              >
                {profile.ktmStatus === "Terverifikasi" ? "Profil KTM" : "Masuk KTM"}
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="menu-mobile"
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-xs font-bold text-[#111827] hover:bg-[#F0FDF4] md:hidden"
              >
                Menu
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav
              id="menu-mobile"
              aria-label="Menu sekunder mobile"
              className="mt-2.5 flex flex-col gap-1 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-2.5 md:hidden"
            >
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
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-left text-sm font-semibold text-[#111827] hover:bg-white"
              >
                {onlySaved
                  ? "Tampilkan semua listing"
                  : `Listing Disimpan (${savedIds.length})`}
              </button>
              <Link
                href="/#titik-cod"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#111827] hover:bg-white"
              >
                Titik COD Kampus
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#15803D] hover:bg-white"
              >
                Panel Administrator
              </Link>
            </nav>
          )}
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t-2 border-[#111827] bg-[#F8FAFC] pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-8">
        <div className="mx-auto max-w-[1440px] space-y-6 px-4 pt-8 pb-2 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#15803D] text-sm font-extrabold text-[#FACC15]">
                  U
                </span>
                <span className="text-base font-extrabold tracking-tight text-[#111827]">
                  unilakmart.id
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-[#334155]">
                Pasar kampus dan etalase UMKM sivitas Universitas Lancang Kuning.
                Transaksi tatap muka COD tunai di titik kampus dengan 0% biaya admin.
              </p>
            </div>

            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#111827]">
                Jelajah Kampus
              </h2>
              <ul className="mt-2 space-y-0.5 text-xs font-semibold text-[#334155]">
                <li>
                  <Link
                    href="/#katalog"
                    className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
                  >
                    Katalog Kampus
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#etalase-umkm"
                    className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
                  >
                    Etalase UMKM Mahasiswa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#titik-cod"
                    className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
                  >
                    Titik COD Kampus
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#111827]">
                Layanan &amp; Akun
              </h2>
              <ul className="mt-2 space-y-0.5 text-xs font-semibold text-[#334155]">
                <li>
                  <Link
                    href="/jual"
                    className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
                  >
                    + Pasang Listing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pesanan"
                    className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
                  >
                    Daftar Pesanan COD
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profil"
                    className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
                  >
                    Profil &amp; Verifikasi KTM
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2 rounded-2xl border border-[#111827]/25 bg-white p-4">
              <h2 className="text-xs font-extrabold text-[#14532D]">
                Aman &amp; Patuh Privasi (UU PDP)
              </h2>
              <p className="text-xs font-medium leading-relaxed text-[#334155]">
                Hanya mahasiswa aktif berstatus Terverifikasi KTM. Dilarang menjual barang
                ilegal, rokok/vape, maupun jasa joki tugas/skripsi.
              </p>
              <p className="text-xs font-medium leading-relaxed text-[#475569]">
                Nomor WhatsApp dirahasiakan dan baru terbuka setelah status pesanan{" "}
                <strong className="text-[#111827]">Dijadwalkan</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-2 border-t border-[#111827]/15 pt-4 text-xs font-semibold text-[#475569] sm:flex-row sm:items-center">
            <p>
              UnilakMart Rilis 1 (Pratinjau MVP) • Universitas Lancang Kuning Pekanbaru.
            </p>
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center underline hover:text-[#111827]"
            >
              Panel Moderasi Admin (Pratinjau)
            </Link>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <MobileBottomNav activeOrdersCount={activeOrdersCount} />
      </Suspense>

      <ModalDialog
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        titleId="judul-modal-notifikasi"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="judul-modal-notifikasi" className="text-lg font-extrabold text-[#111827]">
              Notifikasi Pesanan &amp; Akun
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#475569]">
              {unreadCount} belum dibaca
            </p>
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

        {unreadCount > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="min-h-11 rounded-xl border border-[#111827]/35 bg-[#F0FDF4] px-3 py-1.5 text-xs font-bold text-[#14532D] hover:bg-[#DCFCE7]"
            >
              Tandai Semua Dibaca
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-5 text-center">
            <p className="text-sm font-bold text-[#111827]">Belum ada notifikasi baru</p>
            <p className="mt-1 text-xs font-medium text-[#334155]">
              Kabar status KTM dan transaksi COD Anda akan muncul di sini.
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
                <p className="text-sm font-extrabold text-[#111827]">{notif.title}</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-[#334155]">
                  {notif.message}
                </p>
                <p className="mt-1.5 text-[11px] font-bold text-[#475569]">
                  {notif.timestamp} • {notif.read ? "Sudah dibaca" : "Belum dibaca"}
                </p>
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
