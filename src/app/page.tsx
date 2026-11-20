"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

function ListingCard({
  item,
  isSaved,
  compact = false,
  onToggleSave,
  onOrderCod,
}: {
  item: ProductItem;
  isSaved: boolean;
  compact?: boolean;
  onToggleSave: (id: string) => void;
  onOrderCod: (product: ProductItem) => void;
}) {
  const isSoldOut = !item.alwaysAvailable && item.stock <= 0;
  const meaningfulBadge = isSoldOut
    ? { label: "Habis", tone: "bg-[#FEF2F2] text-[#991B1B]" }
    : item.isUmkm
      ? { label: "UMKM", tone: "bg-[#FACC15] text-[#111827]" }
      : item.price === 0
        ? { label: "Gratis Rp0", tone: "bg-[#DCFCE7] text-[#14532D]" }
        : null;

  if (compact) {
    return (
      <article className="flex w-[min(82%,320px)] shrink-0 snap-start items-center gap-3 rounded-2xl border-2 border-[#111827] bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#111827] md:w-auto md:max-w-none">
        <Link
          href={`/listing/${item.id}`}
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[#111827] p-2 ${item.cardBg}`}
          aria-label={`Lihat detail ${item.title}`}
        >
          {item.uploadedImages && item.uploadedImages[0] ? (
            <Image
              unoptimized
              src={item.uploadedImages[0]}
              alt={`Foto ${item.title}`}
              width={80}
              height={80}
              className="h-full w-full rounded object-contain"
            />
          ) : (
            <ProductIllustration type={item.illustration} className="h-14 w-16" />
          )}
        </Link>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-[#15803D]">{item.priceLabel}</span>
            <span className="text-[11px] font-bold text-[#475569]">
              {item.alwaysAvailable ? "Tersedia" : `Stok ${item.stock}`}
            </span>
          </div>
          <h3 className="truncate text-sm font-extrabold text-[#111827]">
            <Link href={`/listing/${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="truncate text-xs font-medium text-[#475569]">
              {item.sellerName} ✓
            </span>
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => onOrderCod(item)}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#111827] bg-[#15803D] px-3.5 text-xs font-bold text-white hover:bg-[#166534] disabled:bg-[#E2E8F0] disabled:text-[#334155]"
            >
              {isSoldOut ? "Habis" : "Pesan COD"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="listing-card-shell flex flex-col justify-between rounded-xl border-2 border-[#111827] bg-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#111827] active:scale-[0.995] sm:rounded-2xl">
      <div>
        <div
          className={`relative flex h-28 items-center justify-center rounded-t-[10px] border-b-2 border-[#111827] p-2.5 sm:h-32 sm:rounded-t-[14px] sm:p-3 xl:h-36 ${item.cardBg}`}
        >
          {meaningfulBadge && (
            <span
              className={`absolute top-1.5 left-1.5 rounded-md border border-[#111827] px-1.5 py-0.5 text-[10px] font-extrabold sm:top-2.5 sm:left-2.5 sm:px-2 sm:text-[11px] ${meaningfulBadge.tone}`}
            >
              {meaningfulBadge.label}
            </span>
          )}

          <button
            type="button"
            onClick={() => onToggleSave(item.id)}
            aria-pressed={isSaved}
            aria-label={
              isSaved
                ? `Hapus ${item.title} dari daftar tersimpan`
                : `Simpan ${item.title}`
            }
            className={`absolute top-1.5 right-1.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#111827] transition-transform active:scale-95 sm:top-2 sm:right-2 ${
              isSaved
                ? "bg-[#FACC15] text-[#111827]"
                : "bg-white/95 text-[#111827] hover:bg-[#FEF9C3]"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4.5 w-4.5"
              fill={isSaved ? "#111827" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 3h10a1 1 0 0 1 1 1v13l-6-3.5L4 17V4a1 1 0 0 1 1-1z" />
            </svg>
          </button>

          <div className="flex h-full w-full items-center justify-center">
            {item.uploadedImages && item.uploadedImages[0] ? (
              <Image
                unoptimized
                src={item.uploadedImages[0]}
                alt={`Foto ${item.title}`}
                width={320}
                height={180}
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <ProductIllustration type={item.illustration} className="h-20 w-28 sm:h-24 sm:w-32" />
            )}
          </div>
        </div>

        <div className="listing-card-body space-y-1 sm:space-y-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5">
            <span className="text-sm font-extrabold text-[#15803D] sm:text-base">
              {item.priceLabel}
            </span>
            <span
              className={`text-[11px] font-bold sm:text-xs ${
                isSoldOut ? "text-[#991B1B]" : "text-[#475569]"
              }`}
            >
              {item.alwaysAvailable
                ? "Tersedia"
                : isSoldOut
                  ? "Habis"
                  : `Sisa ${item.stock}`}
            </span>
          </div>

          <h3 className="line-clamp-2 text-[13px] font-extrabold leading-snug text-[#111827] sm:text-sm">
            <Link href={`/listing/${item.id}`} className="card-link hover:underline">
              {item.title}
            </Link>
          </h3>

          <p className="listing-card-meta truncate font-medium text-[#475569]">
            {item.condition} • {item.faculty}
          </p>

          <p className="listing-card-meta truncate font-semibold text-[#111827]">
            <span className="text-[#14532D]">
              {item.sellerName}
              {item.sellerVerified ? " ✓" : ""}
            </span>{" "}
            <span className="font-normal text-[#475569]">
              • {item.codSpots[0]}
              {item.codSpots.length > 1 ? ` (+${item.codSpots.length - 1})` : ""}
            </span>
          </p>
        </div>
      </div>

      <div className="listing-card-body flex gap-2 pt-0">
        <Link
          href={`/listing/${item.id}`}
          className="listing-card-detail min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827] hover:bg-[#F8FAFC]"
        >
          Detail
        </Link>
        <button
          type="button"
          disabled={isSoldOut}
          onClick={() => onOrderCod(item)}
          className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-[#111827] px-3 text-xs font-bold sm:px-4 sm:text-sm ${
            isSoldOut
              ? "border-[#111827]/35 bg-[#E2E8F0] text-[#334155]"
              : "bg-[#15803D] text-white hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px]"
          }`}
        >
          {isSoldOut ? "Stok Habis" : "Pesan COD"}
        </button>
      </div>
    </article>
  );
}

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
  const stickyCatRef = useRef<HTMLDivElement>(null);
  const katalogGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stickyCatRef.current;
    if (!el || typeof CSS === "undefined" || CSS.supports("container-type", "scroll-state")) {
      return;
    }

    const setupObserver = () => {
      const topOffset = parseFloat(getComputedStyle(el).top) || 0;
      const obs = new IntersectionObserver(
        ([entry]) => {
          const isStuck = entry.intersectionRatio < 1 && entry.boundingClientRect.top <= topOffset + 2;
          el.dataset.stuck = isStuck ? "true" : "false";
        },
        {
          threshold: [1],
          rootMargin: `-${topOffset + 1}px 0px 0px 0px`,
        }
      );
      obs.observe(el);
      return obs;
    };

    let obs = setupObserver();
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      obs.disconnect();
      obs = setupObserver();
    };
    mq.addEventListener("change", onChange);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

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

  const handleCodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codProduct) return;
    setCodTouched(true);

    if (!codSpotChoice || !proposedTime.trim()) {
      setCodError("Pilih 1 titik COD kampus dan isi usulan hari serta jam ketemuan.");
      return;
    }
    if (quantity < 1 || (!codProduct.alwaysAvailable && quantity > codProduct.stock)) {
      setCodError(`Jumlah pesanan harus antara 1 sampai ${codProduct.stock}.`);
      return;
    }

    const formattedTime = proposedTime.includes("T")
      ? proposedTime.replace("T", " ") + " WIB"
      : proposedTime;

    const result = await createOrder({
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

  const handleCategoryChange = (catId: CategoryId) => {
    setActiveCategory(catId);
    setOnlySaved(false);
    if (stickyCatRef.current && katalogGridRef.current) {
      const stickyRect = stickyCatRef.current.getBoundingClientRect();
      const gridRect = katalogGridRef.current.getBoundingClientRect();
      if (gridRect.top < stickyRect.bottom + 12) {
        window.scrollBy({
          top: gridRect.top - stickyRect.bottom - 16,
          behavior: "smooth",
        });
      }
    }
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
      className="mx-auto max-w-[1440px] space-y-8 px-4 py-5 sm:space-y-12 sm:px-6 lg:px-10 lg:py-8"
    >
      {/* SECTION 1: HERO FOKUS & LAPANG (Tanpa kartu bertumpuk di dalam hero) */}
      <section
        aria-labelledby="judul-hero"
        className="rounded-3xl border-2 border-[#111827] bg-[#F0FDF4] p-5 shadow-[4px_4px_0px_#111827] sm:p-8 lg:p-10"
      >
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-7">
            <h1
              id="judul-hero"
              className="text-[clamp(1.6rem,3.6vw,2.85rem)] font-extrabold leading-[1.15] tracking-tight text-[#111827]"
            >
              Pasar Kampus Unilak,{" "}
              <span className="text-[#15803D]">Hemat &amp; 0% Biaya Admin</span>
            </h1>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-[#334155] sm:text-base">
              Jual-beli buku kuliah, barang kos, dan produk UMKM mahasiswa Universitas
              Lancang Kuning. Ketemuan langsung di titik COD kampus tanpa biaya platform.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#katalog"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2 text-sm font-bold text-white shadow-[2px_2px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Jelajahi Katalog
              </a>
              <Link
                href="/jual"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-6 py-2 text-sm font-extrabold text-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-[#FDE047] active:translate-x-[1px] active:translate-y-[1px]"
              >
                + Pasang Listing
              </Link>
            </div>

            <p className="text-xs font-bold text-[#14532D]">
              Khusus KTM Terverifikasi • COD Area Kampus Unilak • Tanpa Biaya Komisi
            </p>
          </div>

          <div className="hidden justify-center md:flex md:col-span-5">
            <svg
              viewBox="0 0 420 340"
              className="h-auto w-full max-w-[250px] lg:max-w-[350px]"
              role="img"
              aria-label="Ilustrasi kartun mahasiswa Unilak membawa tas belanja COD Kampus dan laptop"
            >
              <circle
                cx="220"
                cy="170"
                r="138"
                fill="#DCFCE7"
                stroke="#111827"
                strokeWidth="3"
              />
              <circle cx="172" cy="86" r="46" fill="#111827" />
              <circle cx="152" cy="126" r="52" fill="#111827" />
              <circle cx="226" cy="122" r="48" fill="#111827" />
              <path
                d="M134 170 L248 170 C282 170 304 200 314 256 L322 318 L92 318 L100 256 C108 200 120 170 134 170 Z"
                fill="#FACC15"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <path
                d="M174 170 L224 170 L218 318 L180 318 Z"
                fill="#FFFFFF"
                stroke="#111827"
                strokeWidth="3"
              />
              <rect
                x="186"
                y="138"
                width="26"
                height="36"
                rx="8"
                fill="#FFFFFF"
                stroke="#111827"
                strokeWidth="3"
              />
              <ellipse
                cx="199"
                cy="104"
                rx="38"
                ry="44"
                fill="#FFFFFF"
                stroke="#111827"
                strokeWidth="3.5"
              />
              <path
                d="M160 92 C168 68 192 58 222 64 C236 68 242 82 240 94 C220 82 200 78 180 88 C170 94 164 94 160 92 Z"
                fill="#111827"
              />
              <circle cx="188" cy="103" r="4" fill="#111827" />
              <circle cx="212" cy="103" r="4" fill="#111827" />
              <path
                d="M190 120 C196 128 206 128 210 120"
                fill="none"
                stroke="#111827"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <ellipse
                cx="158"
                cy="107"
                rx="10"
                ry="16"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="2.5"
              />
              <ellipse
                cx="240"
                cy="107"
                rx="10"
                ry="16"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="2.5"
              />
              <rect x="66" y="196" width="110" height="122" rx="12" fill="#111827" />
              <rect
                x="62"
                y="192"
                width="110"
                height="122"
                rx="12"
                fill="#15803D"
                stroke="#111827"
                strokeWidth="3"
              />
              <circle
                cx="117"
                cy="242"
                r="21"
                fill="#FACC15"
                stroke="#111827"
                strokeWidth="2.5"
              />
              <text
                x="117"
                y="247"
                textAnchor="middle"
                fill="#111827"
                fontSize="13"
                fontWeight="bold"
              >
                UM
              </text>
              <text
                x="117"
                y="289"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="bold"
              >
                COD KAMPUS
              </text>
              <path
                d="M270 232 L386 232 L370 308 L254 308 Z"
                fill="#111827"
                stroke="#111827"
                strokeWidth="3"
              />
              <circle cx="320" cy="270" r="8" fill="#FACC15" />
              <rect x="232" y="306" width="156" height="11" rx="5" fill="#111827" />
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION 2 (UI-03, FR-15): STRIP ETALASE UMKM GRATIS RINGKAS TANPA KOTAK LUAR BERAT */}
      <section id="etalase-umkm" aria-labelledby="judul-etalase-umkm" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md border border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold text-[#111827]">
              Etalase UMKM Gratis
            </span>
            <h2
              id="judul-etalase-umkm"
              className="text-xl font-extrabold tracking-tight text-[#111827] sm:text-2xl"
            >
              Karya &amp; Jajanan Mahasiswa Unilak
            </h2>
          </div>

          <button
            type="button"
            onClick={() => selectCategoryAndScroll("umkm")}
            className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-bold text-[#15803D] hover:underline"
          >
            Lihat semua UMKM
          </button>
        </div>

        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
          {umkmSpotlight.map((item) => (
            <ListingCard
              key={`spotlight-${item.id}`}
              item={item}
              compact
              isSaved={savedIds.includes(item.id)}
              onToggleSave={toggleSave}
              onOrderCod={openCodModal}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: KATALOG UTAMA + KATEGORI LENGKET + FILTER TERSTRUKTUR */}
      <section
        id="katalog"
        aria-labelledby="judul-katalog"
        className="katalog-sticky-scope space-y-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#111827]/15 pb-3">
          <div>
            <h2
              id="judul-katalog"
              className="text-xl font-extrabold tracking-tight text-[#111827] sm:text-2xl"
            >
              Katalog Kampus
            </h2>
            <p className="text-xs font-semibold text-[#475569] sm:text-sm">
              Menampilkan {filteredProducts.length} barang &amp; jasa mahasiswa (Data pratinjau)
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-3.5 text-xs font-bold text-[#111827] hover:bg-[#F8FAFC]"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Baris Pill Kategori Lengket Saat Scroll */}
        <div
          ref={stickyCatRef}
          className="category-sticky-bar -mx-4 sm:-mx-6 lg:-mx-10"
        >
          <div className="category-sticky-inner px-4 py-2 sm:px-6 lg:px-10">
            <div
              role="toolbar"
              aria-label="Filter kategori katalog"
              className="category-scroll-strip flex flex-nowrap items-center gap-2 pb-0.5"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id && !onlySaved;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-colors active:translate-x-[1px] active:translate-y-[1px] xl:px-3.5 xl:text-[13px] ${
                      isSelected
                        ? "border-2 border-[#111827] bg-[#15803D] text-white"
                        : "border border-[#111827]/35 bg-white text-[#111827] hover:border-[#111827] hover:bg-[#F0FDF4]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            {hasActiveFilters && (
              <div className="mt-1.5 flex items-center justify-between gap-2 text-xs font-bold text-[#14532D]">
                <span>
                  Filter aktif: menampilkan {filteredProducts.length} listing
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-9 items-center rounded-lg border border-[#111827]/40 bg-[#F0FDF4] px-2.5 text-xs font-extrabold text-[#111827] hover:bg-[#DCFCE7]"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Fakultas, Kondisi, Urutkan & Disimpan (sebaris bersih) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex-1">
              <label htmlFor="sort-mobile" className="sr-only">
                Urutkan katalog
              </label>
              <select
                id="sort-mobile"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold text-[#111827]"
              >
                <option value="terbaru">Urutkan: Terbaru</option>
                <option value="termurah">Harga Terendah</option>
                <option value="termahal">Harga Tertinggi</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              aria-expanded={showAdvancedFilters}
              aria-controls="panel-filter-lanjut"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#F8FAFC] px-3.5 text-xs font-extrabold text-[#111827]"
            >
              {showAdvancedFilters ? "Tutup Filter" : "Filter"}
            </button>
          </div>

          <div
            id="panel-filter-lanjut"
            className={`${
              showAdvancedFilters ? "grid" : "hidden"
            } grid-cols-1 gap-3 rounded-2xl border border-[#111827]/25 bg-[#F8FAFC] p-3 sm:grid sm:grid-cols-4 sm:items-end sm:border-0 sm:bg-transparent sm:p-0`}
          >
            <div>
              <label
                htmlFor="filter-fakultas"
                className="block text-xs font-bold text-[#334155]"
              >
                Fakultas
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
                className="block text-xs font-bold text-[#334155]"
              >
                Kondisi Barang
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
                className="block text-xs font-bold text-[#334155]"
              >
                Urutkan
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
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#111827] px-3 py-2 text-xs font-bold transition-colors ${
                  onlySaved
                    ? "bg-[#FACC15] text-[#111827]"
                    : "bg-white text-[#111827] hover:bg-[#F0FDF4]"
                }`}
              >
                {onlySaved
                  ? `Disimpan (${savedIds.length})`
                  : `Tampilkan Disimpan (${savedIds.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Grid Produk */}
        {filteredProducts.length === 0 ? (
          <div
            role="status"
            className="rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-8 text-center"
          >
            <h3 className="text-lg font-extrabold text-[#111827]">
              Belum ada listing yang cocok dengan filter ini
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm font-medium text-[#334155]">
              Ubah kata kunci pencarian atau pilih kategori/fakultas lain untuk melihat
              listing mahasiswa Unilak.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2 text-sm font-bold text-white hover:bg-[#166534]"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div
            ref={katalogGridRef}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5"
          >
            {filteredProducts.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                isSaved={savedIds.includes(item.id)}
                onToggleSave={toggleSave}
                onOrderCod={openCodModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: TITIK COD KAMPUS RINGKAS + PANDUAN COLLAPSIBLE */}
      <section
        id="titik-cod"
        aria-labelledby="judul-cod"
        className="space-y-4 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="judul-cod" className="text-lg font-extrabold text-[#111827]">
              {activeSpots.length} Titik COD Aktif di Kampus Unilak
            </h2>
            <p className="text-xs font-medium text-[#334155] sm:text-sm">
              Transaksi Rilis 1 memakai COD tunai langsung di area kampus tanpa potongan.
            </p>
          </div>
          <Link
            href="/profil"
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-[#FEF9C3]"
          >
            Status KTM: {profile.ktmStatus}
          </Link>
        </div>

        <ul className="flex flex-wrap gap-2">
          {activeSpots.map((spot) => (
            <li
              key={spot.id}
              className="rounded-xl border border-[#111827]/35 bg-white px-3 py-1.5 text-xs text-[#111827]"
            >
              <span className="font-bold">{spot.name}</span>{" "}
              <span className="text-[#475569]">({spot.hours})</span>
            </li>
          ))}
        </ul>

        <details className="rounded-xl border border-[#111827]/30 bg-white p-3.5 text-xs text-[#334155]">
          <summary className="cursor-pointer font-extrabold text-[#111827]">
            Cara kerja COD kampus &amp; privasi nomor WhatsApp
          </summary>
          <ol className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-lg bg-[#F8FAFC] p-2.5">
              <span className="font-extrabold text-[#15803D]">1. Menunggu</span>
              <p className="mt-0.5 leading-snug">
                Pilih 1 titik COD dan usulkan jam temu. Kedaluwarsa otomatis dalam 24 jam
                jika penjual belum menjawab.
              </p>
            </li>
            <li className="rounded-lg bg-[#F8FAFC] p-2.5">
              <span className="font-extrabold text-[#15803D]">2. Dijadwalkan</span>
              <p className="mt-0.5 leading-snug">
                Penjual menyetujui jadwal. Tombol WhatsApp baru terbuka di halaman Pesanan
                sesuai aturan UU PDP.
              </p>
            </li>
            <li className="rounded-lg bg-[#F8FAFC] p-2.5">
              <span className="font-extrabold text-[#15803D]">3. Diserahkan</span>
              <p className="mt-0.5 leading-snug">
                Pembeli mengecek barang langsung di titik COD dan membayar tunai tanpa biaya
                admin.
              </p>
            </li>
            <li className="rounded-lg bg-[#F8FAFC] p-2.5">
              <span className="font-extrabold text-[#15803D]">4. Selesai</span>
              <p className="mt-0.5 leading-snug">
                Pembeli konfirmasi selesai (atau otomatis 48 jam) lalu dapat memberi ulasan.
              </p>
            </li>
          </ol>
        </details>
      </section>

      {/* DIALOG MODAL PESAN COD CEPAT */}
      <ModalDialog
        open={Boolean(codProduct)}
        onClose={() => setCodProduct(null)}
        titleId="judul-modal-cod"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[#475569]">Ajukan Jadwal COD</span>
            <h2 id="judul-modal-cod" className="mt-0.5 text-lg font-extrabold text-[#111827]">
              {codProduct?.title ?? "Pesan Produk"}
            </h2>
            <p className="text-sm font-bold text-[#15803D]">
              {codProduct ? formatRupiah(codProduct.price * quantity) : ""} • 0% Biaya Admin
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
                  className="min-h-11 rounded-xl border border-[#111827]/40 bg-[#F8FAFC] px-3 text-xs font-bold text-[#111827] hover:bg-[#DCFCE7]"
                >
                  Hari ini 15.00
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(1, "10:00")}
                  className="min-h-11 rounded-xl border border-[#111827]/40 bg-[#F8FAFC] px-3 text-xs font-bold text-[#111827] hover:bg-[#DCFCE7]"
                >
                  Besok 10.00
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(1, "13:00")}
                  className="min-h-11 rounded-xl border border-[#111827]/40 bg-[#F8FAFC] px-3 text-xs font-bold text-[#111827] hover:bg-[#DCFCE7]"
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
                Catatan untuk Penjual (Opsional)
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
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white hover:bg-[#166534]"
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
