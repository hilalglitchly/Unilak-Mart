const AUTH_ROUTES = new Set(["/masuk", "/daftar", "/lupa-sandi"]);

/**
 * Validasi parameter `next` agar hanya mengarah ke path internal aplikasi
 * dan mencegah open redirect atau loop kembali ke halaman autentikasi.
 */
export function resolveSafeRedirectPath(
  rawNext: string | null | undefined,
  fallback = "/"
): string {
  if (!rawNext) return fallback;
  const trimmed = rawNext.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("\\") || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    return fallback;
  }
  const pathnameOnly = trimmed.split(/[?#]/)[0] || "/";
  if (AUTH_ROUTES.has(pathnameOnly)) {
    return fallback;
  }
  return trimmed;
}
