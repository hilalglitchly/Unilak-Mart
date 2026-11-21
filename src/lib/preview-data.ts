export type CategoryId =
  | "semua"
  | "umkm"
  | "buku"
  | "elektronik"
  | "kos"
  | "pakaian"
  | "produk-umkm"
  | "jasa"
  | "jajanan"
  | "gratis";

export type ItemCondition = "Baru" | "Bekas Seperti Baru" | "Bekas Layak Pakai";

export type SortOption = "terbaru" | "termurah" | "termahal";

export type OrderStatus =
  | "Menunggu"
  | "Dijadwalkan"
  | "Sudah Diserahkan"
  | "Selesai"
  | "Dibatalkan"
  | "Kedaluwarsa";

export type KtmStatus =
  | "Belum Verifikasi"
  | "Menunggu"
  | "Terverifikasi"
  | "Ditolak";

export type AppLocale = "id" | "en";

export const EN_CATEGORY_LABELS: Record<CategoryId, string> = {
  semua: "All Categories",
  umkm: "UMKM Storefront",
  buku: "Books & Modules",
  elektronik: "Electronics",
  kos: "Dorm Essentials",
  pakaian: "Apparel",
  "produk-umkm": "UMKM Products",
  jasa: "Services",
  jajanan: "Campus Snacks",
  gratis: "Rp0 Free",
};

export const EN_CONDITION_LABELS: Record<ItemCondition, string> = {
  Baru: "New",
  "Bekas Seperti Baru": "Used Like New",
  "Bekas Layak Pakai": "Used Good",
};

export const EN_ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Menunggu: "Pending",
  Dijadwalkan: "Scheduled",
  "Sudah Diserahkan": "Handed Over",
  Selesai: "Completed",
  Dibatalkan: "Cancelled",
  Kedaluwarsa: "Expired",
};

export const EN_KTM_STATUS_LABELS: Record<KtmStatus, string> = {
  "Belum Verifikasi": "Unverified",
  Menunggu: "Pending Review",
  Terverifikasi: "Verified",
  Ditolak: "Rejected",
};

export function getDisplayLabel(
  locale: AppLocale,
  value: string,
  map: Record<string, string>
): string {
  return locale === "en" ? (map[value] ?? value) : value;
}

export type IllustrationType =
  | "bag"
  | "sneaker"
  | "headphone"
  | "hat"
  | "volleyball"
  | "umkm-coffee";

export interface CodSpotItem {
  id: string;
  name: string;
  location: string;
  hours: string;
  active: boolean;
}

export interface ProductReview {
  id: string;
  authorLabel: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  dbId?: number;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
  condition: ItemCondition;
  stock: number;
  alwaysAvailable?: boolean;
  codSpots: string[];
  faculty: string;
  sellerName: string;
  sellerProdi: string;
  sellerVerified: boolean;
  sellerWa: string;
  badge: string;
  badgeTone: "yellow" | "green";
  cardBg: string;
  category: Exclude<CategoryId, "semua" | "umkm" | "gratis">;
  isUmkm?: boolean;
  illustration: IllustrationType;
  uploadedImages?: string[];
  createdAt: string;
  hidden?: boolean;
  reviews?: ProductReview[];
}

export interface OrderItem {
  id: string;
  dbId?: number;
  listingDbId?: number;
  buyerId?: string;
  sellerId?: string;
  code: string;
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  codSpot: string;
  proposedTime: string;
  note: string;
  status: OrderStatus;
  cancelReason?: string;
  sellerLabel: string;
  sellerWa: string;
  buyerLabel: string;
  createdAt: string;
  ratingSubmitted?: number;
  reviewComment?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  timestamp: string;
}

export interface ReportItem {
  id: string;
  dbId?: number;
  targetType: "Listing" | "Pengguna" | "Pesanan";
  targetId: string;
  targetTitle: string;
  reason: string;
  status: "Baru" | "Disembunyikan" | "Selesai";
  createdAt: string;
}

