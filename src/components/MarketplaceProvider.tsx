"use client";

import imageCompression from "browser-image-compression";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { signOutAction } from "@/app/masuk/actions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  mapDbCodSpot,
  mapDbListingToProduct,
  mapDbNotification,
  mapDbProfileToUserProfile,
} from "@/lib/supabase/mappers";
import {
  INITIAL_COD_SPOTS,
  INITIAL_KTM_QUEUE,
  INITIAL_MY_LISTING_IDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PROFILE,
  INITIAL_REGISTERED_NIMS,
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
  authUserId: string | null;
  supabaseReady: boolean;
  refreshSupabaseData: () => Promise<void>;
  signOutAccount: () => Promise<void>;
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
  myListingIds: string[];
  updateMyListing: (
    productId: string,
    patch: { price?: number; stock?: number; hidden?: boolean }
  ) => void;
  deleteMyListing: (productId: string) => void;
  toggleListingStockZero: (productId: string) => void;
  hideListingByAdmin: (productId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  profile: UserProfile;
  loginPreviewAccount: (input: { identifier: string }) => { ok: boolean; error?: string };
  registerPreviewAccount: (input: {
    nim: string;
    name: string;
    faculty: string;
    prodi: string;
    email: string;
    wa: string;
    pdpConsent: boolean;
  }) => { ok: boolean; error?: string };
  updateProfile: (patch: Partial<UserProfile>) => Promise<void> | void;
  submitKtmVerification: (input: {
    nim: string;
    name?: string;
    wa: string;
    email: string;
    faculty: string;
    prodi: string;
    pdpConsent: boolean;
    photoName: string;
    photoFile?: File | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteOwnAccount: () => Promise<{ ok: boolean; error?: string }>;
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
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>(SAMPLE_PRODUCTS);
  const [myListingIds, setMyListingIds] = useState<string[]>(INITIAL_MY_LISTING_IDS);
  const [registeredNims, setRegisteredNims] = useState<string[]>(INITIAL_REGISTERED_NIMS);
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

  const refreshSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();

      const [spotsRes, pubProfilesRes, listingsRes, userRes] = await Promise.all([
        supabase.from("cod_spots").select("*").order("sort_order", { ascending: true }),
        supabase.from("public_profiles").select("*"),
        supabase
          .from("listings")
          .select("*")
          .order("is_umkm", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);

      const spotRows = spotsRes.data ?? [];
      const spotNameById = new Map(spotRows.map((s) => [s.id, s.name]));
      if (spotRows.length > 0) {
        setCodSpots(spotRows.map(mapDbCodSpot));
      }

      const publicProfilesMap = new Map(
        (pubProfilesRes.data ?? []).map((p) => [p.id, p])
      );

      const listingRows = listingsRes.data ?? [];
      if (listingRows.length > 0) {
        setProducts(
          listingRows.map((row) =>
            mapDbListingToProduct(row, publicProfilesMap, spotNameById)
          )
        );
      }

      const uid = userRes.data.user?.id ?? null;

      if (uid) {
        const [profileRes, savedRes, notifRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("saved_listings").select("listing_id").eq("user_id", uid),
          supabase
            .from("notifications")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        if (profileRes.data) {
          setProfile(mapDbProfileToUserProfile(profileRes.data));
        }

        const ownedSlugs = listingRows
          .filter((row) => row.seller_id === uid)
          .map((row) => row.slug);
        setMyListingIds(ownedSlugs);

        const slugByDbId = new Map(listingRows.map((r) => [r.id, r.slug]));
        const userSavedSlugs = (savedRes.data ?? [])
          .map((s) => slugByDbId.get(s.listing_id))
          .filter((slug): slug is string => Boolean(slug));
        setSavedIds(userSavedSlugs);

        if (notifRes.data) {
          setNotifications(notifRes.data.map(mapDbNotification));
        }
      } else {
        setProfile(INITIAL_PROFILE);
        setMyListingIds(INITIAL_MY_LISTING_IDS);
        setNotifications(INITIAL_NOTIFICATIONS);
      }

      setAuthUserId(uid);
      setSupabaseReady(true);
    } catch {
      // Tetap gunakan data pratinjau lokal jika jaringan Supabase gagal
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;

    void (async () => {
      if (active) {
        await refreshSupabaseData();
      }
    })();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (active) {
        void refreshSupabaseData();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshSupabaseData]);

  const signOutAccount = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      await signOutAction();
    } finally {
      setAuthUserId(null);
      setProfile(INITIAL_PROFILE);
      setMyListingIds(INITIAL_MY_LISTING_IDS);
      setNotifications(INITIAL_NOTIFICATIONS);
      await refreshSupabaseData();
    }
  }, [refreshSupabaseData]);

  const toggleSave = (id: string) => {
    const currentlySaved = savedIds.includes(id);
    setSavedIds((prev) =>
      currentlySaved ? prev.filter((item) => item !== id) : [...prev, id]
    );

    if (authUserId && isSupabaseConfigured()) {
      const target = products.find((p) => p.id === id);
      if (target?.dbId) {
        const supabase = createClient();
        if (currentlySaved) {
          void supabase
            .from("saved_listings")
            .delete()
            .eq("user_id", authUserId)
            .eq("listing_id", target.dbId);
        } else {
          void supabase
            .from("saved_listings")
            .insert({ user_id: authUserId, listing_id: target.dbId });
        }
      }
    }
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
    setMyListingIds((prev) => [created.id, ...prev]);
    pushNotification(
      "Listing Baru Tayang",
      `${created.title} langsung terbit di katalog UnilakMart.`,
      `/listing/${created.id}`
    );
    return created;
  };

  const updateMyListing = (
    productId: string,
    patch: { price?: number; stock?: number; hidden?: boolean }
  ) => {
    let dbPayload: {
      price?: number;
      stock?: number;
      always_available?: boolean;
      status?: string;
    } | null = null;

    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const nextPrice =
          typeof patch.price === "number" ? Math.max(0, patch.price) : item.price;
        const nextStock =
          typeof patch.stock === "number" ? Math.max(0, patch.stock) : item.stock;
        const nextHidden =
          typeof patch.hidden === "boolean" ? patch.hidden : item.hidden;
        dbPayload = {
          price: nextPrice,
          stock: nextStock,
          always_available: nextStock > 0 ? item.alwaysAvailable : false,
          status: nextHidden
            ? "Nonaktif"
            : !item.alwaysAvailable && nextStock <= 0
              ? "Terjual"
              : "Aktif",
        };
        return {
          ...item,
          price: nextPrice,
          priceLabel: formatRupiah(nextPrice),
          stock: nextStock,
          alwaysAvailable: nextStock > 0 ? item.alwaysAvailable : false,
          hidden: nextHidden,
        };
      })
    );

    if (authUserId && dbPayload && isSupabaseConfigured()) {
      const supabase = createClient();
      void supabase
        .from("listings")
        .update(dbPayload)
        .eq("slug", productId)
        .eq("seller_id", authUserId);
    }
  };

  const deleteMyListing = (productId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setMyListingIds((prev) => prev.filter((id) => id !== productId));

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      void supabase
        .from("listings")
        .delete()
        .eq("slug", productId)
        .eq("seller_id", authUserId);
    }
  };

  const toggleListingStockZero = (productId: string) => {
    let nextStockValue = 0;
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        nextStockValue = item.stock > 0 ? 0 : 1;
        return {
          ...item,
          alwaysAvailable: false,
          stock: nextStockValue,
        };
      })
    );

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      void supabase
        .from("listings")
        .update({
          always_available: false,
          stock: nextStockValue,
          status: nextStockValue <= 0 ? "Terjual" : "Aktif",
        })
        .eq("slug", productId)
        .eq("seller_id", authUserId);
    }
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
    if (authUserId && isSupabaseConfigured()) {
      const numId = Number(id);
      if (Number.isFinite(numId)) {
        const supabase = createClient();
        void supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", numId)
          .eq("user_id", authUserId);
      }
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      void supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", authUserId)
        .eq("read", false);
    }
  };

  const updateProfile = async (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.prodi !== undefined ? { unit_or_prodi: patch.prodi } : {}),
          ...(patch.faculty !== undefined ? { faculty: patch.faculty } : {}),
          ...(patch.wa !== undefined ? { wa: patch.wa } : {}),
        })
        .eq("id", authUserId);
    }
  };

  const loginPreviewAccount = (input: { identifier: string }) => {
    const clean = input.identifier.trim();
    if (!clean) {
      return { ok: false, error: "Masukkan NIM atau email Unilak yang terdaftar." };
    }
    const isEmail = clean.includes("@");
    setProfile((prev) => ({
      ...prev,
      nim: isEmail ? prev.nim || "2255201045" : clean,
      email: isEmail ? clean : prev.email || `${clean}@student.unilak.ac.id`,
      name:
        prev.deletedAt || !prev.name
          ? "Mahasiswa Unilak (Pratinjau)"
          : prev.name,
      ktmStatus: prev.deletedAt ? "Terverifikasi" : prev.ktmStatus,
      deletedAt: undefined,
    }));
    pushNotification(
      "Masuk Akun Berhasil (Mode Pratinjau)",
      `Sesi pratinjau aktif untuk ${clean}.`,
      "/profil"
    );
    return { ok: true };
  };

  const registerPreviewAccount = (input: {
    nim: string;
    name: string;
    faculty: string;
    prodi: string;
    email: string;
    wa: string;
    pdpConsent: boolean;
  }) => {
    const cleanNim = input.nim.trim();
    if (registeredNims.includes(cleanNim)) {
      return {
        ok: false,
        error:
          "NIM ini sudah dipakai pada akun lain. Satu NIM hanya diperbolehkan untuk satu akun.",
      };
    }
    if (!input.pdpConsent) {
      return {
        ok: false,
        error:
          "Persetujuan UU PDP wajib dicentang sebelum mendaftar di UnilakMart.",
      };
    }
    setRegisteredNims((prev) => [...prev, cleanNim]);
    setProfile({
      nim: cleanNim,
      name: input.name.trim(),
      faculty: input.faculty,
      prodi: input.prodi.trim(),
      email: input.email.trim(),
      wa: input.wa.trim(),
      pdpConsent: true,
      isUmkm: false,
      ktmStatus: "Belum Verifikasi",
      ktmPhotoName: "",
    });
    pushNotification(
      "Pendaftaran Berhasil & Email Verifikasi Terkirim",
      "Lanjutkan unggah foto KTM di halaman Profil agar akun menjadi Terverifikasi.",
      "/profil"
    );
    return { ok: true };
  };

  const submitKtmVerification = async (input: {
    nim: string;
    name?: string;
    wa: string;
    email: string;
    faculty: string;
    prodi: string;
    pdpConsent: boolean;
    photoName: string;
    photoFile?: File | null;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      let storedPath = input.photoName || `${authUserId}/ktm-submitted.jpg`;

      if (input.photoFile) {
        let uploadTarget: File = input.photoFile;
        try {
          uploadTarget = await imageCompression(input.photoFile, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
          });
        } catch {
          // Gunakan berkas asli bila browser menolak web worker kompresi
        }

        const ext = (input.photoFile.name.split(".").pop() || "jpg")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const filePath = `${authUserId}/ktm-${Date.now()}.${ext || "jpg"}`;

        const { error: uploadErr } = await supabase.storage
          .from("ktm-documents")
          .upload(filePath, uploadTarget, {
            contentType: uploadTarget.type || "image/jpeg",
            upsert: false,
          });

        if (uploadErr) {
          return {
            ok: false,
            error: `Gagal mengunggah foto KTM ke bucket privat: ${uploadErr.message}`,
          };
        }
        storedPath = filePath;
      }

      const { error: rpcErr } = await supabase.rpc("submit_ktm_request", {
        p_identifier_number: input.nim,
        p_name: input.name || profile.name,
        p_unit_or_prodi: input.prodi,
        p_faculty: input.faculty,
        p_wa: input.wa,
        p_pdp_consent: input.pdpConsent,
        p_photo_path: storedPath,
      });

      if (rpcErr) {
        return { ok: false, error: rpcErr.message };
      }

      await refreshSupabaseData();
      return { ok: true };
    }

    setProfile((prev) => ({
      ...prev,
      nim: input.nim,
      name: input.name || prev.name,
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
        name: input.name || profile.name,
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
    return { ok: true };
  };

  const deleteOwnAccount = async (): Promise<{ ok: boolean; error?: string }> => {
    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_own_account");
      if (error) {
        return { ok: false, error: error.message };
      }
      await signOutAccount();
      return { ok: true };
    }

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
          "Hapus akun ditahan sementara karena Anda masih memiliki pesanan aktif (Menunggu, Dijadwalkan, atau Sudah Diserahkan). Selesaikan atau batalkan terlebih dahulu.",
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
                "Foto KTM dihapus otomatis dari bucket privat.",
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
      `Laporan mengenai "${input.targetTitle}" tercatat untuk ditinjau administrator.`,
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
    authUserId,
    supabaseReady,
    refreshSupabaseData,
    signOutAccount,
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
    myListingIds,
    updateMyListing,
    deleteMyListing,
    toggleListingStockZero,
    hideListingByAdmin,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    profile,
    loginPreviewAccount,
    registerPreviewAccount,
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
