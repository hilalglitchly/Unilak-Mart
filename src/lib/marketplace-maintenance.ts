import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export interface MaintenanceSummary {
  expiredOrders: number;
  completedOrders: number;
  deletedRejectedKtmFiles: number;
}

/**
 * Jalankan pembersihan lifecycle UnilakMart memakai hak service_role:
 * 1) auto-kedaluwarsa 24 jam & auto-selesai 48 jam di Postgres,
 * 2) hapus file foto KTM berstatus Ditolak yang melewati tenggat 7 hari dari bucket privat (NFR-07).
 */
export async function runMarketplaceMaintenance(
  adminClient: SupabaseClient<Database>
): Promise<MaintenanceSummary> {
  let expiredOrders = 0;
  let completedOrders = 0;

  const { data: rpcRes, error: rpcErr } = await adminClient.rpc(
    "run_marketplace_maintenance"
  );
  if (rpcErr) {
    throw new Error(rpcErr.message);
  }
  if (rpcRes && typeof rpcRes === "object" && !Array.isArray(rpcRes)) {
    const obj = rpcRes as Record<string, unknown>;
    expiredOrders = Number(obj.expired_orders ?? 0) || 0;
    completedOrders = Number(obj.completed_orders ?? 0) || 0;
  }

  const nowIso = new Date().toISOString();
  const { data: overdueRows } = await adminClient
    .from("ktm_verifications")
    .select("id, user_id, photo_path")
    .eq("status", "Ditolak")
    .is("photo_deleted_at", null)
    .not("photo_delete_due_at", "is", null)
    .lte("photo_delete_due_at", nowIso);

  let deletedRejectedKtmFiles = 0;
  const targets = overdueRows ?? [];
  if (targets.length > 0) {
    const bucketPaths = targets
      .map((r) => r.photo_path)
      .filter((p) => p.includes("/"));
    if (bucketPaths.length > 0) {
      await adminClient.storage.from("ktm-documents").remove(bucketPaths);
      deletedRejectedKtmFiles = bucketPaths.length;
    }

    const rowIds = targets.map((r) => r.id);
    await adminClient
      .from("ktm_verifications")
      .update({ photo_deleted_at: nowIso })
      .in("id", rowIds);

    for (const row of targets) {
      await adminClient
        .from("profiles")
        .update({ ktm_photo_path: null })
        .eq("id", row.user_id)
        .eq("ktm_photo_path", row.photo_path);
    }
  }

  return {
    expiredOrders,
    completedOrders,
    deletedRejectedKtmFiles,
  };
}
