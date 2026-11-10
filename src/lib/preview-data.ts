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
  targetType: "Listing" | "Pengguna" | "Pesanan";
  targetId: string;
  targetTitle: string;
  reason: string;
  status: "Baru" | "Disembunyikan" | "Selesai";
  createdAt: string;
}

export interface KtmQueueItem {
  id: string;
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
  deletedAt?: string;
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

export function formatRupiah(price: number): string {
  if (price === 0) return "Rp 0 (Gratis)";
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
    sellerName: "Lapak Kopi FEB (Pratinjau)",
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
    sellerName: "Studio Slide Mahasiswa FIB (Pratinjau)",
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
    sellerName: "Kriya Kampus Fasilkom (Pratinjau)",
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
    sellerName: "Mahasiswa Kos Rumbai #01 (Pratinjau)",
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
    sellerName: "Mahasiswa Teknik #02 (Pratinjau)",
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
    sellerName: "Mahasiswa Fasilkom #03 (Pratinjau)",
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
    sellerName: "Mahasiswa Kehutanan #04 (Pratinjau)",
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
    sellerName: "Mahasiswa FKIP #05 (Pratinjau)",
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
    sellerName: "Kakak Tingkat Fasilkom (Pratinjau)",
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

