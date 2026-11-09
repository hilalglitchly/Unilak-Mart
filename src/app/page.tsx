export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-12 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">UnilakMart</h1>
      <p className="text-base text-muted-foreground">
        Pondasi aplikasi web MVP Rilis 1 untuk mahasiswa Universitas Lancang
        Kuning telah siap (Next.js App Router, Tailwind CSS, shadcn/ui, dan
        klien Supabase).
      </p>
      <p className="text-sm text-muted-foreground">
        Tahap berikutnya: hubungkan proyek Supabase dan Vercel melalui variabel
        lingkungan pada <code>.env.local</code>, lalu lanjutkan implementasi
        skema database dan fitur Rilis 1.
      </p>
    </main>
  );
}
