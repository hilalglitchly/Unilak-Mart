"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

const NEUTRAL_LOGIN_ERROR =
  "NIM/email atau kata sandi salah, atau email akun belum diverifikasi.";

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export async function signInWithIdentifierAction(input: {
  identifier: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const clean = input.identifier.trim();
  const password = input.password;

  if (!clean) {
    return { ok: false, error: "Masukkan NIM atau alamat email aktif Anda." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Kata sandi minimal 6 karakter." };
  }

  let resolvedEmail = clean;

  if (!clean.includes("@")) {
    const admin = createAdminClient();
    if (!admin) {
      return {
        ok: false,
        error:
          "Login memakai NIM memerlukan SUPABASE_SERVICE_ROLE_KEY di server (.env.local). Silakan masuk memakai alamat email terdaftar terlebih dahulu.",
      };
    }

    const { data } = await admin
      .from("profiles")
      .select("email")
      .ilike("identifier_number", clean)
      .is("deleted_at", null)
      .eq("is_suspended", false)
      .maybeSingle();

    if (!data?.email) {
      return { ok: false, error: NEUTRAL_LOGIN_ERROR };
    }
    resolvedEmail = data.email;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    if (error) {
      return { ok: false, error: NEUTRAL_LOGIN_ERROR };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Layanan autentikasi Supabase sedang tidak dapat dihubungi.",
    };
  }
}

export async function signUpStudentAction(input: {
  nim: string;
  name: string;
  faculty: string;
  prodi: string;
  email: string;
  wa: string;
  password: string;
  pdpConsent: boolean;
}): Promise<{ ok: boolean; error?: string; needsEmailConfirm?: boolean }> {
  const cleanNim = input.nim.trim();
  const cleanName = input.name.trim();
  const cleanProdi = input.prodi.trim();
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanWa = input.wa.trim();

  if (!/^\d{8,14}$/.test(cleanNim)) {
    return {
      ok: false,
      error: "NIM mahasiswa harus berisi 8 sampai 14 digit angka.",
    };
  }
  if (cleanName.length < 3 || !cleanProdi) {
    return {
      ok: false,
      error: "Lengkapi nama lengkap dan program studi sesuai KTM.",
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      ok: false,
      error: "Masukkan format alamat email aktif yang valid untuk verifikasi.",
    };
  }
  if (cleanWa.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Masukkan nomor WhatsApp aktif minimal 10 digit." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Kata sandi pendaftaran minimal 8 karakter." };
  }
  if (!input.pdpConsent) {
    return {
      ok: false,
      error:
        "Persetujuan UU PDP wajib dicentang sebelum mendaftar di UnilakMart.",
    };
  }

  const admin = createAdminClient();
  if (admin) {
    const { data: existingNim } = await admin
      .from("profiles")
      .select("id")
      .eq("identifier_number", cleanNim)
      .maybeSingle();

    if (existingNim) {
      return {
        ok: false,
        error:
          "NIM ini sudah dipakai pada akun lain. Satu NIM hanya diperbolehkan untuk satu akun.",
      };
    }
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: input.password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/profil`,
        data: {
          identifier_number: cleanNim,
          name: cleanName,
          faculty: input.faculty,
          unit_or_prodi: cleanProdi,
          wa: cleanWa,
          pdp_consent: true,
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("database error saving new user")) {
        return {
          ok: false,
          error:
            "NIM ini sudah dipakai pada akun lain. Satu NIM hanya diperbolehkan untuk satu akun.",
        };
      }
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        return {
          ok: false,
          error: "Alamat email ini sudah terdaftar. Silakan masuk atau atur ulang kata sandi.",
        };
      }
      if (msg.includes("rate limit")) {
        return {
          ok: false,
          error:
            "Batas pengiriman email sementara pada proyek Free tercapai. Coba lagi beberapa saat atau pasang Custom SMTP.",
        };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true, needsEmailConfirm: !data.session };
  } catch {
    return {
      ok: false,
      error: "Gagal menghubungi server Supabase Auth saat mendaftar.",
    };
  }
}

export async function resetPasswordAction(input: {
  identifier: string;
}): Promise<{ ok: boolean; error?: string }> {
  const clean = input.identifier.trim();
  if (!clean) {
    return {
      ok: false,
      error: "Masukkan NIM atau email akun Anda terlebih dahulu.",
    };
  }

  let targetEmail: string | null = clean.includes("@") ? clean.toLowerCase() : null;
  if (!targetEmail) {
    const admin = createAdminClient();
    if (admin) {
      const { data } = await admin
        .from("profiles")
        .select("email")
        .ilike("identifier_number", clean)
        .is("deleted_at", null)
        .eq("is_suspended", false)
        .maybeSingle();
      targetEmail = data?.email ?? null;
    }
  }

  if (targetEmail) {
    try {
      const supabase = await createClient();
      await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${getSiteUrl()}/auth/confirm?next=/profil`,
      });
    } catch {
      // Tetap kembalikan hasil netral agar status NIM/email tidak bocor
    }
  }

  return { ok: true };
}

export async function signOutAction(): Promise<{ ok: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika tidak ada sesi aktif
  }
  return { ok: true };
}
