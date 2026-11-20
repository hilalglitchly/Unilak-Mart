"use server";

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

  return { ok: true as const, supabase, admin: createAdminClient() };
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
