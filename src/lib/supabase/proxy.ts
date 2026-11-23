import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([k, v]) =>
          supabaseResponse.headers.set(k, v)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const redirectWithCookies = (targetPath: string, nextParam?: string) => {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = targetPath;
      targetUrl.search = "";
      if (nextParam) {
        targetUrl.searchParams.set("next", nextParam);
      }
      const res = NextResponse.redirect(targetUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
      return res;
    };

    if (!user) {
      return redirectWithCookies("/masuk", "/admin");
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
      return redirectWithCookies("/");
    }

    return supabaseResponse;
  }

  // Refresh sesi JWT bila token kedaluwarsa; halaman publik tetap terbuka untuk tamu (FR-04)
  await supabase.auth.getClaims();

  return supabaseResponse;
}
