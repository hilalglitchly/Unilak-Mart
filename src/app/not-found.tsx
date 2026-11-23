import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="konten-utama"
      className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:py-16"
    >
      <section className="w-full rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-7 text-center shadow-[5px_5px_0px_#111827] sm:p-10">
        <span className="inline-flex items-center rounded-full border-2 border-[#111827] bg-[#FACC15] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-[#111827]">
          Error 404
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Halaman atau Barang Tidak Ditemukan
        </h1>
        <p className="mx-auto mt-2.5 max-w-lg text-sm font-medium leading-relaxed text-[#334155]">
          Tautan yang Anda buka mungkin sudah kedaluwarsa, barang sudah terjual
          atau dihapus oleh penjual, atau alamat halaman salah ketik.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-[#15803D] px-5 text-sm font-extrabold text-white shadow-[3px_3px_0px_#111827] hover:bg-[#166534] active:translate-x-[1px] active:translate-y-[1px]"
          >
            Kembali ke Katalog
          </Link>
          <Link
            href="/jual"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#111827] bg-white px-5 text-sm font-extrabold text-[#111827] hover:bg-[#FEF9C3]"
          >
            + Pasang Listing
          </Link>
        </div>
      </section>
    </main>
  );
}
