import type { Database } from "./database.types";
import {
  formatRupiah,
  type CodSpotItem,
  type IllustrationType,
  type ItemCondition,
  type KtmStatus,
  type NotificationItem,
  type ProductItem,
  type UserProfile,
} from "@/lib/preview-data";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
type PublicProfileRow = Database["public"]["Tables"]["public_profiles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CodSpotRow = Database["public"]["Tables"]["cod_spots"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

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

export function mapDbListingToProduct(
  row: ListingRow,
  publicProfiles: Map<string, PublicProfileRow>,
  spotNameById: Map<string, string>
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
    deletedAt: row.deleted_at ?? undefined,
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
