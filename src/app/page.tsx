"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ModalDialog, ProductIllustration } from "@/components/CartoonVisuals";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  CATEGORIES,
  CONDITIONS,
  FACULTIES,
  formatRupiah,
  type CategoryId,
  type ItemCondition,
  type ProductItem,
  type SortOption,
} from "@/lib/preview-data";

export default function Home() {
  const {
    products,
    savedIds,
    toggleSave,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    selectedFaculty,
    setSelectedFaculty,
    onlySaved,
    setOnlySaved,
    codSpots,
    createOrder,
    profile,
  } = useMarketplace();

  const [selectedCondition, setSelectedCondition] = useState<"semua" | ItemCondition>("semua");
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // State modal COD
  const [codProduct, setCodProduct] = useState<ProductItem | null>(null);
  const [codSpotChoice, setCodSpotChoice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [proposedTime, setProposedTime] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [codTouched, setCodTouched] = useState(false);
  const [codError, setCodError] = useState("");
  const [codSuccessCode, setCodSuccessCode] = useState("");

  const activeSpots = codSpots.filter((s) => s.active);
  const visibleProducts = products.filter((p) => !p.hidden);
  const umkmSpotlight = visibleProducts.filter((p) => p.isUmkm).slice(0, 3);

  const openCodModal = (product: ProductItem) => {
    setCodProduct(product);
    const defaultSpot =
      product.codSpots.find((spotName) => activeSpots.some((a) => a.name === spotName)) ??
      activeSpots[0]?.name ??
      "";
    setCodSpotChoice(defaultSpot);
    setQuantity(1);
    setProposedTime("");
    setOrderNote("");
    setCodTouched(false);
    setCodError("");
    setCodSuccessCode("");
  };

  const applyQuickTime = (offsetDays: number, hourText: string) => {
    const base = new Date();
    base.setDate(base.getDate() + offsetDays);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    setProposedTime(`${yyyy}-${mm}-${dd}T${hourText}`);
    setCodError("");
  };

  const handleCodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codProduct) return;
    setCodTouched(true);

    if (!codSpotChoice || !proposedTime.trim()) {
      setCodError(
        "Pilih 1 titik COD kampus dan isi usulan hari serta jam ketemuan."
      );
      return;
    }
    if (quantity < 1 || (!codProduct.alwaysAvailable && quantity > codProduct.stock)) {
      setCodError(`Jumlah pesanan harus antara 1 sampai ${codProduct.stock}.`);
      return;
    }

    const formattedTime = proposedTime.includes("T")
      ? proposedTime.replace("T", " ") + " WIB"
      : proposedTime;

    const result = createOrder({
      product: codProduct,
      quantity,
      codSpot: codSpotChoice,
      proposedTime: formattedTime,
      note: orderNote,
    });

    if (!result.ok) {
      setCodError(result.error ?? "Gagal mengirim permintaan COD.");
      return;
    }

    setCodError("");
    setCodSuccessCode(result.order?.code ?? "UM-BARU");
  };

  const selectCategoryAndScroll = (category: CategoryId) => {
    setActiveCategory(category);
    setOnlySaved(false);
    document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("semua");
    setSelectedFaculty("semua");
    setSelectedCondition("semua");
    setSortBy("terbaru");
    setOnlySaved(false);
  };

  const filteredProducts = visibleProducts
    .filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.faculty.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q) ||
        item.codSpots.some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        activeCategory === "semua"
          ? true
          : activeCategory === "umkm"
            ? Boolean(item.isUmkm)
            : activeCategory === "gratis"
              ? item.price === 0
              : item.category === activeCategory;

      const matchesFaculty =
        selectedFaculty === "semua" || item.faculty === selectedFaculty;

      const matchesCondition =
        selectedCondition === "semua" || item.condition === selectedCondition;

      const matchesSaved = !onlySaved || savedIds.includes(item.id);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesFaculty &&
        matchesCondition &&
        matchesSaved
      );
    })
    .sort((a, b) => {
      if (sortBy === "termurah") return a.price - b.price;
      if (sortBy === "termahal") return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt);
    });

  const hasActiveFilters =
    activeCategory !== "semua" ||
    selectedFaculty !== "semua" ||
    selectedCondition !== "semua" ||
    searchQuery.trim() !== "" ||
    onlySaved;

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-[1440px] space-y-8 px-4 py-5 sm:space-y-11 sm:px-6 lg:px-10 lg:py-9"
    >
      {/* HERO SECTION: Ringkas di mobile (< sm), lengkap 2 kartu promo + ilustrasi di >= sm */}
      <section
        aria-labelledby="judul-hero"
        className="relative overflow-hidden rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-4 shadow-[4px_4px_0px_#111827] sm:p-8 sm:shadow-[5px_5px_0px_#111827] lg:p-10"
      >
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12 lg:gap-x-8">
          <div className="space-y-3 lg:col-span-7 lg:row-start-1">
            <h1
              id="judul-hero"
              className="text-[clamp(1.45rem,4vw,3rem)] font-extrabold leading-[1.15] tracking-tight text-[#111827]"
            >
              <span>Pasar </span>
              <span className="inline-block whitespace-nowrap rounded-lg border-2 border-[#111827] bg-[#FACC15] px-2 py-0.5 sm:px-2.5">
                Kampus Unilak
              </span>
              <span className="mt-1 block text-[#15803D]">
                Solusi Hemat <span className="text-[#111827]">Mahasiswa</span>
              </span>
              <span className="mt-1 block">0% Biaya Admin!</span>
            </h1>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-[#111827] sm:text-base">
              Jual-beli buku kuliah, perlengkapan kos, dan jajanan UMKM mahasiswa
              Universitas Lancang Kuning.{" "}
              <strong className="font-bold text-[#15803D]">
                Ketemuan langsung di Titik COD Kampus, aman dan terverifikasi KTM!
              </strong>
            </p>

            {/* Mobile CTA Ringkas (< sm) agar katalog & Etalase UMKM cepat terlihat */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 sm:hidden">
              <a
                href="#katalog"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-3 py-2 text-center text-xs font-bold text-white shadow-[2px_2px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Cari Barang Kuliah
              </a>
              <Link
                href="/jual"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-3 py-2 text-center text-xs font-extrabold text-[#111827] shadow-[2px_2px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px]"
              >
                + Jual / UMKM
              </Link>
            </div>
          </div>

          {/* 2 Kartu Promo Hero (Tablet & Desktop >= sm) */}
          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:col-span-7 lg:row-start-2">
            <div className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#111827] bg-[#FACC15] p-5 shadow-[4px_4px_0px_#111827]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold leading-tight text-[#111827]">
                    Kuliah &amp;
                    <span className="block text-[#14532D]">Praktikum</span>
                  </h2>
                  <p className="mt-2 text-xs font-semibold leading-snug text-[#111827]">
                    Buku, modul, dan alat lab harga mahasiswa hemat.
                  </p>
                </div>
                <svg
                  viewBox="0 0 96 110"
                  className="h-24 w-20 shrink-0"
                  aria-hidden="true"
                >
                  <rect x="32" y="4" width="32" height="20" rx="8" fill="#111827" />
                  <rect
                    x="10"
                    y="18"
                    width="76"
                    height="86"
                    rx="22"
                    fill="#15803D"
                    stroke="#111827"
                    strokeWidth="3.5"
                  />
                  <rect
                    x="22"
                    y="52"
                    width="52"
                    height="42"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#111827"
                    strokeWidth="3"
                  />
                  <rect
                    x="38"
                    y="62"
                    width="20"
                    height="10"
                    rx="3"
                    fill="#FACC15"
                    stroke="#111827"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => selectCategoryAndScroll("buku")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  Cek Katalog Buku
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#111827] bg-white p-5 shadow-[4px_4px_0px_#111827]">
              <div>
                <span className="inline-block rounded-md border-2 border-[#111827] bg-[#FACC15] px-2.5 py-1 text-xs font-extrabold text-[#111827]">
                  ETALASE GRATIS R1
                </span>
                <h2 className="mt-3 text-xl font-extrabold leading-tight text-[#15803D]">
                  Semua Produk
                  <span className="block text-[#111827]">UMKM &amp; Jasa</span>
                  <span className="block text-[#15803D]">Mahasiswa</span>
                </h2>
              </div>
              <div className="mt-4">
                <Link
                  href="/jual"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#111827] bg-[#111827] px-4 py-2 text-xs font-bold text-[#FACC15] shadow-[2px_2px_0px_#15803D] hover:bg-[#1E293B] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  Buka Lapak UMKM (&lt; 1 Menit)
                </Link>
              </div>
            </div>
          </div>

          {/* Ilustrasi Vektor Kartun Mahasiswa (disembunyikan di < sm agar halaman mobile ringkas) */}
          <div className="relative hidden justify-center sm:flex lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <svg
              viewBox="0 0 460 400"
              className="h-auto w-full max-w-[320px] lg:max-w-[460px]"
              role="img"
              aria-label="Ilustrasi kartun mahasiswa Unilak membawa tas belanja COD Kampus dan menggunakan laptop"
            >
              <circle
                cx="250"
                cy="210"
                r="155"
                fill="#DCFCE7"
                stroke="#111827"
                strokeWidth="3"
              />
              <g transform="translate(18, 18)">
                <rect x="4" y="4" width="142" height="56" rx="12" fill="#111827" />
                <rect
                  x="0"
                  y="0"
                  width="142"
                  height="56"
                  rx="12"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <text x="14" y="24" fill="#15803D" fontSize="13" fontWeight="bold">
                  Khusus KTM Aktif
                </text>
                <text x="14" y="43" fill="#111827" fontSize="12" fontWeight="bold">
                  Mahasiswa Unilak
                </text>
              </g>
              <g transform="translate(328, 36)">
                <rect x="4" y="4" width="84" height="68" rx="14" fill="#111827" />
                <rect
                  x="0"
                  y="0"
                  width="84"
                  height="68"
                  rx="14"
                  fill="#FACC15"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <polygon
                  points="42,14 48,27 62,29 52,39 54,53 42,46 30,53 32,39 22,29 36,27"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
              </g>
              <circle cx="195" cy="115" r="56" fill="#111827" />
              <circle cx="170" cy="160" r="64" fill="#111827" />
              <circle cx="255" cy="155" r="58" fill="#111827" />
              <path
                d="M150 210 L280 210 C320 210 345 245 355 310 L365 385 L105 385 L115 310 C125 245 135 210 150 210 Z"
                fill="#FACC15"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <path
                d="M196 210 L254 210 L246 385 L204 385 Z"
                fill="#FFFFFF"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <rect
                x="210"
                y="176"
                width="30"
                height="42"
                rx="10"
                fill="#FFFFFF"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <ellipse
                cx="225"
                cy="135"
                rx="44"
                ry="50"
                fill="#FFFFFF"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <path
                d="M180 122 C188 94 218 82 252 88 C268 92 274 108 272 124 C250 110 226 104 204 116 C192 122 184 124 180 122 Z"
                fill="#111827"
              />
              <circle cx="212" cy="134" r="4.5" fill="#111827" />
              <circle cx="240" cy="134" r="4.5" fill="#111827" />
              <path
                d="M214 152 C220 162 232 162 238 152"
                fill="none"
                stroke="#111827"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <ellipse
                cx="178"
                cy="138"
                rx="12"
                ry="18"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="3"
              />
              <ellipse
                cx="272"
                cy="138"
                rx="12"
                ry="18"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="3"
              />
              <rect
                x="104"
                y="206"
                width="48"
                height="38"
                rx="16"
                fill="none"
                stroke="#111827"
                strokeWidth="4"
              />
              <rect x="70" y="236" width="126" height="148" rx="14" fill="#111827" />
              <rect
                x="65"
                y="231"
                width="126"
                height="148"
                rx="14"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <circle
                cx="128"
                cy="292"
                r="24"
                fill="#FACC15"
                stroke="#111827"
                strokeWidth="3"
              />
              <text
                x="128"
                y="297"
                textAnchor="middle"
                fill="#111827"
                fontSize="14"
                fontWeight="bold"
              >
                UM
              </text>
              <text
                x="128"
                y="344"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="bold"
              >
                COD KAMPUS
              </text>
              <path
                d="M300 275 L435 275 L418 370 L282 370 Z"
                fill="#111827"
                stroke="#111827"
                strokeWidth="3"
              />
              <circle cx="358" cy="322" r="9" fill="#FACC15" />
              <rect x="255" y="368" width="180" height="12" rx="6" fill="#111827" />
              <path
                d="M402 186 L448 166 L432 206 L420 192 Z"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION 2 (UI-03, FR-15): STRIP KHUSUS ETALASE UMKM GRATIS DI BAGIAN ATAS */}
      <section
        id="etalase-umkm"
        aria-labelledby="judul-etalase-umkm"
        className="space-y-4 rounded-3xl border-[2.5px] border-[#111827] bg-[#FEF9C3] p-4 shadow-[4px_4px_0px_#111827] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-block rounded-md border-2 border-[#111827] bg-[#15803D] px-2.5 py-0.5 text-xs font-extrabold text-white">
              ETALASE UMKM GRATIS RILIS 1 (FR-15)
            </span>
            <h2
              id="judul-etalase-umkm"
              className="mt-1.5 text-[clamp(1.25rem,2.4vw,1.65rem)] font-extrabold text-[#111827]"
            >
              Produk &amp; Jasa UMKM Mahasiswa Unilak
            </h2>
          </div>

          <button
            type="button"
            onClick={() => selectCategoryAndScroll("umkm")}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-white px-4 py-2 text-xs font-extrabold text-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-[#FACC15]"
          >
            Lihat Semua UMKM
          </button>
        </div>

        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {umkmSpotlight.map((item) => (
            <article
              key={`spotlight-${item.id}`}
              className="flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col justify-between rounded-2xl border-[2.5px] border-[#111827] bg-white p-3.5 shadow-[3px_3px_0px_#111827] md:w-auto md:max-w-none"
            >
              <div>
                <Link
                  href={`/listing/${item.id}`}
                  className={`flex h-36 items-center justify-center rounded-xl border-2 border-[#111827] p-3 ${item.cardBg}`}
                >
                  {item.uploadedImages && item.uploadedImages[0] ? (
                    <Image
                      unoptimized
                      src={item.uploadedImages[0]}
                      alt={`Foto ${item.title}`}
                      width={280}
                      height={140}
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <ProductIllustration type={item.illustration} className="h-24 w-36" />
                  )}
                </Link>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-base font-extrabold text-[#15803D]">
                    {item.priceLabel}
                  </span>
                  <span className="rounded-md border border-[#111827] bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#14532D]">
                    {item.alwaysAvailable ? "Selalu Tersedia" : `Stok: ${item.stock}`}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-extrabold leading-snug text-[#111827]">
                  <Link href={`/listing/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#334155]">
                  {item.sellerName} • {item.faculty}{" "}
                  <span className="ml-1 inline-block rounded border border-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-extrabold text-[#14532D]">
                    Terverifikasi
                  </span>
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/listing/${item.id}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-xs font-bold text-[#111827] hover:bg-[#F0FDF4]"
                >
                  Detail
                </Link>
                <button
                  type="button"
                  onClick={() => openCodModal(item)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-3 py-2 text-xs font-bold text-white hover:bg-[#166534]"
                >
                  Pesan COD
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3: JELAJAHI KATEGORI KAMPUS (Bento Asimetris) */}
      <section id="kategori" aria-labelledby="judul-kategori" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="judul-kategori"
            className="text-[clamp(1.3rem,2.5vw,1.75rem)] font-extrabold tracking-tight text-[#111827]"
          >
            Jelajahi Kategori Kampus
          </h2>
          <a
            href="#katalog"
            onClick={() => resetFilters()}
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-[#15803D] hover:underline"
          >
            Tampilkan semua kategori
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-3xl border-[3px] border-[#111827] bg-[#111827] p-6 text-white shadow-[5px_5px_0px_#15803D] lg:col-span-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border-2 border-[#111827] bg-white px-3 py-1 text-xs font-extrabold text-[#111827]">
                Elektronik
              </span>
              <span className="rounded-md border-2 border-[#111827] bg-[#FACC15] px-3 py-1 text-xs font-extrabold text-[#111827]">
                Gadget Kuliah
              </span>
            </div>

            <div className="my-5 flex justify-center">
              <svg
                viewBox="0 0 220 170"
                className="h-36 w-44"
                role="img"
                aria-label="Ilustrasi kartun headphone dan tag kode pemrograman"
              >
                <path
                  d="M46 112 A64 62 0 0 1 174 112"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <rect
                  x="80"
                  y="58"
                  width="60"
                  height="34"
                  rx="8"
                  fill="#FACC15"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <text
                  x="110"
                  y="81"
                  textAnchor="middle"
                  fill="#111827"
                  fontSize="16"
                  fontWeight="bold"
                >
                  &lt;/&gt;
                </text>
                <rect
                  x="28"
                  y="82"
                  width="48"
                  height="74"
                  rx="22"
                  fill="#FACC15"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <rect
                  x="144"
                  y="82"
                  width="48"
                  height="74"
                  rx="22"
                  fill="#15803D"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="mb-3 text-lg font-extrabold text-white">
                Headphone, Laptop &amp; Alat Lab
              </h3>
              <button
                type="button"
                onClick={() => selectCategoryAndScroll("elektronik")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white bg-[#15803D] px-6 py-2 text-xs font-bold text-white hover:bg-[#166534]"
              >
                Filter Elektronik
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:col-span-4">
            <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border-[2.5px] border-[#111827] bg-white p-5 shadow-[4px_4px_0px_#111827] sm:flex-row">
              <svg
                viewBox="0 0 150 130"
                className="h-28 w-32 shrink-0"
                role="img"
                aria-label="Ilustrasi kartun meja laci anak kos"
              >
                <rect
                  x="10"
                  y="12"
                  width="130"
                  height="14"
                  rx="4"
                  fill="#FACC15"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <rect
                  x="16"
                  y="24"
                  width="118"
                  height="84"
                  rx="6"
                  fill="#F0FDF4"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <rect
                  x="28"
                  y="34"
                  width="94"
                  height="28"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <rect
                  x="28"
                  y="70"
                  width="94"
                  height="28"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <rect x="62" y="45" width="26" height="6" rx="3" fill="#15803D" />
                <rect x="62" y="81" width="26" height="6" rx="3" fill="#15803D" />
                <rect x="24" y="108" width="10" height="16" fill="#111827" />
                <rect x="116" y="108" width="10" height="16" fill="#111827" />
              </svg>

              <div className="space-y-3 text-center sm:text-left">
                <h3 className="text-lg font-extrabold leading-snug text-[#111827]">
                  Perabot Kos &amp; Meja Belajar
                </h3>
                <button
                  type="button"
                  onClick={() => selectCategoryAndScroll("kos")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534]"
                >
                  Filter Perabot Kos
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border-[2.5px] border-[#111827] bg-white p-5 shadow-[4px_4px_0px_#111827] sm:flex-row">
              <div className="space-y-3 text-center sm:text-left">
                <h3 className="text-lg font-extrabold leading-snug text-[#111827]">
                  Buku Kuliah, Modul &amp; Jasa Mahasiswa
                </h3>
                <button
                  type="button"
                  onClick={() => selectCategoryAndScroll("buku")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534]"
                >
                  Filter Buku &amp; Modul
                </button>
              </div>

              <svg
                viewBox="0 0 150 130"
                className="h-28 w-32 shrink-0"
                role="img"
                aria-label="Ilustrasi kartun dua mahasiswa berdiskusi"
              >
                <circle
                  cx="76"
                  cy="18"
                  r="12"
                  fill="#FACC15"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <rect
                  x="12"
                  y="72"
                  width="58"
                  height="54"
                  rx="20"
                  fill="#111827"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <circle
                  cx="41"
                  cy="48"
                  r="18"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <rect
                  x="22"
                  y="26"
                  width="38"
                  height="14"
                  rx="6"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="2"
                />
                <circle cx="106" cy="48" r="26" fill="#111827" />
                <rect
                  x="76"
                  y="74"
                  width="60"
                  height="52"
                  rx="20"
                  fill="#FACC15"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <circle
                  cx="106"
                  cy="50"
                  r="17"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border-[3px] border-[#111827] bg-[#FACC15] p-6 shadow-[5px_5px_0px_#111827] md:col-span-2 lg:col-span-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border-2 border-[#111827] bg-white px-3 py-1 text-xs font-extrabold text-[#111827]">
                Jajanan Kampus
              </span>
              <span className="rounded-md border-2 border-[#111827] bg-[#15803D] px-3 py-1 text-xs font-extrabold text-white">
                UMKM Mahasiswa
              </span>
            </div>

            <div className="my-5 flex justify-center">
              <svg
                viewBox="0 0 240 170"
                className="h-36 w-48"
                role="img"
                aria-label="Ilustrasi kartun keranjang belanja kuliner UMKM mahasiswa"
              >
                <rect
                  x="48"
                  y="24"
                  width="44"
                  height="60"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <rect
                  x="44"
                  y="16"
                  width="52"
                  height="12"
                  rx="5"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="2.5"
                />
                <rect
                  x="98"
                  y="30"
                  width="58"
                  height="54"
                  rx="8"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <ellipse
                  cx="172"
                  cy="58"
                  rx="26"
                  ry="22"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="3"
                />
                <rect x="22" y="68" width="196" height="14" rx="6" fill="#111827" />
                <path
                  d="M32 82 L208 82 L190 158 L50 158 Z"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="3.5"
                />
                <rect
                  x="64"
                  y="96"
                  width="12"
                  height="48"
                  rx="4"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="2"
                />
                <rect
                  x="98"
                  y="96"
                  width="12"
                  height="48"
                  rx="4"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="2"
                />
                <rect
                  x="132"
                  y="96"
                  width="12"
                  height="48"
                  rx="4"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="2"
                />
                <rect
                  x="166"
                  y="96"
                  width="12"
                  height="48"
                  rx="4"
                  fill="#15803D"
                  stroke="#111827"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="mb-3 text-lg font-extrabold text-[#111827]">
                Jajanan Kampus, Stok Selalu Tersedia
              </h3>
              <button
                type="button"
                onClick={() => selectCategoryAndScroll("jajanan")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#111827] px-6 py-2 text-xs font-bold text-[#FACC15] hover:bg-[#1E293B]"
              >
                Filter Jajanan Kampus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: KATALOG LISTING TERBARU + FILTER KATEGORI, FAKULTAS, KONDISI & URUTKAN */}
      <section id="katalog" aria-labelledby="judul-katalog" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border-2 border-[#111827] bg-[#FEF9C3] px-2.5 py-1 text-xs font-bold text-[#111827]">
              <span>Contoh Katalog Pilot R1 (Data Simulasi Pratinjau)</span>
            </div>
            <h2
              id="judul-katalog"
              className="mt-2 text-[clamp(1.3rem,2.5vw,1.75rem)] font-extrabold tracking-tight text-[#111827]"
            >
              Listing Terbaru &amp; Katalog Kampus
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#334155]">
            <span>Menampilkan {filteredProducts.length} listing</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3 py-1.5 text-xs font-bold text-[#111827] hover:bg-[#F0FDF4]"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Baris Filter Kategori tepat di atas Katalog */}
        <div
          role="toolbar"
          aria-label="Filter kategori katalog"
          className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id && !onlySaved;
            const isUmkmPill = cat.id === "umkm";
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOnlySaved(false);
                }}
                aria-pressed={isSelected}
                className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-transform active:translate-x-[1px] active:translate-y-[1px] sm:text-sm ${
                  isSelected
                    ? "border-2 border-[#111827] bg-[#15803D] text-white shadow-[2px_2px_0px_#111827]"
                    : isUmkmPill
                      ? "border-2 border-[#111827] bg-[#FACC15] text-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-[#FDE047]"
                      : "border border-[#111827]/35 bg-white text-[#111827] hover:border-[#111827] hover:bg-[#F0FDF4]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filter Fakultas, Kondisi, Urutkan & Disimpan (Ringkas + Collapsible pada mobile 360px) */}
        <div className="space-y-3 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:hidden">
            <div className="flex-1">
              <label htmlFor="sort-mobile" className="sr-only">
                Urutkan katalog
              </label>
              <select
                id="sort-mobile"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-sm font-bold text-[#111827]"
              >
                <option value="terbaru">Urutkan: Terbaru</option>
                <option value="termurah">Urutkan: Harga Terendah</option>
                <option value="termahal">Urutkan: Harga Tertinggi</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              aria-expanded={showAdvancedFilters}
              aria-controls="panel-filter-lanjut"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-extrabold text-[#111827]"
            >
              {showAdvancedFilters ? "Tutup Filter" : "Filter Fakultas & Kondisi"}
            </button>
          </div>

          <div
            id="panel-filter-lanjut"
            className={`${
              showAdvancedFilters ? "grid" : "hidden"
            } grid-cols-1 gap-3 sm:grid sm:grid-cols-4 sm:items-end`}
          >
            <div>
              <label
                htmlFor="filter-fakultas"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Fakultas Unilak (FR-12)
              </label>
              <select
                id="filter-fakultas"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              >
                <option value="semua">Semua Fakultas</option>
                {FACULTIES.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-kondisi"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Kondisi Barang (FR-13)
              </label>
              <select
                id="filter-kondisi"
                value={selectedCondition}
                onChange={(e) =>
                  setSelectedCondition(e.target.value as "semua" | ItemCondition)
                }
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827] sm:text-sm"
              >
                <option value="semua">Semua Kondisi</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block">
              <label
                htmlFor="filter-urutkan"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Urutkan (FR-14)
              </label>
              <select
                id="filter-urutkan"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-sm font-semibold text-[#111827]"
              >
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Harga Terendah</option>
                <option value="termahal">Harga Tertinggi</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOnlySaved((prev) => !prev)}
                aria-pressed={onlySaved}
                className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#111827] px-3 py-2 text-xs font-extrabold transition-colors ${
                  onlySaved
                    ? "bg-[#FACC15] text-[#111827]"
                    : "bg-[#DCFCE7] text-[#14532D] hover:bg-[#BBF7D0]"
                }`}
              >
                <span>
                  {onlySaved
                    ? `Menampilkan Disimpan (${savedIds.length})`
                    : `Filter Disimpan (${savedIds.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid Katalog Produk */}
        {filteredProducts.length === 0 ? (
          <div
            role="status"
            className="rounded-3xl border-[2.5px] border-[#111827] bg-[#F0FDF4] p-8 text-center shadow-[4px_4px_0px_#111827]"
          >
            <h3 className="text-lg font-extrabold text-[#111827]">
              Belum ada listing yang cocok dengan filter ini
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#334155]">
              Pencarian atau kombinasi filter kategori, fakultas, dan kondisi tidak
              menemukan listing di katalog pratinjau Rilis 1. Reset filter untuk melihat
              semua produk.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#111827] hover:bg-[#166534]"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((item) => {
              const isSaved = savedIds.includes(item.id);
              const isSoldOut = !item.alwaysAvailable && item.stock <= 0;
              return (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl border-[2.5px] border-[#111827] bg-white p-3.5 shadow-[4px_4px_0px_#111827]"
                >
                  <div>
                    <div
                      className={`relative flex h-48 items-center justify-center rounded-2xl border-2 border-[#111827] p-4 ${item.cardBg}`}
                    >
                      <span
                        className={`absolute top-3 left-3 rounded-md border-2 border-[#111827] px-2.5 py-1 text-xs font-extrabold ${
                          item.badgeTone === "green"
                            ? "bg-[#15803D] text-white"
                            : "bg-[#FACC15] text-[#111827]"
                        }`}
                      >
                        {item.badge}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleSave(item.id)}
                        aria-pressed={isSaved}
                        aria-label={
                          isSaved
                            ? `Hapus ${item.title} dari daftar tersimpan`
                            : `Simpan ${item.title}`
                        }
                        className={`absolute top-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#111827] transition-transform active:scale-95 ${
                          isSaved
                            ? "bg-[#FACC15] text-[#111827]"
                            : "bg-[#111827] text-white hover:bg-[#1E293B]"
                        }`}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="h-5 w-5"
                          fill={isSaved ? "#111827" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M5 3h10a1 1 0 0 1 1 1v13l-6-3.5L4 17V4a1 1 0 0 1 1-1z" />
                        </svg>
                      </button>

                      <Link
                        href={`/listing/${item.id}`}
                        className="flex h-full w-full items-center justify-center"
                        aria-label={`Lihat detail ${item.title}`}
                      >
                        {item.uploadedImages && item.uploadedImages[0] ? (
                          <Image
                            unoptimized
                            src={item.uploadedImages[0]}
                            alt={`Foto ${item.title}`}
                            width={320}
                            height={180}
                            className="h-full w-full rounded-xl object-contain"
                          />
                        ) : (
                          <ProductIllustration type={item.illustration} />
                        )}
                      </Link>
                    </div>

                    <div className="mt-4 space-y-2 px-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-lg font-extrabold text-[#15803D]">
                          {item.priceLabel}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-xs font-extrabold ${
                            isSoldOut
                              ? "border-[#991B1B] bg-[#FEF2F2] text-[#991B1B]"
                              : "border-[#111827]/40 bg-[#F8FAFC] text-[#111827]"
                          }`}
                        >
                          {item.alwaysAvailable
                            ? "Selalu Tersedia"
                            : isSoldOut
                              ? "Terjual (Stok 0)"
                              : `Stok: ${item.stock}`}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold leading-snug text-[#111827]">
                        <Link href={`/listing/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h3>

                      <p className="text-xs font-semibold text-[#334155]">
                        {item.condition} • Fakultas {item.faculty}
                      </p>

                      {/* Info Penjual + Lencana Terverifikasi (UI-05) */}
                      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#111827]/25 bg-[#F0FDF4] px-2.5 py-1.5 text-xs font-semibold text-[#111827]">
                        <span className="truncate">
                          {item.sellerName} ({item.sellerProdi})
                        </span>
                        {item.sellerVerified && (
                          <span className="rounded border border-[#15803D] bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-[#14532D]">
                            Terverifikasi
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-[#334155]">
                        COD: {item.codSpots[0]}
                        {item.codSpots.length > 1
                          ? ` (+${item.codSpots.length - 1} titik)`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 pt-1">
                    <Link
                      href={`/listing/${item.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-3.5 py-2 text-xs font-bold text-[#111827] hover:bg-[#F0FDF4]"
                    >
                      Detail
                    </Link>
                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => openCodModal(item)}
                      className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-[#111827] px-4 py-2 text-xs font-bold sm:text-sm ${
                        isSoldOut
                          ? "border-[#111827]/40 bg-[#E2E8F0] text-[#334155]"
                          : "bg-[#15803D] text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px]"
                      }`}
                    >
                      {isSoldOut ? "Stok Habis" : "Pesan COD Sekarang"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 5: TITIK COD KAMPUS & ALUR TRANSAKSI UU PDP */}
      <section
        id="titik-cod"
        aria-labelledby="judul-cod"
        className="grid grid-cols-1 gap-6 rounded-3xl border-[3px] border-[#111827] bg-[#FEF9C3] p-5 shadow-[5px_5px_0px_#111827] sm:p-8 lg:grid-cols-12"
      >
        <div className="space-y-4 lg:col-span-5">
          <span className="inline-block rounded-md border-2 border-[#111827] bg-white px-3 py-1 text-xs font-extrabold text-[#111827]">
            KEAMANAN KAMPUS RILIS 1
          </span>
          <h2
            id="judul-cod"
            className="text-2xl font-extrabold leading-tight text-[#111827]"
          >
            {activeSpots.length} Titik COD Aktif di Lingkungan Unilak
          </h2>
          <p className="text-sm font-medium leading-relaxed text-[#111827]">
            Seluruh transaksi Rilis 1 memakai pembayaran tunai saat ketemuan (COD) tanpa
            biaya platform. Daftar titik aktif dikelola administrator kampus:
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {activeSpots.map((spot) => (
              <li
                key={spot.id}
                className="rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-xs text-[#111827]"
              >
                <span className="block font-extrabold">{spot.name}</span>
                <span className="text-[11px] font-medium text-[#334155]">
                  {spot.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          id="panduan"
          className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#111827] bg-white p-5 shadow-[4px_4px_0px_#111827] lg:col-span-7"
        >
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-[#111827]">
              Alur Pesanan &amp; Perlindungan Privasi Nomor WhatsApp (UU PDP)
            </h3>
            <p className="text-xs font-medium leading-relaxed text-[#334155] sm:text-sm">
              Nomor WhatsApp penjual dan pembeli tidak ditampilkan bebas di halaman
              publik. Tombol <strong>Hubungi via WhatsApp</strong> baru terbuka setelah
              penjual menyetujui jadwal COD (status <code>Dijadwalkan</code>).
            </p>

            <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li className="rounded-xl border-2 border-[#111827] bg-[#F0FDF4] p-3">
                <span className="text-xs font-extrabold text-[#15803D]">
                  1. Status: Menunggu
                </span>
                <p className="mt-1 text-xs font-medium text-[#111827]">
                  Pembeli memilih 1 titik COD dan mengusulkan waktu. Otomatis kedaluwarsa
                  bila tidak dijawab 24 jam.
                </p>
              </li>
              <li className="rounded-xl border-2 border-[#111827] bg-[#F0FDF4] p-3">
                <span className="text-xs font-extrabold text-[#15803D]">
                  2. Status: Dijadwalkan
                </span>
                <p className="mt-1 text-xs font-medium text-[#111827]">
                  Penjual menerima jadwal. Tombol koordinasi WhatsApp terbuka bagi kedua
                  pihak di halaman Pesanan.
                </p>
              </li>
              <li className="rounded-xl border-2 border-[#111827] bg-[#F0FDF4] p-3">
                <span className="text-xs font-extrabold text-[#15803D]">
                  3. Status: Sudah Diserahkan
                </span>
                <p className="mt-1 text-xs font-medium text-[#111827]">
                  Barang diperiksa langsung di titik COD dan dibayar tunai tanpa potongan.
                </p>
              </li>
              <li className="rounded-xl border-2 border-[#111827] bg-[#F0FDF4] p-3">
                <span className="text-xs font-extrabold text-[#15803D]">
                  4. Status: Selesai
                </span>
                <p className="mt-1 text-xs font-medium text-[#111827]">
                  Pembeli konfirmasi selesai (atau otomatis 48 jam) dan memberi ulasan
                  bintang 1 sampai 5.
                </p>
              </li>
            </ol>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#111827]/10 pt-4">
            <span className="text-xs font-bold text-[#334155]">
              Status KTM saat ini:{" "}
              <strong className="text-[#15803D]">{profile.ktmStatus}</strong>
            </span>
            <Link
              href="/profil"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-5 py-2 text-xs font-extrabold text-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-[#FDE047]"
            >
              Kelola Profil &amp; KTM Mahasiswa
            </Link>
          </div>
        </div>
      </section>

      {/* DIALOG MODAL PESAN COD CEPAT (Jumlah + Spot COD + Jam Temu + Catatan) */}
      <ModalDialog
        open={Boolean(codProduct)}
        onClose={() => setCodProduct(null)}
        titleId="judul-modal-cod"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block rounded-md border-2 border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold text-[#111827]">
              Ajukan Jadwal COD
            </span>
            <h2 id="judul-modal-cod" className="mt-2 text-lg font-extrabold text-[#111827]">
              {codProduct?.title ?? "Pesan Produk"}
            </h2>
            <p className="text-sm font-bold text-[#15803D]">
              {codProduct ? formatRupiah(codProduct.price * quantity) : ""} • 0% Biaya
              Admin
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCodProduct(null)}
            aria-label="Tutup dialog pesanan COD"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] font-extrabold text-[#111827] hover:bg-[#E2E8F0]"
          >
            ✕
          </button>
        </div>

        {codSuccessCode ? (
          <div
            role="status"
            className="mt-5 space-y-4 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-4"
          >
            <p className="text-sm font-extrabold text-[#15803D]">
              Pesanan {codSuccessCode} dibuat (Status: Menunggu)
            </p>
            <p className="text-xs font-medium leading-relaxed text-[#111827]">
              Permintaan COD untuk <strong>{quantity}x</strong> item di{" "}
              <strong>{codSpotChoice}</strong> tercatat ke daftar pesanan. Tunggu
              konfirmasi penjual untuk membuka tombol WhatsApp.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/pesanan"
                onClick={() => setCodProduct(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-4 py-2 text-xs font-bold text-white"
              >
                Lihat di Halaman Pesanan
              </Link>
              <button
                type="button"
                onClick={() => setCodProduct(null)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCodSubmit} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="pilih-titik-cod"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  Titik COD yang Didukung Penjual
                </label>
                <select
                  id="pilih-titik-cod"
                  name="cod_spot"
                  value={codSpotChoice}
                  onChange={(e) => setCodSpotChoice(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-semibold text-[#111827] sm:text-sm"
                >
                  {(codProduct?.codSpots ?? []).map((spot) => (
                    <option key={spot} value={spot}>
                      {spot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="jumlah-pesan-cod"
                  className="block text-xs font-extrabold text-[#111827]"
                >
                  Jumlah
                </label>
                <input
                  id="jumlah-pesan-cod"
                  name="quantity"
                  type="number"
                  min={1}
                  max={codProduct?.alwaysAvailable ? 20 : codProduct?.stock ?? 1}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-bold text-[#111827] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="waktu-cod"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Usulan Hari &amp; Jam Ketemuan
              </label>
              <input
                id="waktu-cod"
                name="proposed_time"
                type="datetime-local"
                value={proposedTime}
                aria-invalid={Boolean(codTouched && !proposedTime.trim())}
                onBlur={() => {
                  setCodTouched(true);
                  if (!proposedTime.trim()) {
                    setCodError("Mohon tentukan hari dan jam ketemuan COD.");
                  }
                }}
                onChange={(e) => {
                  setProposedTime(e.target.value);
                  setCodError("");
                }}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyQuickTime(0, "15:00")}
                  className="min-h-11 rounded-xl border border-[#111827] bg-[#F0FDF4] px-2.5 text-xs font-bold text-[#14532D] hover:bg-[#DCFCE7]"
                >
                  Hari ini 15.00
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(1, "10:00")}
                  className="min-h-11 rounded-xl border border-[#111827] bg-[#F0FDF4] px-2.5 text-xs font-bold text-[#14532D] hover:bg-[#DCFCE7]"
                >
                  Besok 10.00
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(1, "13:00")}
                  className="min-h-11 rounded-xl border border-[#111827] bg-[#F0FDF4] px-2.5 text-xs font-bold text-[#14532D] hover:bg-[#DCFCE7]"
                >
                  Besok 13.00
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="catatan-cod"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Catatan untuk Penjual (Opsional, FR-20)
              </label>
              <textarea
                id="catatan-cod"
                name="order_note"
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Contoh: Pakai jaket almamater hijau di depan lobby."
                className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] placeholder:text-[#475569] sm:text-sm"
              />
            </div>

            {codError && (
              <div
                role="alert"
                className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
              >
                Perhatian: {codError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCodProduct(null)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534]"
              >
                Kirim Permintaan COD
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </main>
  );
}
