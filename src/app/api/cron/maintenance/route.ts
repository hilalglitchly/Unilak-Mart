import { NextRequest, NextResponse } from "next/server";
import { runMarketplaceMaintenance } from "@/lib/marketplace-maintenance";
import { createAdminClient } from "@/lib/supabase/server";

async function handleMaintenanceRequest(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!expectedSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET belum dikonfigurasi pada environment produksi." },
      { status: 500 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diatur." },
      { status: 500 }
    );
  }

  try {
    const summary = await runMarketplaceMaintenance(admin);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Pemeliharaan gagal.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleMaintenanceRequest(request);
}

export async function POST(request: NextRequest) {
  return handleMaintenanceRequest(request);
}