export interface KtmQueueItem {
  id: string;
  dbId?: number;
  nim: string;
  name: string;
  prodi: string;
  faculty: string;
  submittedAt: string;
  photoLabel: string;
  status: "Menunggu" | "Terverifikasi" | "Ditolak";
  rejectionReason?: string;
  photoDeletedNote?: string;
}

export interface UserProfile {
  nim: string;
  name: string;
  prodi: string;
  faculty: string;
  email: string;
  wa: string;
  pdpConsent: boolean;
  isUmkm: boolean;
  ktmStatus: KtmStatus;
  ktmReason?: string;
  ktmPhotoName?: string;
  systemRole?: "user" | "admin";
  deletedAt?: string;
}

export interface AdminUserItem {
  id: string;
  nim: string;
  name: string;
  prodi: string;
  faculty: string;
  email: string;
  ktmStatus: KtmStatus;
  isUmkm: boolean;
  isSuspended: boolean;
  systemRole: "user" | "admin";
  deletedAt?: string;
}

export interface CategoryRefItem {
  slug: string;
  name: string;
  active: boolean;
}

export const FACULTIES = [
  "Fasilkom",
  "Teknik",
  "FEB",
  "FKIP",
  "Kehutanan",
  "FIB",
  "FH",
  "Faperta",
] as const;

export const CONDITIONS: ItemCondition[] = [
  "Baru",
  "Bekas Seperti Baru",
  "Bekas Layak Pakai",
];

// Kategori selaras FR-11 SRS v1.1 ditambah pintasan Etalase UMKM & Rp0 Gratis
export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "semua", label: "Semua Kategori" },
  { id: "umkm", label: "Etalase UMKM" },
  { id: "buku", label: "Buku & Modul" },
  { id: "elektronik", label: "Elektronik" },
  { id: "kos", label: "Perabot Kos" },
  { id: "pakaian", label: "Pakaian" },
  { id: "produk-umkm", label: "Produk UMKM" },
  { id: "jasa", label: "Jasa" },
  { id: "jajanan", label: "Jajanan Kampus" },
  { id: "gratis", label: "Rp0 Gratis" },
];

export const INITIAL_COD_SPOTS: CodSpotItem[] = [
  {
    id: "perpus-pusat",
    name: "Perpustakaan Pusat Unilak",
    location: "Teras Lobby Utama Lantai 1",
    hours: "08.00 - 16.30 WIB",
    active: true,
  },
  {
    id: "lobi-fasilkom",
    name: "Lobi Fasilkom Unilak",
    location: "Meja Piket & Gazebo Fasilkom",
    hours: "08.30 - 17.00 WIB",
    active: true,
  },
  {
    id: "kantin-utama",
    name: "Kantin Utama Unilak",
    location: "Area Meja Tengah Dekat Koperasi",
    hours: "07.30 - 17.30 WIB",
    active: true,
  },
  {
    id: "taman-danau",
    name: "Taman Danau Unilak",
    location: "Shelter Duduk Sisi Timur",
    hours: "09.00 - 17.30 WIB",
    active: true,
  },
  {
    id: "lobi-teknik",
    name: "Lobi Fakultas Teknik",
    location: "Selasar Gedung Teknik",
    hours: "08.00 - 16.30 WIB",
    active: true,
  },
  {
    id: "gor-kampus",
    name: "GOR Kampus Unilak",
    location: "Pintu Utama Area Parkir Depan",
    hours: "09.00 - 18.00 WIB",
    active: true,
  },
];

