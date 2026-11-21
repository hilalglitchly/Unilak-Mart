import type { Database } from "./database.types";
import {
  formatRupiah,
  type AdminUserItem,
  type CategoryRefItem,
  type CodSpotItem,
  type IllustrationType,
  type ItemCondition,
  type KtmQueueItem,
  type KtmStatus,
  type NotificationItem,
  type OrderItem,
  type OrderStatus,
  type ProductItem,
  type ProductReview,
  type ReportItem,
  type UserProfile,
} from "@/lib/preview-data";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
type PublicProfileRow = Database["public"]["Tables"]["public_profiles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CodSpotRow = Database["public"]["Tables"]["cod_spots"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type KtmVerifRow = Database["public"]["Tables"]["ktm_verifications"]["Row"];
type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export function mapCardBgClass(raw: string): string {
  if (raw.startsWith("bg-")) return raw;
  const upper = raw.toUpperCase();
  if (upper === "#FEF9C3" || upper === "#FEF08A") return "bg-[#FEF08A]";
  if (upper === "#15803D") return "bg-[#15803D]";
  return "bg-[#DCFCE7]";
}

export function mapDbCodSpot(row: CodSpotRow): CodSpotItem {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    hours: row.hours,
    active: row.active,
  };
}

export function mapDbReview(
  row: ReviewRow,
  publicProfiles: Map<string, PublicProfileRow>
): ProductReview {
  return {
    id: String(row.id),
    authorLabel:
      publicProfiles.get(row.reviewer_id)?.display_name ?? "Mahasiswa Unilak",
    rating: row.rating,
    comment: row.comment || "Transaksi COD berjalan lancar.",
    createdAt: new Date(row.created_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

export function mapDbListingToProduct(
  row: ListingRow,
  publicProfiles: Map<string, PublicProfileRow>,
  spotNameById: Map<string, string>,
  reviews?: ProductReview[]
): ProductItem {
  const seller = row.seller_id ? publicProfiles.get(row.seller_id) : undefined;
  const codSpotsFromIds = row.cod_spot_ids
    .map((id) => spotNameById.get(id))
    .filter((v): v is string => Boolean(v));
  const codSpots =
    codSpotsFromIds.length > 0
      ? codSpotsFromIds
      : row.seed_cod_spot_labels.length > 0
        ? row.seed_cod_spot_labels
        : ["Perpustakaan Pusat Unilak"];

  return {
    id: row.slug,
    dbId: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    priceLabel: formatRupiah(row.price),
    condition: row.condition as ItemCondition,
    stock: row.stock,
    alwaysAvailable: row.always_available,
    codSpots,
    faculty: row.faculty,
    sellerName:
      seller?.display_name || row.seed_seller_name || "Mahasiswa Unilak",
    sellerProdi: seller?.unit_or_prodi || row.seed_seller_prodi || "",
    sellerVerified: seller ? seller.verified : row.seller_id === null,
    sellerWa: "",
    badge:
      row.badge ||
      (row.is_umkm
        ? "UMKM"
        : row.price === 0
          ? "Gratis Rp0"
          : row.condition),
    badgeTone: row.badge_tone === "yellow" ? "yellow" : "green",
    cardBg: mapCardBgClass(row.card_bg),
    category: row.category as ProductItem["category"],
    isUmkm: row.is_umkm,
    illustration: (row.illustration || "bag") as IllustrationType,
    uploadedImages: row.photos,
    createdAt: row.created_at,
    hidden: row.status === "Nonaktif" || row.status === "Disembunyikan",
    reviews: reviews ?? [],
  };
}

export function mapDbProfileToUserProfile(row: ProfileRow): UserProfile {
  return {
    nim: row.identifier_number ?? (row.deleted_at ? "ANONIM" : ""),
    name: row.name,
    prodi: row.unit_or_prodi,
    faculty: row.faculty || "Fasilkom",
    email: row.email,
    wa: row.wa,
    pdpConsent: row.pdp_consent,
    isUmkm: row.is_umkm,
    ktmStatus: row.ktm_status as KtmStatus,
    ktmReason: row.ktm_reason ?? undefined,
    ktmPhotoName: row.ktm_photo_path ?? undefined,
    systemRole: row.system_role === "admin" ? "admin" : "user",
    deletedAt: row.deleted_at ?? undefined,
  };
}

export function mapDbOrder(
  row: OrderRow,
  listingSlugById: Map<number, string>,
  publicProfiles: Map<string, PublicProfileRow>,
  counterpartyWa: string,
  userReview?: ReviewRow
): OrderItem {
  return {
    id: String(row.id),
    dbId: row.id,
    listingDbId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    code: row.code,
    productId: listingSlugById.get(row.listing_id) ?? String(row.listing_id),
    productTitle: row.listing_title,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    codSpot: row.cod_spot_name,
    proposedTime: row.proposed_time,
    note: row.note,
    status: row.status as OrderStatus,
    cancelReason: row.cancel_reason ?? undefined,
    sellerLabel:
      publicProfiles.get(row.seller_id)?.display_name ?? "Penjual Unilak",
    sellerWa: counterpartyWa,
    buyerLabel:
      publicProfiles.get(row.buyer_id)?.display_name ?? "Pembeli Unilak",
    createdAt: row.created_at,
    ratingSubmitted: userReview?.rating,
    reviewComment: userReview?.comment,
  };
}

export function mapDbKtmQueueItem(
  row: KtmVerifRow,
  publicProfiles: Map<string, PublicProfileRow>
): KtmQueueItem {
  const person = publicProfiles.get(row.user_id);
  return {
    id: String(row.id),
    dbId: row.id,
    nim: row.identifier_number,
    name: person?.display_name ?? `NIM ${row.identifier_number}`,
    prodi: person?.unit_or_prodi ?? "-",
    faculty: person?.faculty ?? "-",
    submittedAt: new Date(row.created_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    photoLabel: row.photo_path,
    status: row.status as KtmQueueItem["status"],
    rejectionReason: row.rejection_reason ?? undefined,
    photoDeletedNote: row.photo_deleted_at
      ? "Foto KTM sudah dihapus otomatis dari bucket privat."
      : undefined,
  };
}

export function mapDbReport(row: ReportRow): ReportItem {
  return {
    id: String(row.id),
    dbId: row.id,
    targetType: row.target_type as ReportItem["targetType"],
    targetId: row.target_id,
    targetTitle: row.target_title,
    reason: row.reason,
    status: row.status as ReportItem["status"],
    createdAt: new Date(row.created_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function mapDbNotification(row: NotificationRow): NotificationItem {
  return {
    id: String(row.id),
    title: row.title,
    message: row.message,
    href: row.href,
    read: row.read,
    timestamp: new Date(row.created_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function mapDbAdminUser(row: ProfileRow): AdminUserItem {
  return {
    id: row.id,
    nim: row.identifier_number ?? (row.deleted_at ? "ANONIM" : "-"),
    name: row.name,
    prodi: row.unit_or_prodi,
    faculty: row.faculty || "-",
    email: row.email,
    ktmStatus: row.ktm_status as KtmStatus,
    isUmkm: row.is_umkm,
    isSuspended: row.is_suspended,
    systemRole: row.system_role === "admin" ? "admin" : "user",
    deletedAt: row.deleted_at ?? undefined,
  };
}

export function mapDbCategoryRef(row: CategoryRow): CategoryRefItem {
  return {
    slug: row.slug,
    name: row.name,
    active: row.active,
  };
}
