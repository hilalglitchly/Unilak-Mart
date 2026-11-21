"use server";

import {
  runMarketplaceMaintenance,
  type MaintenanceSummary,
} from "@/lib/marketplace-maintenance";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function assertAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Sesi tidak ditemukan." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("system_role, deleted_at, is_suspended")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.system_role !== "admin" ||
    profile.deleted_at ||
    profile.is_suspended
  ) {
    return { ok: false as const, error: "Akses khusus Administrator." };
  }

  return {
    ok: true as const,
    userId: user.id,
    supabase,
    admin: createAdminClient(),
  };
}

export async function getAdminKtmSignedUrlAction(
  photoPath: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };

  const client = auth.admin ?? auth.supabase;
  const { data, error } = await client.storage
    .from("ktm-documents")
    .createSignedUrl(photoPath, 120);

  if (error || !data?.signedUrl) {
    return {
      ok: false,
      error: error?.message ?? "Foto KTM tidak ditemukan atau sudah dihapus.",
    };
  }
  return { ok: true, url: data.signedUrl };
}

export async function deleteApprovedKtmObjectAction(
  photoPath: string
): Promise<{ ok: boolean; error?: string }> {
  if (!photoPath.includes("/")) {
    return { ok: true };
  }
  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };

  const client = auth.admin ?? auth.supabase;
  const { error } = await client.storage
    .from("ktm-documents")
    .remove([photoPath]);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function toggleUserUmkmAction(
  targetUserId: string,
  nextUmkm: boolean
): Promise<{ ok: boolean; error?: string }> {
  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };

  const client = auth.admin ?? auth.supabase;
  const { error } = await client
    .from("profiles")
    .update({ is_umkm: nextUmkm })
    .eq("id", targetUserId);
  if (error) return { ok: false, error: error.message };

  if (auth.admin) {
    await auth.admin.from("notifications").insert({
      user_id: targetUserId,
      title: nextUmkm ? "Akun Resmi Penjual UMKM Aktif" : "Status Penjual UMKM Dinonaktifkan",
      message: nextUmkm
        ? "Admin menandai akun Anda sebagai Penjual UMKM untuk Etalase UMKM dan kuota listing lebih longgar."
        : "Status penjual UMKM akun Anda dicabut sementara oleh Administrator.",
      href: "/profil",
    });
  }

  return { ok: true };
}

export async function toggleUserSuspendedAction(
  targetUserId: string,
  nextSuspended: boolean
): Promise<{ ok: boolean; error?: string }> {
  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (targetUserId === auth.userId && nextSuspended) {
    return {
      ok: false,
      error: "Tidak dapat menangguhkan akun Administrator yang sedang aktif.",
    };
  }

  const client = auth.admin ?? auth.supabase;
  const { error } = await client
    .from("profiles")
    .update({ is_suspended: nextSuspended })
    .eq("id", targetUserId);
  if (error) return { ok: false, error: error.message };

  if (nextSuspended) {
    await client
      .from("listings")
      .update({ status: "Disembunyikan" })
      .eq("seller_id", targetUserId)
      .eq("status", "Aktif");
  }

  if (auth.admin) {
    await auth.admin.from("notifications").insert({
      user_id: targetUserId,
      title: nextSuspended ? "Akun Ditangguhkan Sementara" : "Akun Diaktifkan Kembali",
      message: nextSuspended
        ? "Akun Anda ditangguhkan oleh Administrator karena pelanggaran atau laporan kendala COD."
        : "Penangguhan akun Anda telah dibuka oleh Administrator.",
      href: "/profil",
    });
  }

  return { ok: true };
}

export async function addCodSpotAction(input: {
  name: string;
  location: string;
  hours: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cleanName = input.name.trim();
  const cleanLoc = input.location.trim();
  const cleanHours = input.hours.trim();
  if (cleanName.length < 3 || cleanLoc.length < 3 || cleanHours.length < 3) {
    return {
      ok: false,
      error: "Isi nama spot, lokasi detail, dan jam layanan minimal 3 karakter.",
    };
  }

  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
  const spotId = `${slug || "spot"}-${Date.now().toString(36).slice(-4)}`;

  const client = auth.admin ?? auth.supabase;
  const { count } = await client
    .from("cod_spots")
    .select("*", { count: "exact", head: true });

  const { error } = await client.from("cod_spots").insert({
    id: spotId,
    name: cleanName,
    location: cleanLoc,
    hours: cleanHours,
    active: true,
    sort_order: (count ?? 6) + 1,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function toggleCategoryActiveAction(
  slug: string,
  nextActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };

  const client = auth.admin ?? auth.supabase;
  const { error } = await client
    .from("categories")
    .update({ active: nextActive })
    .eq("slug", slug);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function runAdminMaintenanceAction(): Promise<{
  ok: boolean;
  summary?: MaintenanceSummary;
  error?: string;
}> {
  const auth = await assertAdminCaller();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!auth.admin) {
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY diperlukan di server untuk pemeliharaan.",
    };
  }

  try {
    const summary = await runMarketplaceMaintenance(auth.admin);
    return { ok: true, summary };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Pemeliharaan otomatis gagal.",
    };
  }
}