export function formatRupiah(price: number, locale: AppLocale = "id"): string {
  if (price === 0) return locale === "en" ? "Rp 0 (Free)" : "Rp 0 (Gratis)";
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export function buildWhatsAppUrl(rawPhone: string, orderCode: string, productTitle: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const text = encodeURIComponent(
    `Halo, saya menghubungi terkait pesanan ${orderCode} (${productTitle}) di UnilakMart untuk koordinasi titik COD kampus.`
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

// shortcut: data contoh simulasi pratinjau R1, ganti dengan query Supabase saat .env.local tersedia
export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: "kopi-risol-umkm",
    title: "Paket Kopi Susu Botol & Risol Mayo Kampus",
    description:
      "Paket sarapan dan teman kuliah dari UMKM mahasiswa FEB. Kopi susu gula aren 250ml dingin + 2 risol mayo hangat siap antar ke titik COD kantin atau lobi fakultas.",
    price: 15000,
    priceLabel: "Rp 15.000",
    condition: "Baru",
    stock: 20,
    alwaysAvailable: true,
    codSpots: ["Kantin Utama Unilak", "Perpustakaan Pusat Unilak", "Lobi Fasilkom Unilak"],
    faculty: "FEB",
    sellerName: "Lapak Kopi FEB",
    sellerProdi: "Manajemen",
    sellerVerified: true,
    sellerWa: "081200001101",
    badge: "Etalase UMKM",
    badgeTone: "green",
    cardBg: "bg-[#FEF08A]",
    category: "jajanan",
    isUmkm: true,
    illustration: "umkm-coffee",
    createdAt: "2026-11-11T04:10:00Z",
    reviews: [
      {
        id: "rev-1",
        authorLabel: "Pembeli Mahasiswa (Pratinjau)",
        rating: 5,
        comment: "Risol masih hangat dan ketemuan tepat waktu di Kantin Utama.",
        createdAt: "2026-11-10",
      },
    ],
  },
  {
    id: "jasa-desain-presentasi",
    title: "Jasa Rapikan Format Skripsi & Slide Seminar",
    description:
      "Layanan merapikan daftar isi otomatis, penomoran halaman, serta desain slide presentasi seminar hasil/proposal (bukan jasa joki isi atau penulisan tugas).",
    price: 25000,
    priceLabel: "Rp 25.000",
    condition: "Baru",
    stock: 10,
    alwaysAvailable: true,
    codSpots: ["Perpustakaan Pusat Unilak", "Lobi Fasilkom Unilak", "Taman Danau Unilak"],
    faculty: "FIB",
    sellerName: "Studio Slide FIB",
    sellerProdi: "Sastra Inggris",
    sellerVerified: true,
    sellerWa: "081200001102",
    badge: "Etalase UMKM",
    badgeTone: "green",
    cardBg: "bg-[#FEF9C3]",
    category: "jasa",
    isUmkm: true,
    illustration: "headphone",
    createdAt: "2026-11-11T03:45:00Z",
  },
  {
    id: "stiker-merch-hima",
    title: "Paket Gantungan Kunci & Stiker Vinyl Kampus UMKM",
    description:
      "Produk kreatif mahasiswa desain/UMKM kampus: bahan akrilik bening 3mm dan stiker vinyl tahan air untuk laptop dan helm.",
    price: 18000,
    priceLabel: "Rp 18.000",
    condition: "Baru",
    stock: 15,
    alwaysAvailable: true,
    codSpots: ["Lobi Fasilkom Unilak", "Kantin Utama Unilak", "Perpustakaan Pusat Unilak"],
    faculty: "Fasilkom",
    sellerName: "Kriya Fasilkom",
    sellerProdi: "Teknik Informatika",
    sellerVerified: true,
    sellerWa: "081200001103",
    badge: "Produk UMKM",
    badgeTone: "green",
    cardBg: "bg-[#DCFCE7]",
    category: "produk-umkm",
    isUmkm: true,
    illustration: "bag",
    createdAt: "2026-11-11T03:00:00Z",
  },
  {
    id: "tas-lipat-kos",
    title: "Tas Organizer Lipat Serbaguna Anak Kos",
    description:
      "Organizer kain tebal dengan ritsleting ganda untuk menyimpan selimut, jaket, atau berkas kuliah di kamar kos agar tetap rapi.",
    price: 45000,
    priceLabel: "Rp 45.000",
    condition: "Bekas Seperti Baru",
    stock: 1,
    codSpots: ["Perpustakaan Pusat Unilak", "Taman Danau Unilak"],
    faculty: "Fasilkom",
    sellerName: "Kos Rumbai #01",
    sellerProdi: "Sistem Informasi",
    sellerVerified: true,
    sellerWa: "081200001104",
    badge: "Perabot Kos",
    badgeTone: "yellow",
    cardBg: "bg-[#DCFCE7]",
    category: "kos",
    illustration: "bag",
    createdAt: "2026-11-10T22:00:00Z",
  },
  {
    id: "sepatu-kampus",
    title: "Sepatu Sneakers Kampus Ukuran 41 Mulus",
    description:
      "Jarang dipakai ke kampus, sol masih tebal dan sudah dicuci bersih. Bisa cek ukuran langsung saat COD di lobi teknik.",
    price: 95000,
    priceLabel: "Rp 95.000",
    condition: "Bekas Layak Pakai",
    stock: 1,
    codSpots: ["Lobi Fakultas Teknik", "GOR Kampus Unilak"],
    faculty: "Teknik",
    sellerName: "Penjual Teknik #02",
    sellerProdi: "Teknik Sipil",
    sellerVerified: true,
    sellerWa: "081200001105",
    badge: "Siap COD",
    badgeTone: "yellow",
    cardBg: "bg-[#FEF9C3]",
    category: "pakaian",
    illustration: "sneaker",
    createdAt: "2026-11-10T18:30:00Z",
  },
  {
    id: "headphone-coding",
    title: "Headphone Bluetooth Bass Belajar & Coding",
    description:
      "Baterai tahan sekitar 12 jam, kabel charger Type-C lengkap, busa telinga bersih. Cocok untuk zoom kuliah dan ngoding di perpus.",
    price: 120000,
    priceLabel: "Rp 120.000",
    condition: "Bekas Seperti Baru",
    stock: 1,
    codSpots: ["Lobi Fasilkom Unilak", "Perpustakaan Pusat Unilak"],
    faculty: "Fasilkom",
    sellerName: "Penjual Fasilkom #03",
    sellerProdi: "Teknik Informatika",
    sellerVerified: true,
    sellerWa: "081200001106",
    badge: "Elektronik",
    badgeTone: "yellow",
    cardBg: "bg-[#BBF7D0]",
    category: "elektronik",
    illustration: "headphone",
    createdAt: "2026-11-10T14:20:00Z",
  },
  {
    id: "bucket-hat-lapangan",
    title: "Bucket Hat Hitam Praktikum Lapangan Unilak",
    description:
      "Topi lapangan bahan kanvas ringan lengkap dengan tali dagu, cocok untuk kegiatan lapangan Fakultas Kehutanan atau KKN.",
    price: 35000,
    priceLabel: "Rp 35.000",
    condition: "Baru",
    stock: 4,
    codSpots: ["Taman Danau Unilak", "Kantin Utama Unilak"],
    faculty: "Kehutanan",
    sellerName: "Penjual Kehutanan #04",
    sellerProdi: "Kehutanan",
    sellerVerified: true,
    sellerWa: "081200001107",
    badge: "Pakaian",
    badgeTone: "yellow",
    cardBg: "bg-[#F8FAFC]",
    category: "pakaian",
    illustration: "hat",
    createdAt: "2026-11-10T11:00:00Z",
  },
  {
    id: "bola-voli-ukm",
    title: "Bola Voli Latihan UKM Olahraga Mahasiswa",
    description:
      "Bola latihan ringan kondisi terawat, angin aman dan tidak bocor. Bisa dicek langsung di depan GOR Kampus.",
    price: 75000,
    priceLabel: "Rp 75.000",
    condition: "Bekas Layak Pakai",
    stock: 1,
    codSpots: ["GOR Kampus Unilak", "Taman Danau Unilak"],
    faculty: "FKIP",
    sellerName: "Penjual FKIP #05",
    sellerProdi: "Pendidikan Bahasa",
    sellerVerified: true,
    sellerWa: "081200001108",
    badge: "Perlengkapan",
    badgeTone: "yellow",
    cardBg: "bg-[#15803D]",
    category: "kos",
    illustration: "volleyball",
    createdAt: "2026-11-09T15:00:00Z",
  },
  {
    id: "modul-kalkulus-gratis",
    title: "Bundel Catatan & Modul Algoritma Semester 1-2",
    description:
      "Hibah gratis Rp0 buku cetak & catatan rapi algoritma dasar untuk mahasiswa baru Fasilkom yang membutuhkan.",
    price: 0,
    priceLabel: "Rp 0 (Gratis)",
    condition: "Bekas Layak Pakai",
    stock: 2,
    codSpots: ["Perpustakaan Pusat Unilak", "Lobi Fasilkom Unilak"],
    faculty: "Fasilkom",
    sellerName: "Senior Fasilkom",
    sellerProdi: "Teknik Informatika",
    sellerVerified: true,
    sellerWa: "081200001109",
    badge: "Berbagi Rp0",
    badgeTone: "green",
    cardBg: "bg-[#DCFCE7]",
    category: "buku",
    illustration: "bag",
    createdAt: "2026-11-09T09:00:00Z",
  },
  {
    id: "kuhp-fh-baru",
    title: "Kitab UU Hukum Pidana & Perdata (KUHP/KUHPer)",
    description:
      "Edisi saku lengkap dengan catatan stabilo tipis dan pembatas pasal penting untuk mata kuliah dasar Fakultas Hukum.",
    price: 40000,
    priceLabel: "Rp 40.000",
    condition: "Bekas Seperti Baru",
    stock: 1,
    codSpots: ["Perpustakaan Pusat Unilak", "Kantin Utama Unilak"],
    faculty: "FH",
    sellerName: "Penjual Hukum #06",
    sellerProdi: "Ilmu Hukum",
    sellerVerified: true,
    sellerWa: "081200001110",
    badge: "Buku Kuliah",
    badgeTone: "yellow",
    cardBg: "bg-[#FEF9C3]",
    category: "buku",
    illustration: "bag",
    createdAt: "2026-11-08T16:30:00Z",
  },
  {
    id: "mouse-wireless-faperta",
    title: "Mouse Wireless Silent Click Kuliah & Presentasi",
    description:
      "Klik senyap cocok dipakai di ruang baca Perpustakaan Pusat, baterai AA awet dan dongle USB lengkap.",
    price: 55000,
    priceLabel: "Rp 55.000",
    condition: "Bekas Seperti Baru",
    stock: 1,
    codSpots: ["Taman Danau Unilak", "Perpustakaan Pusat Unilak"],
    faculty: "Faperta",
    sellerName: "Penjual Faperta #07",
    sellerProdi: "Agroteknologi",
    sellerVerified: true,
    sellerWa: "081200001111",
    badge: "Elektronik",
    badgeTone: "yellow",
    cardBg: "bg-[#DCFCE7]",
    category: "elektronik",
    illustration: "headphone",
    createdAt: "2026-11-08T13:15:00Z",
  },
  {
    id: "jas-hujan-lapangan-faperta",
    title: "Jas Hujan Setelan Tebal Praktikum Kebun",
    description:
      "Jas hujan PVC jaket + celana ukuran all-size untuk praktikum kebun percobaan atau perjalanan motor musim hujan.",
    price: 65000,
    priceLabel: "Rp 65.000",
    condition: "Baru",
    stock: 3,
    codSpots: ["Taman Danau Unilak", "GOR Kampus Unilak"],
    faculty: "Faperta",
    sellerName: "Kopma Faperta",
    sellerProdi: "Agribisnis",
    sellerVerified: true,
    sellerWa: "081200001112",
    badge: "Siap COD",
    badgeTone: "yellow",
    cardBg: "bg-[#F8FAFC]",
    category: "pakaian",
    illustration: "hat",
    createdAt: "2026-11-08T10:00:00Z",
  },
  {
    id: "lampu-belajar-kos-feb",
    title: "Lampu Meja Belajar LED Lipat USB Anak Kos",
    description:
      "3 tingkat terang, leher fleksibel, hemat daya bisa dicolok ke powerbank saat mati lampu di kos sekitar Rumbai.",
    price: 30000,
    priceLabel: "Rp 30.000",
    condition: "Bekas Layak Pakai",
    stock: 2,
    codSpots: ["Kantin Utama Unilak", "Lobi Fakultas Teknik"],
    faculty: "FEB",
    sellerName: "Penjual FEB #08",
    sellerProdi: "Akuntansi",
    sellerVerified: true,
    sellerWa: "081200001113",
    badge: "Perabot Kos",
    badgeTone: "yellow",
    cardBg: "bg-[#BBF7D0]",
    category: "kos",
    illustration: "bag",
    createdAt: "2026-11-07T19:45:00Z",
  },
  {
    id: "dimsum-mentai-umkm-fkip",
    title: "Dimsum Ayam Mentai Box Isi 6 Siap COD",
    description:
      "Jajanan buatan rumah mahasiswa FKIP, daging ayam fillet + saus mentai gurih pedas dibuat fresh setiap pagi.",
    price: 15000,
    priceLabel: "Rp 15.000",
    condition: "Baru",
    stock: 25,
    alwaysAvailable: true,
    codSpots: ["Kantin Utama Unilak", "GOR Kampus Unilak", "Perpustakaan Pusat Unilak"],
    faculty: "FKIP",
    sellerName: "Dapur Mentai FKIP",
    sellerProdi: "Pendidikan Biologi",
    sellerVerified: true,
    sellerWa: "081200001114",
    badge: "Etalase UMKM",
    badgeTone: "green",
    cardBg: "bg-[#FEF08A]",
    category: "jajanan",
    isUmkm: true,
    illustration: "umkm-coffee",
    createdAt: "2026-11-07T11:20:00Z",
  },
  {
    id: "print-jilid-teknik",
    title: "Jasa Cetak Warna & Jilid Laporan Praktikum",
    description:
      "Layanan cetak dokumen PDF mahasiswa (kertas HVS 80gr + jilid mika bening/lakban) siap antar ke spot COD kampus tanpa antre luar.",
    price: 10000,
    priceLabel: "Rp 10.000",
    condition: "Baru",
    stock: 20,
    alwaysAvailable: true,
    codSpots: ["Lobi Fakultas Teknik", "Perpustakaan Pusat Unilak"],
    faculty: "Teknik",
    sellerName: "Karya Teknik Print",
    sellerProdi: "Teknik Elektro",
    sellerVerified: true,
    sellerWa: "081200001115",
    badge: "Etalase UMKM",
    badgeTone: "green",
    cardBg: "bg-[#DCFCE7]",
    category: "jasa",
    isUmkm: true,
    illustration: "bag",
    createdAt: "2026-11-07T08:00:00Z",
  },
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "ord-preview-1",
    code: "UM-2611-01",
    productId: "kopi-risol-umkm",
    productTitle: "Paket Kopi Susu Botol & Risol Mayo Kampus",
    unitPrice: 15000,
    quantity: 2,
    codSpot: "Kantin Utama Unilak",
    proposedTime: "Besok 10.30 WIB",
    note: "Es kopinya sedikit saja ya.",
    status: "Dijadwalkan",
    sellerLabel: "Lapak Kopi FEB (Pratinjau)",
    sellerWa: "081200001101",
    buyerLabel: "Akun Pratinjau Mahasiswa",
    createdAt: "2026-11-11T02:00:00Z",
  },
  {
    id: "ord-preview-2",
    code: "UM-2611-02",
    productId: "headphone-coding",
    productTitle: "Headphone Bluetooth Bass Belajar & Coding",
    unitPrice: 120000,
    quantity: 1,
    codSpot: "Lobi Fasilkom Unilak",
    proposedTime: "Hari ini 15.00 WIB",
    note: "Ingin coba tes Bluetooth sebelum bayar tunai.",
    status: "Menunggu",
    sellerLabel: "Mahasiswa Fasilkom #03 (Pratinjau)",
    sellerWa: "081200001106",
    buyerLabel: "Akun Pratinjau Mahasiswa",
    createdAt: "2026-11-11T04:00:00Z",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Pesanan UM-2611-01 Dijadwalkan",
    message:
      "Penjual menyetujui jadwal COD di Kantin Utama Unilak (Besok 10.30 WIB). Tombol WhatsApp kini terbuka.",
    href: "/pesanan",
    read: false,
    timestamp: "10 menit lalu",
  },
  {
    id: "notif-2",
    title: "Status Verifikasi KTM (Mode Pratinjau)",
    message:
      "Lengkapi NIM & foto KTM di halaman Profil untuk menguji alur verifikasi admin Rilis 1.",
    href: "/profil",
    read: false,
    timestamp: "1 jam lalu",
  },
];

