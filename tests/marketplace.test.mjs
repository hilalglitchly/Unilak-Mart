import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  EDITABLE_LISTING_CATEGORIES,
  EN_CATEGORY_LABELS,
  INITIAL_COD_SPOTS,
  SAMPLE_PRODUCTS,
  buildWhatsAppUrl,
  formatRupiah,
  getDisplayLabel,
} from "../src/lib/preview-data.ts";
import { runMarketplaceMaintenance } from "../src/lib/marketplace-maintenance.ts";

const ROOT = process.cwd();

test("formatRupiah formats zero and positive IDR values in ID and EN locales", () => {
  assert.equal(formatRupiah(0), "Rp 0 (Gratis)");
  assert.equal(formatRupiah(0, "en"), "Rp 0 (Free)");
  assert.match(formatRupiah(45000), /^Rp\s*45\.000$/);
});

test("buildWhatsAppUrl normalizes local Indonesian numbers and encodes order details", () => {
  const url = buildWhatsAppUrl("0812-0000-1199", "UM-101", "Kalkulus Dasar");
  assert.match(url, /^https:\/\/wa\.me\/6281200001199\?text=/);
  assert.match(url, /UM-101/);
  assert.match(url, /Kalkulus%20Dasar/);
});

test("editable listing categories exclude 'semua' and preserve label parity", () => {
  assert.ok(!EDITABLE_LISTING_CATEGORIES.some((cat) => cat.id === "semua"));
  assert.ok(EDITABLE_LISTING_CATEGORIES.length >= 6);
  for (const cat of EDITABLE_LISTING_CATEGORIES) {
    assert.ok(EN_CATEGORY_LABELS[cat.id]);
    assert.equal(getDisplayLabel("id", cat.id, EN_CATEGORY_LABELS), cat.id);
    assert.equal(
      getDisplayLabel("en", cat.id, EN_CATEGORY_LABELS),
      EN_CATEGORY_LABELS[cat.id]
    );
  }
  assert.ok(SAMPLE_PRODUCTS.length >= 15);
  assert.ok(INITIAL_COD_SPOTS.some((spot) => spot.active));
});

test("runMarketplaceMaintenance invokes lifecycle RPC and purges overdue rejected KTM files", async () => {
  const removedPaths = [];
  const ktmUpdates = [];
  const profileUpdates = [];

  const mockAdminClient = {
    rpc: async (fnName) => {
      assert.equal(fnName, "run_marketplace_maintenance");
      return {
        data: { expired_orders: 2, completed_orders: 3 },
        error: null,
      };
    },
    from: (table) => {
      if (table === "ktm_verifications") {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                not: () => ({
                  lte: async () => ({
                    data: [
                      {
                        id: "ktm-row-1",
                        user_id: "user-123",
                        photo_path: "user-123/ktm-old.jpg",
                      },
                    ],
                  }),
                }),
              }),
            }),
          }),
          update: (values) => ({
            in: async (_col, ids) => {
              ktmUpdates.push({ values, ids });
              return { error: null };
            },
          }),
        };
      }

      if (table === "profiles") {
        return {
          update: (values) => ({
            eq: () => ({
              eq: async () => {
                profileUpdates.push(values);
                return { error: null };
              },
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from: (bucket) => {
        assert.equal(bucket, "ktm-documents");
        return {
          remove: async (paths) => {
            removedPaths.push(...paths);
            return { error: null };
          },
        };
      },
    },
  };

  const summary = await runMarketplaceMaintenance(mockAdminClient);
  assert.deepEqual(summary, {
    expiredOrders: 2,
    completedOrders: 3,
    deletedRejectedKtmFiles: 1,
  });
  assert.deepEqual(removedPaths, ["user-123/ktm-old.jpg"]);
  assert.equal(ktmUpdates.length, 1);
  assert.equal(profileUpdates.length, 1);
});

test("vercel.json and realtime migration declare production lifecycle and publication settings", () => {
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")
  );
  assert.ok(Array.isArray(vercelConfig.crons));
  assert.ok(
    vercelConfig.crons.some((c) => c.path === "/api/cron/maintenance" && Boolean(c.schedule))
  );

  const realtimeSql = fs.readFileSync(
    path.join(ROOT, "supabase/migrations/20261122000002_enable_realtime.sql"),
    "utf8"
  );
  for (const tbl of ["notifications", "orders", "listings", "ktm_verifications"]) {
    assert.match(realtimeSql, new RegExp(tbl));
  }
});
