import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const flow = searchParams.get("flow");
  const rawNext = searchParams.get("next") ?? "/profil";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/profil";

  const parsedNext = new URL(next, request.url);
  const redirectTo = request.nextUrl.clone();
  const buildSuccessRedirect = (isRecovery: boolean) => {
    redirectTo.pathname = parsedNext.pathname;
    redirectTo.search = parsedNext.search;
    if (isRecovery && parsedNext.pathname === "/profil") {
      redirectTo.searchParams.set("mode", "reset-sandi");
      redirectTo.hash = "ubah-sandi";
    }
    return NextResponse.redirect(redirectTo);
  };
  redirectTo.search = "";

  try {
    const supabase = await createClient();

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });
      if (!error) {
        return buildSuccessRedirect(type === "recovery" || flow === "recovery");
      }
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return buildSuccessRedirect(flow === "recovery");
      }
    }
  } catch {
    // Biarkan jatuh ke halaman masuk dengan penanda galat verifikasi
  }

  redirectTo.pathname = "/masuk";
  redirectTo.searchParams.set("verif", "gagal");
  return NextResponse.redirect(redirectTo);
}