export const INITIAL_KTM_QUEUE: KtmQueueItem[] = [
  {
    id: "ktm-q-1",
    nim: "2355201000 (Pratinjau)",
    name: "Calon Penjual Fasilkom (Pratinjau)",
    prodi: "Teknik Informatika",
    faculty: "Fasilkom",
    submittedAt: "2026-11-11 04:20 WIB",
    photoLabel: "ktm-preview-bucket-privat.jpg",
    status: "Menunggu",
  },
  {
    id: "ktm-q-2",
    nim: "2461201000 (Pratinjau)",
    name: "Calon Penjual UMKM FEB (Pratinjau)",
    prodi: "Manajemen",
    faculty: "FEB",
    submittedAt: "2026-11-11 03:50 WIB",
    photoLabel: "ktm-feb-privat.jpg",
    status: "Menunggu",
  },
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "rep-1",
    targetType: "Listing",
    targetId: "bucket-hat-lapangan",
    targetTitle: "Bucket Hat Hitam Praktikum Lapangan Unilak",
    reason: "Contoh laporan pratinjau: cek kejelasan foto ukuran produk.",
    status: "Baru",
    createdAt: "2026-11-11 03:15 WIB",
  },
];

export const INITIAL_MY_LISTING_IDS = ["tas-lipat-kos", "headphone-coding"];

