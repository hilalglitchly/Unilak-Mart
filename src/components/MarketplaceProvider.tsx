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
import {
  addCodSpotAction,
  deleteApprovedKtmObjectAction,
  runAdminMaintenanceAction,
  toggleCategoryActiveAction,
  toggleUserSuspendedAction,
  toggleUserUmkmAction,
} from "@/app/admin/actions";
import { signOutAction } from "@/app/masuk/actions";
import type { MaintenanceSummary } from "@/lib/marketplace-maintenance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  mapDbAdminUser,
  mapDbCategoryRef,
  mapDbCodSpot,
  mapDbKtmQueueItem,
  mapDbListingToProduct,
  mapDbNotification,
  mapDbOrder,
  mapDbProfileToUserProfile,
  mapDbReport,
  mapDbReview,
} from "@/lib/supabase/mappers";
import {
  INITIAL_ADMIN_USERS,
  INITIAL_CATEGORY_REFS,
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
  type AdminUserItem,
  type CategoryId,
  type CategoryRefItem,
  type CodSpotItem,
  type ItemCondition,
  type KtmQueueItem,
  type NotificationItem,
  type OrderItem,
  type OrderStatus,
  type ProductItem,
  type ProductReview,
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
  uploadedFiles?: File[];
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
  createOrder: (
    input: CreateOrderInput
  ) => Promise<{ ok: boolean; error?: string; order?: OrderItem }>;
  updateOrderStatus: (
    orderId: string,
    nextStatus: OrderStatus,
    cancelReason?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  addOrderReview: (
    orderId: string,
    rating: number,
    comment: string
  ) => Promise<{ ok: boolean; error?: string }>;
  addListing: (
    input: NewListingInput
  ) => Promise<{ ok: boolean; error?: string; product?: ProductItem }>;
  myListingIds: string[];
  updateMyListing: (
    productId: string,
    patch: { price?: number; stock?: number; hidden?: boolean }
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteMyListing: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  toggleListingStockZero: (
    productId: string
  ) => Promise<{ ok: boolean; error?: string }>;
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
  approveKtm: (queueId: string) => Promise<{ ok: boolean; error?: string }>;
  rejectKtm: (queueId: string, reason: string) => Promise<{ ok: boolean; error?: string }>;
  reports: ReportItem[];
  submitReport: (input: {
    targetType: ReportItem["targetType"];
    targetId: string;
    targetTitle: string;
    reason: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  resolveReport: (
    reportId: string,
    action: "hide" | "dismiss"
  ) => Promise<{ ok: boolean; error?: string }>;
  codSpots: CodSpotItem[];
  toggleCodSpot: (spotId: string) => Promise<{ ok: boolean; error?: string }>;
  addCodSpot: (input: {
    name: string;
    location: string;
    hours: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  categoryRefs: CategoryRefItem[];
  toggleCategoryActive: (slug: string) => Promise<{ ok: boolean; error?: string }>;
  adminUsers: AdminUserItem[];
  toggleUserUmkm: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  toggleUserSuspended: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  runMaintenance: () => Promise<{
    ok: boolean;
    summary?: MaintenanceSummary;
    error?: string;
  }>;
  locale: "id" | "en";
  toggleLocale: () => void;
  resolvedTheme: "light" | "dark";
  themePreference: "system" | "light" | "dark";
  toggleTheme: () => void;
  resetThemeToSystem: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [locale, setLocale] = useState<"id" | "en">("id");
  const [themePreference, setThemePreference] = useState<
    "system" | "light" | "dark"
  >("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const syncFromEnvironment = () => {
      let storedTheme: string | null = null;
      let storedLocale: string | null = null;
      try {
        storedTheme = localStorage.getItem("color-scheme");
        storedLocale = localStorage.getItem("unilak-locale");
      } catch {
        // Abaikan bila localStorage dibatasi browser
      }

      const nextLocale = storedLocale === "en" ? "en" : "id";
      setLocale(nextLocale);
      document.documentElement.lang = nextLocale;

      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const explicitTheme =
        storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
      const activeDark = explicitTheme ? explicitTheme === "dark" : systemDark;

      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) {
        meta.setAttribute("content", explicitTheme ?? "light dark");
      }
      document.documentElement.classList.toggle("dark", activeDark);
      setThemePreference(explicitTheme ?? "system");
      setResolvedTheme(activeDark ? "dark" : "light");
    };

    syncFromEnvironment();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => syncFromEnvironment();
    const handleStorageChange = () => syncFromEnvironment();

    mq.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      mq.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "id" ? "en" : "id";
      try {
        localStorage.setItem("unilak-locale", next);
      } catch {
        // Tetap terapkan bahasa pada sesi berjalan
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = next;
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    if (typeof window === "undefined") return;
    const systemScheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("color-scheme");
    } catch {
      // Abaikan bila akses storage ditolak
    }
    const currentRendered =
      stored === "dark" || stored === "light" ? stored : systemScheme;
    const targetScheme = currentRendered === "dark" ? "light" : "dark";

    const meta = document.querySelector('meta[name="color-scheme"]');
    try {
      if (targetScheme === systemScheme) {
        localStorage.removeItem("color-scheme");
      } else {
        localStorage.setItem("color-scheme", targetScheme);
      }
    } catch {
      // Tetap perbarui DOM bila localStorage diblokir
    }

    if (meta) {
      meta.setAttribute(
        "content",
        targetScheme === systemScheme ? "light dark" : targetScheme
      );
    }
    document.documentElement.classList.toggle("dark", targetScheme === "dark");
    setThemePreference(targetScheme === systemScheme ? "system" : targetScheme);
    setResolvedTheme(targetScheme);
  }, []);

  const resetThemeToSystem = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("color-scheme");
    } catch {
      // Abaikan bila localStorage diblokir
    }
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute("content", "light dark");
    }
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.classList.toggle("dark", systemDark);
    setThemePreference("system");
    setResolvedTheme(systemDark ? "dark" : "light");
  }, []);

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
  const [categoryRefs, setCategoryRefs] =
    useState<CategoryRefItem[]>(INITIAL_CATEGORY_REFS);
  const [adminUsers, setAdminUsers] =
    useState<AdminUserItem[]>(INITIAL_ADMIN_USERS);

  const refreshSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();

      const [spotsRes, catRes, pubProfilesRes, listingsRes, reviewsRes, userRes] =
        await Promise.all([
          supabase.from("cod_spots").select("*").order("sort_order", { ascending: true }),
          supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          supabase.from("public_profiles").select("*"),
          supabase
            .from("listings")
            .select("*")
            .order("is_umkm", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.auth.getUser(),
        ]);

      const spotRows = spotsRes.data ?? [];
      const spotNameById = new Map(spotRows.map((s) => [s.id, s.name]));
      if (spotRows.length > 0) {
        setCodSpots(spotRows.map(mapDbCodSpot));
      }
      if (catRes.data && catRes.data.length > 0) {
        setCategoryRefs(catRes.data.map(mapDbCategoryRef));
      }

      const publicProfilesMap = new Map(
        (pubProfilesRes.data ?? []).map((p) => [p.id, p])
      );

      const allReviews = reviewsRes.data ?? [];
      const reviewsByListing = new Map<number, ProductReview[]>();
      for (const rev of allReviews) {
        const list = reviewsByListing.get(rev.listing_id) ?? [];
        list.push(mapDbReview(rev, publicProfilesMap));
        reviewsByListing.set(rev.listing_id, list);
      }

      const listingRows = listingsRes.data ?? [];
      if (listingRows.length > 0) {
        setProducts(
          listingRows.map((row) =>
            mapDbListingToProduct(
              row,
              publicProfilesMap,
              spotNameById,
              reviewsByListing.get(row.id)
            )
          )
        );
      }

      const listingSlugById = new Map(listingRows.map((r) => [r.id, r.slug]));
      const uid = userRes.data.user?.id ?? null;

      if (uid) {
        const [profileRes, savedRes, notifRes, ordersRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("saved_listings").select("listing_id").eq("user_id", uid),
          supabase
            .from("notifications")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (profileRes.data) {
          setProfile(mapDbProfileToUserProfile(profileRes.data));
        }

        const ownedSlugs = listingRows
          .filter((row) => row.seller_id === uid)
          .map((row) => row.slug);
        setMyListingIds(ownedSlugs);

        const userSavedSlugs = (savedRes.data ?? [])
          .map((s) => listingSlugById.get(s.listing_id))
          .filter((slug): slug is string => Boolean(slug));
        setSavedIds(userSavedSlugs);

        if (notifRes.data) {
          setNotifications(notifRes.data.map(mapDbNotification));
        }

        const orderRows = ordersRes.data ?? [];
        const waMap = new Map<number, string>();
        await Promise.all(
          orderRows
            .filter(
              (o) =>
                (o.buyer_id === uid || o.seller_id === uid) &&
                (o.status === "Dijadwalkan" || o.status === "Sudah Diserahkan")
            )
            .map(async (o) => {
              const { data: waRows } = await supabase.rpc(
                "get_order_counterparty_wa",
                { p_order_id: o.id }
              );
              const wa = waRows?.[0]?.counterparty_wa;
              if (wa) waMap.set(o.id, wa);
            })
        );

        const reviewByOrder = new Map(
          allReviews
            .filter((r) => r.reviewer_id === uid)
            .map((r) => [r.order_id, r])
        );
        setOrders(
          orderRows.map((row) =>
            mapDbOrder(
              row,
              listingSlugById,
              publicProfilesMap,
              waMap.get(row.id) ?? "",
              reviewByOrder.get(row.id)
            )
          )
        );

        if (profileRes.data?.system_role === "admin") {
          const [ktmRes, repRes, usersRes] = await Promise.all([
            supabase
              .from("ktm_verifications")
              .select("*")
              .order("created_at", { ascending: false }),
            supabase
              .from("reports")
              .select("*")
              .order("created_at", { ascending: false }),
            supabase
              .from("profiles")
              .select("*")
              .order("created_at", { ascending: false }),
          ]);
          if (ktmRes.data) {
            setKtmQueue(
              ktmRes.data.map((row) => mapDbKtmQueueItem(row, publicProfilesMap))
            );
          }
          if (repRes.data) {
            setReports(repRes.data.map(mapDbReport));
          }
          if (usersRes.data) {
            setAdminUsers(usersRes.data.map(mapDbAdminUser));
          }
        } else {
          setKtmQueue([]);
          setReports([]);
          setAdminUsers([]);
        }
      } else {
        setProfile(INITIAL_PROFILE);
        setMyListingIds(INITIAL_MY_LISTING_IDS);
        setNotifications(INITIAL_NOTIFICATIONS);
        setOrders(INITIAL_ORDERS);
        setKtmQueue(INITIAL_KTM_QUEUE);
        setReports(INITIAL_REPORTS);
        setAdminUsers(INITIAL_ADMIN_USERS);
        setCategoryRefs(INITIAL_CATEGORY_REFS);
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
      setOrders(INITIAL_ORDERS);
      setKtmQueue(INITIAL_KTM_QUEUE);
      setReports(INITIAL_REPORTS);
      setAdminUsers(INITIAL_ADMIN_USERS);
      setCategoryRefs(INITIAL_CATEGORY_REFS);
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

  const createOrder = async ({
    product,
    quantity,
    codSpot,
    proposedTime,
    note,
  }: CreateOrderInput): Promise<{
    ok: boolean;
    error?: string;
    order?: OrderItem;
  }> => {
    if (authUserId && isSupabaseConfigured()) {
      if (!product.dbId) {
        return {
          ok: false,
          error: "Data listing belum sinkron dengan server Supabase.",
        };
      }
      const spotId =
        codSpots.find((s) => s.name === codSpot)?.id ??
        codSpots.find((s) => s.active)?.id ??
        "perpus-pusat";

      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_cod_order", {
        p_listing_id: product.dbId,
        p_quantity: quantity,
        p_cod_spot_id: spotId,
        p_proposed_time: proposedTime,
        p_note: note,
      });

      if (error || !data) {
        return {
          ok: false,
          error: error?.message ?? "Gagal mengirim permintaan pesanan COD.",
        };
      }

      await refreshSupabaseData();
      return {
        ok: true,
        order: {
          id: String(data.id),
          dbId: data.id,
          listingDbId: data.listing_id,
          buyerId: data.buyer_id,
          sellerId: data.seller_id,
          code: data.code,
          productId: product.id,
          productTitle: data.listing_title,
          unitPrice: data.unit_price,
          quantity: data.quantity,
          codSpot: data.cod_spot_name,
          proposedTime: data.proposed_time,
          note: data.note,
          status: data.status as OrderStatus,
          sellerLabel: product.sellerName,
          sellerWa: "",
          buyerLabel: profile.name,
          createdAt: data.created_at,
        },
      };
    }

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

  const updateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
    cancelReason?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { ok: false, error: "Pesanan tidak ditemukan." };

    if (authUserId && target.dbId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.rpc("update_cod_order_status", {
        p_order_id: target.dbId,
        p_next_status: nextStatus,
        p_cancel_reason: cancelReason,
      });
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

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
    return { ok: true };
  };

  const addOrderReview = async (
    orderId: string,
    rating: number,
    comment: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { ok: false, error: "Pesanan tidak ditemukan." };

    if (
      authUserId &&
      target.dbId &&
      target.listingDbId &&
      isSupabaseConfigured()
    ) {
      const counterpartyId =
        target.buyerId === authUserId ? target.sellerId : target.buyerId;
      if (!counterpartyId) {
        return { ok: false, error: "ID lawan transaksi tidak valid." };
      }

      const supabase = createClient();
      const { error } = await supabase.from("reviews").insert({
        order_id: target.dbId,
        listing_id: target.listingDbId,
        reviewer_id: authUserId,
        target_user_id: counterpartyId,
        rating,
        comment,
      });
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

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
    return { ok: true };
  };

  const addListing = async (
    input: NewListingInput
  ): Promise<{ ok: boolean; error?: string; product?: ProductItem }> => {
    const slugBase = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 32);
    const slug = `${slugBase || "listing"}-${Date.now().toString(36)}`;

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      const filesToUpload = (input.uploadedFiles ?? []).slice(0, 5);
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const ext = (file.name.split(".").pop() || "jpg")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const objectPath = `${authUserId}/${slug}-${i + 1}.${ext || "jpg"}`;

        const { error: uploadErr } = await supabase.storage
          .from("listing-photos")
          .upload(objectPath, file, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });
        if (uploadErr) {
          return {
            ok: false,
            error: `Gagal mengunggah foto listing ke-${i + 1}: ${uploadErr.message}`,
          };
        }
        const { data: pubUrl } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(objectPath);
        uploadedUrls.push(pubUrl.publicUrl);
      }

      const spotIds = codSpots
        .filter((s) => input.codSpots.includes(s.name))
        .map((s) => s.id);

      const badgeText = input.isUmkm
        ? "UMKM"
        : input.price === 0
          ? "Gratis Rp0"
          : input.condition;
      const badgeTone = input.isUmkm || input.price === 0 ? "yellow" : "green";
      const cardBgHex = input.isUmkm ? "#FEF9C3" : "#DCFCE7";

      const { data: inserted, error: insertErr } = await supabase
        .from("listings")
        .insert({
          slug,
          seller_id: authUserId,
          title: input.title,
          description: input.description,
          price: input.price,
          condition: input.condition,
          stock: input.alwaysAvailable ? 1 : Math.max(1, input.stock),
          always_available: input.alwaysAvailable,
          category: input.category,
          faculty: input.faculty,
          is_umkm: input.isUmkm,
          cod_spot_ids: spotIds,
          photos: uploadedUrls,
          illustration: input.isUmkm ? "umkm-coffee" : "bag",
          badge: badgeText,
          badge_tone: badgeTone,
          card_bg: cardBgHex,
          status: "Aktif",
        })
        .select("*")
        .single();

      if (insertErr || !inserted) {
        return {
          ok: false,
          error: insertErr?.message ?? "Gagal menyimpan listing baru ke Supabase.",
        };
      }

      await refreshSupabaseData();
      return {
        ok: true,
        product: {
          id: inserted.slug,
          dbId: inserted.id,
          title: inserted.title,
          description: inserted.description,
          price: inserted.price,
          priceLabel: formatRupiah(inserted.price),
          condition: inserted.condition as ItemCondition,
          stock: inserted.stock,
          alwaysAvailable: inserted.always_available,
          codSpots: input.codSpots,
          faculty: inserted.faculty,
          sellerName: profile.name,
          sellerProdi: profile.prodi,
          sellerVerified: profile.ktmStatus === "Terverifikasi",
          sellerWa: "",
          badge: badgeText,
          badgeTone,
          cardBg: input.isUmkm ? "bg-[#FEF08A]" : "bg-[#DCFCE7]",
          category: input.category,
          isUmkm: input.isUmkm,
          illustration: input.isUmkm ? "umkm-coffee" : "bag",
          uploadedImages: uploadedUrls,
          createdAt: inserted.created_at,
        },
      };
    }

    const created: ProductItem = {
      id: slug,
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
    return { ok: true, product: created };
  };

  const updateMyListing = async (
    productId: string,
    patch: { price?: number; stock?: number; hidden?: boolean }
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = products.find((item) => item.id === productId);
    if (!target) return { ok: false, error: "Listing tidak ditemukan." };

    const nextPrice =
      typeof patch.price === "number" ? Math.max(0, patch.price) : target.price;
    const nextStock =
      typeof patch.stock === "number" ? Math.max(0, patch.stock) : target.stock;
    const nextHidden =
      typeof patch.hidden === "boolean" ? patch.hidden : target.hidden;
    const nextAlways = nextStock > 0 ? target.alwaysAvailable : false;

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({
          price: nextPrice,
          stock: nextStock,
          always_available: Boolean(nextAlways),
          status: nextHidden
            ? "Nonaktif"
            : !target.alwaysAvailable && nextStock <= 0
              ? "Terjual"
              : "Aktif",
        })
        .eq("slug", productId)
        .eq("seller_id", authUserId);

      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              price: nextPrice,
              priceLabel: formatRupiah(nextPrice),
              stock: nextStock,
              alwaysAvailable: nextAlways,
              hidden: nextHidden,
            }
          : item
      )
    );
    return { ok: true };
  };

  const deleteMyListing = async (
    productId: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = products.find((item) => item.id === productId);

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("slug", productId)
        .eq("seller_id", authUserId);

      if (error) {
        return {
          ok: false,
          error: error.message.toLowerCase().includes("foreign key")
            ? "Listing sudah memiliki riwayat pesanan COD sehingga tidak dapat dihapus permanen. Gunakan Nonaktifkan."
            : error.message,
        };
      }

      const objectPaths = (target?.uploadedImages ?? [])
        .map((url) => {
          const marker = "/listing-photos/";
          const idx = url.indexOf(marker);
          return idx >= 0 ? url.slice(idx + marker.length).split("?")[0] : "";
        })
        .filter(Boolean);
      if (objectPaths.length > 0) {
        await supabase.storage.from("listing-photos").remove(objectPaths);
      }

      await refreshSupabaseData();
      return { ok: true };
    }

    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setMyListingIds((prev) => prev.filter((id) => id !== productId));
    return { ok: true };
  };

  const toggleListingStockZero = async (
    productId: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = products.find((item) => item.id === productId);
    if (!target) return { ok: false, error: "Listing tidak ditemukan." };
    const nextStockValue = target.stock > 0 ? 0 : 1;

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({
          always_available: false,
          stock: nextStockValue,
          status: nextStockValue <= 0 ? "Terjual" : "Aktif",
        })
        .eq("slug", productId)
        .eq("seller_id", authUserId);

      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              alwaysAvailable: false,
              stock: nextStockValue,
            }
          : item
      )
    );
    return { ok: true };
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

  const approveKtm = async (
    queueId: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const item = ktmQueue.find((q) => q.id === queueId);

    if (authUserId && item?.dbId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.rpc("review_ktm_request", {
        p_verification_id: item.dbId,
        p_decision: "Terverifikasi",
      });
      if (error) {
        return { ok: false, error: error.message };
      }
      await deleteApprovedKtmObjectAction(item.photoLabel);
      await refreshSupabaseData();
      return { ok: true };
    }

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
    return { ok: true };
  };

  const rejectKtm = async (
    queueId: string,
    reason: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const item = ktmQueue.find((q) => q.id === queueId);

    if (authUserId && item?.dbId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.rpc("review_ktm_request", {
        p_verification_id: item.dbId,
        p_decision: "Ditolak",
        p_reason: reason,
      });
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

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
    return { ok: true };
  };

  const submitReport = async (input: {
    targetType: ReportItem["targetType"];
    targetId: string;
    targetTitle: string;
    reason: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.from("reports").insert({
        reporter_id: authUserId,
        target_type: input.targetType,
        target_id: input.targetId,
        target_title: input.targetTitle,
        reason: input.reason,
      });
      if (error) {
        return {
          ok: false,
          error:
            "Laporan hanya dapat dikirim oleh akun Terverifikasi KTM (" +
            error.message +
            ").",
        };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

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
    return { ok: true };
  };

  const resolveReport = async (
    reportId: string,
    action: "hide" | "dismiss"
  ): Promise<{ ok: boolean; error?: string }> => {
    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) return { ok: false, error: "Laporan tidak ditemukan." };

    if (authUserId && targetReport.dbId && isSupabaseConfigured()) {
      const supabase = createClient();
      if (action === "hide" && targetReport.targetType === "Listing") {
        await supabase
          .from("listings")
          .update({ status: "Disembunyikan" })
          .eq("slug", targetReport.targetId);
      }
      const { error } = await supabase
        .from("reports")
        .update({ status: action === "hide" ? "Disembunyikan" : "Selesai" })
        .eq("id", targetReport.dbId);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

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
    return { ok: true };
  };

  const toggleCodSpot = async (
    spotId: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const currentSpot = codSpots.find((s) => s.id === spotId);
    if (!currentSpot) return { ok: false, error: "Spot COD tidak ditemukan." };

    if (authUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from("cod_spots")
        .update({ active: !currentSpot.active })
        .eq("id", spotId);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshSupabaseData();
      return { ok: true };
    }

    setCodSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, active: !s.active } : s))
    );
    return { ok: true };
  };

  const addCodSpot = async (input: {
    name: string;
    location: string;
    hours: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (authUserId && isSupabaseConfigured()) {
      const res = await addCodSpotAction(input);
      if (!res.ok) return res;
      await refreshSupabaseData();
      return { ok: true };
    }

    const cleanName = input.name.trim();
    const cleanLoc = input.location.trim();
    const cleanHours = input.hours.trim();
    if (cleanName.length < 3 || cleanLoc.length < 3 || cleanHours.length < 3) {
      return {
        ok: false,
        error: "Isi nama spot, lokasi detail, dan jam layanan minimal 3 karakter.",
      };
    }
    const id = `spot-${Date.now().toString(36)}`;
    setCodSpots((prev) => [
      ...prev,
      { id, name: cleanName, location: cleanLoc, hours: cleanHours, active: true },
    ]);
    return { ok: true };
  };

  const toggleCategoryActive = async (
    slug: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = categoryRefs.find((c) => c.slug === slug);
    if (!target) return { ok: false, error: "Kategori tidak ditemukan." };

    if (authUserId && isSupabaseConfigured()) {
      const res = await toggleCategoryActiveAction(slug, !target.active);
      if (!res.ok) return res;
      await refreshSupabaseData();
      return { ok: true };
    }

    setCategoryRefs((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, active: !c.active } : c))
    );
    return { ok: true };
  };

  const toggleUserUmkm = async (
    userId: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = adminUsers.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "Akun pengguna tidak ditemukan." };

    if (authUserId && isSupabaseConfigured()) {
      const res = await toggleUserUmkmAction(userId, !target.isUmkm);
      if (!res.ok) return res;
      await refreshSupabaseData();
      return { ok: true };
    }

    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isUmkm: !u.isUmkm } : u))
    );
    return { ok: true };
  };

  const toggleUserSuspended = async (
    userId: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const target = adminUsers.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "Akun pengguna tidak ditemukan." };

    if (authUserId && isSupabaseConfigured()) {
      const res = await toggleUserSuspendedAction(userId, !target.isSuspended);
      if (!res.ok) return res;
      await refreshSupabaseData();
      return { ok: true };
    }

    setAdminUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u
      )
    );
    return { ok: true };
  };

  const runMaintenance = async (): Promise<{
    ok: boolean;
    summary?: MaintenanceSummary;
    error?: string;
  }> => {
    if (authUserId && isSupabaseConfigured()) {
      const res = await runAdminMaintenanceAction();
      if (!res.ok) return res;
      await refreshSupabaseData();
      return res;
    }

    return {
      ok: true,
      summary: {
        expiredOrders: 0,
        completedOrders: 0,
        deletedRejectedKtmFiles: 0,
      },
    };
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
    addCodSpot,
    categoryRefs,
    toggleCategoryActive,
    adminUsers,
    toggleUserUmkm,
    toggleUserSuspended,
    runMaintenance,
    locale,
    toggleLocale,
    resolvedTheme,
    themePreference,
    toggleTheme,
    resetThemeToSystem,
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
