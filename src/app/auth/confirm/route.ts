import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/profil";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/profil";

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = "";

  try {
    const supabase = await createClient();

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });
      if (!error) {
        redirectTo.pathname = next;
        if (type === "recovery" && next === "/profil") {
          redirectTo.searchParams.set("mode", "reset-sandi");
          redirectTo.hash = "ubah-sandi";
        }
        return NextResponse.redirect(redirectTo);
      }
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        redirectTo.pathname = next;
        return NextResponse.redirect(redirectTo);
      }
    }
  } catch {
    // Biarkan jatuh ke halaman masuk dengan penanda galat verifikasi
  }

  redirectTo.pathname = "/masuk";
  redirectTo.searchParams.set("verif", "gagal");
  return NextResponse.redirect(redirectTo);
}