export const INITIAL_REGISTERED_NIMS = ["2355201000", "2461201000"];

export const INITIAL_PROFILE: UserProfile = {
  nim: "",
  name: "Mahasiswa Unilak (Pratinjau)",
  prodi: "Teknik Informatika",
  faculty: "Fasilkom",
  email: "",
  wa: "",
  pdpConsent: false,
  isUmkm: false,
  ktmStatus: "Terverifikasi",
  ktmPhotoName: "",
};

export const INITIAL_ADMIN_USERS: AdminUserItem[] = [
  {
    id: "usr-prev-1",
    nim: "2255201045",
    name: "Mahasiswa Unilak (Pratinjau)",
    prodi: "Teknik Informatika",
    faculty: "Fasilkom",
    email: "mahasiswa.preview@unilak.ac.id",
    ktmStatus: "Terverifikasi",
    isUmkm: false,
    isSuspended: false,
    systemRole: "user",
  },
  {
    id: "usr-prev-2",
    nim: "2461201000",
    name: "Lapak Kopi FEB (Pratinjau)",
    prodi: "Manajemen",
    faculty: "FEB",
    email: "kopifeb.preview@unilak.ac.id",
    ktmStatus: "Terverifikasi",
    isUmkm: true,
    isSuspended: false,
    systemRole: "user",
  },
];

export const INITIAL_CATEGORY_REFS: CategoryRefItem[] = [
  { slug: "buku", name: "Buku & Modul", active: true },
  { slug: "elektronik", name: "Elektronik", active: true },
  { slug: "kos", name: "Perabot Kos", active: true },
  { slug: "pakaian", name: "Pakaian", active: true },
  { slug: "produk-umkm", name: "Produk UMKM", active: true },
  { slug: "jasa", name: "Jasa", active: true },
  { slug: "jajanan", name: "Jajanan Kampus", active: true },
];

