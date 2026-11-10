"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_COD_SPOTS,
  INITIAL_KTM_QUEUE,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PROFILE,
  INITIAL_REPORTS,
  SAMPLE_PRODUCTS,
  formatRupiah,
  type CategoryId,
  type CodSpotItem,
  type ItemCondition,
  type KtmQueueItem,
  type NotificationItem,
  type OrderItem,
  type OrderStatus,
  type ProductItem,
  type ReportItem,
  type UserProfile,
} from "@/lib/preview-data";

export interface NewListingInput {
  title: string;
  description: string;
  price: number;
  condition: ItemCondition;
  stock: number;
  alwaysAvailable: boolean;
  category: ProductItem["category"];
  faculty: string;
  isUmkm: boolean;
  codSpots: string[];
  uploadedImages: string[];
}

export interface CreateOrderInput {
  product: ProductItem;
  quantity: number;
  codSpot: string;
  proposedTime: string;
  note: string;
}

interface MarketplaceContextValue {
  products: ProductItem[];
  savedIds: string[];
  toggleSave: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: CategoryId;
  setActiveCategory: (cat: CategoryId) => void;
  selectedFaculty: string;
  setSelectedFaculty: (faculty: string) => void;
  onlySaved: boolean;
  setOnlySaved: (val: boolean | ((prev: boolean) => boolean)) => void;
  orders: OrderItem[];
  createOrder: (input: CreateOrderInput) => { ok: boolean; error?: string; order?: OrderItem };
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus, cancelReason?: string) => void;
  addOrderReview: (orderId: string, rating: number, comment: string) => void;
  addListing: (input: NewListingInput) => ProductItem;
  toggleListingStockZero: (productId: string) => void;
  hideListingByAdmin: (productId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  submitKtmVerification: (input: {
    nim: string;
    wa: string;
    email: string;
    faculty: string;
    prodi: string;
    pdpConsent: boolean;
    photoName: string;
  }) => void;
  deleteOwnAccount: () => { ok: boolean; error?: string };
  ktmQueue: KtmQueueItem[];
  approveKtm: (queueId: string) => void;
  rejectKtm: (queueId: string, reason: string) => void;
  reports: ReportItem[];
  submitReport: (input: {
    targetType: ReportItem["targetType"];
    targetId: string;
    targetTitle: string;
    reason: string;
  }) => void;
  resolveReport: (reportId: string, action: "hide" | "dismiss") => void;
  codSpots: CodSpotItem[];
  toggleCodSpot: (spotId: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>(SAMPLE_PRODUCTS);
  const [savedIds, setSavedIds] = useState<string[]>(["kopi-risol-umkm"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("semua");
  const [selectedFaculty, setSelectedFaculty] = useState("semua");
  const [onlySaved, setOnlySaved] = useState(false);

  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [ktmQueue, setKtmQueue] = useState<KtmQueueItem[]>(INITIAL_KTM_QUEUE);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [codSpots, setCodSpots] = useState<CodSpotItem[]>(INITIAL_COD_SPOTS);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const pushNotification = useCallback(
    (title: string, message: string, href: string) => {
      const id = `notif-${Date.now()}`;
      setNotifications((prev) => [
        {
          id,
          title,
          message,
          href,
          read: false,
          timestamp: "Baru saja",
        },
        ...prev,
      ]);
    },
    []
  );

  const createOrder = ({
    product,
    quantity,
    codSpot,
    proposedTime,
    note,
  }: CreateOrderInput) => {
    if (profile.ktmStatus !== "Terverifikasi") {
      return {
        ok: false,
        error:
          "Hanya akun mahasiswa berstatus Terverifikasi KTM yang dapat membuat pesanan COD.",
      };
    }
    if (!product.alwaysAvailable && product.stock < quantity) {
      return {
        ok: false,
        error: `Stok tersisa hanya ${product.stock}. Kurangi jumlah pesanan Anda.`,
      };
    }

    const orderNum = String(orders.length + 1).padStart(2, "0");
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      code: `UM-2611-${orderNum}`,
      productId: product.id,
      productTitle: product.title,
      unitPrice: product.price,
      quantity,
      codSpot,
      proposedTime,
      note: note.trim(),
      status: "Menunggu",
      sellerLabel: product.sellerName,
      sellerWa: product.sellerWa,
      buyerLabel: profile.name,
      createdAt: new Date().toISOString(),
    };

    if (!product.alwaysAvailable) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, stock: Math.max(0, item.stock - quantity) }
            : item
        )
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    pushNotification(
      `Pesanan ${newOrder.code} Dibuat`,
      `Menunggu konfirmasi penjual untuk COD di ${codSpot} (${proposedTime}).`,
      "/pesanan"
    );

    return { ok: true, order: newOrder };
  };

  const updateOrderStatus = (
    orderId: string,
    nextStatus: OrderStatus,
    cancelReason?: string
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: nextStatus, cancelReason: cancelReason ?? o.cancelReason }
          : o
      )
    );

    if (nextStatus === "Dibatalkan" || nextStatus === "Kedaluwarsa") {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === target.productId && !p.alwaysAvailable
            ? { ...p, stock: p.stock + target.quantity }
            : p
        )
      );
    }

    pushNotification(
      `Status ${target.code}: ${nextStatus}`,
      nextStatus === "Dijadwalkan"
        ? `Jadwal disetujui di ${target.codSpot}. Tombol WhatsApp kini aktif.`
        : `Pesanan ${target.productTitle} diperbarui menjadi ${nextStatus}.`,
      "/pesanan"
    );
  };

  const addOrderReview = (orderId: string, rating: number, comment: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, ratingSubmitted: rating, reviewComment: comment }
          : o
      )
    );

    setProducts((prev) =>
      prev.map((p) =>
        p.id === target.productId
          ? {
              ...p,
              reviews: [
                ...(p.reviews ?? []),
                {
                  id: `rev-${Date.now()}`,
                  authorLabel: profile.name,
                  rating,
                  comment: comment || "Transaksi COD berjalan lancar.",
                  createdAt: "Hari ini",
                },
              ],
            }
          : p
      )
    );
  };

  const addListing = (input: NewListingInput): ProductItem => {
    const slugBase = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 32);

    const created: ProductItem = {
      id: `${slugBase || "listing"}-${Date.now()}`,
      title: input.title,
      description: input.description,
      price: input.price,
      priceLabel: formatRupiah(input.price),
      condition: input.condition,
      stock: input.alwaysAvailable ? 1 : Math.max(1, input.stock),
      alwaysAvailable: input.alwaysAvailable,
      codSpots: input.codSpots,
      faculty: input.faculty,
      sellerName: profile.name,
      sellerProdi: profile.prodi,
      sellerVerified: profile.ktmStatus === "Terverifikasi",
      sellerWa: profile.wa || "081200001199",
      badge: input.isUmkm
        ? "Etalase UMKM"
        : input.price === 0
          ? "Berbagi Rp0"
          : input.condition,
      badgeTone: input.isUmkm || input.price === 0 ? "green" : "yellow",
      cardBg: input.isUmkm ? "bg-[#FEF08A]" : "bg-[#DCFCE7]",
      category: input.category,
      isUmkm: input.isUmkm,
      illustration: input.isUmkm ? "umkm-coffee" : "bag",
      uploadedImages: input.uploadedImages,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [created, ...prev]);
    pushNotification(
      "Listing Baru Tayang",
      `${created.title} langsung terbit di katalog UnilakMart.`,
      `/listing/${created.id}`
    );
    return created;
  };

  const toggleListingStockZero = (productId: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              alwaysAvailable: false,
              stock: item.stock > 0 ? 0 : 1,
            }
          : item
      )
    );
  };

  const hideListingByAdmin = (productId: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, hidden: true } : item
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const submitKtmVerification = (input: {
    nim: string;
    wa: string;
    email: string;
    faculty: string;
    prodi: string;
    pdpConsent: boolean;
    photoName: string;
  }) => {
    setProfile((prev) => ({
      ...prev,
      nim: input.nim,
      wa: input.wa,
      email: input.email,
      faculty: input.faculty,
      prodi: input.prodi,
      pdpConsent: input.pdpConsent,
      ktmPhotoName: input.photoName || "ktm-mahasiswa-privat.jpg",
      ktmStatus: "Menunggu",
      ktmReason: undefined,
    }));

    setKtmQueue((prev) => [
      {
        id: `ktm-user-${Date.now()}`,
        nim: input.nim,
        name: profile.name,
        prodi: input.prodi,
        faculty: input.faculty,
        submittedAt: "Baru saja",
        photoLabel: input.photoName || "ktm-mahasiswa-privat.jpg",
        status: "Menunggu",
      },
      ...prev,
    ]);

    pushNotification(
      "Dokumen KTM Diterima",
      "Foto KTM disimpan di bucket privat dan masuk antrean verifikasi administrator.",
      "/profil"
    );
  };

  const deleteOwnAccount = () => {
    const hasActive = orders.some(
      (o) =>
        o.status === "Menunggu" ||
        o.status === "Dijadwalkan" ||
        o.status === "Sudah Diserahkan"
    );
    if (hasActive) {
      return {
        ok: false,
        error:
          "Hapus akun ditahan sementara karena Anda masih memiliki pesanan aktif (Menunggu, Dijadwalkan, atau Sudah Diserahkan). Selesaikan atau batalkan terlebih dahulu sesuai FR-08.",
      };
    }

    setProfile({
      nim: "ANONIM",
      name: "Akun Mahasiswa Terhapus",
      prodi: "-",
      faculty: "-",
      email: "deleted@anonim.local",
      wa: "",
      pdpConsent: false,
      isUmkm: false,
      ktmStatus: "Belum Verifikasi",
      ktmPhotoName: "",
      deletedAt: new Date().toISOString(),
    });
    return { ok: true };
  };

  const approveKtm = (queueId: string) => {
    const item = ktmQueue.find((q) => q.id === queueId);
    setKtmQueue((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              status: "Terverifikasi",
              photoDeletedNote:
                "Foto KTM dihapus otomatis dari bucket privat (FR-03).",
            }
          : q
      )
    );
    if (item && item.nim === profile.nim) {
      setProfile((prev) => ({
        ...prev,
        ktmStatus: "Terverifikasi",
        ktmPhotoName: "",
        ktmReason: undefined,
      }));
    }
    pushNotification(
      "Verifikasi KTM Disetujui",
      "Akun kini berstatus Terverifikasi dan foto KTM telah dihapus otomatis dari bucket privat.",
      "/profil"
    );
  };

  const rejectKtm = (queueId: string, reason: string) => {
    const item = ktmQueue.find((q) => q.id === queueId);
    setKtmQueue((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              status: "Ditolak",
              rejectionReason: reason,
              photoDeletedNote:
                "Foto dijadwalkan terhapus otomatis maks. 7 hari setelah ditolak.",
            }
          : q
      )
    );
    if (item && item.nim === profile.nim) {
      setProfile((prev) => ({
        ...prev,
        ktmStatus: "Ditolak",
        ktmReason: reason,
      }));
    }
    pushNotification("Verifikasi KTM Ditolak", reason, "/profil");
  };

  const submitReport = (input: {
    targetType: ReportItem["targetType"];
    targetId: string;
    targetTitle: string;
    reason: string;
  }) => {
    setReports((prev) => [
      {
        id: `rep-${Date.now()}`,
        targetType: input.targetType,
        targetId: input.targetId,
        targetTitle: input.targetTitle,
        reason: input.reason,
        status: "Baru",
        createdAt: "Baru saja",
      },
      ...prev,
    ]);
    pushNotification(
      "Laporan Terkirim ke Admin",
      `Laporan mengenai "${input.targetTitle}" tercatat untuk post-moderasi (FR-46).`,
      "/admin"
    );
  };

  const resolveReport = (reportId: string, action: "hide" | "dismiss") => {
    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) return;
    if (action === "hide" && targetReport.targetType === "Listing") {
      hideListingByAdmin(targetReport.targetId);
    }
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: action === "hide" ? "Disembunyikan" : "Selesai",
            }
          : r
      )
    );
  };

  const toggleCodSpot = (spotId: string) => {
    setCodSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, active: !s.active } : s))
    );
  };

  const value: MarketplaceContextValue = {
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
    orders,
    createOrder,
    updateOrderStatus,
    addOrderReview,
    addListing,
    toggleListingStockZero,
    hideListingByAdmin,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    profile,
    updateProfile,
    submitKtmVerification,
    deleteOwnAccount,
    ktmQueue,
    approveKtm,
    rejectKtm,
    reports,
    submitReport,
    resolveReport,
    codSpots,
    toggleCodSpot,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error("useMarketplace harus dipakai di dalam MarketplaceProvider");
  }
  return ctx;
}
