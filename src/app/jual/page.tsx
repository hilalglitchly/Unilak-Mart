"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";
import {
  CONDITIONS,
  FACULTIES,
  type ItemCondition,
  type ProductItem,
} from "@/lib/preview-data";

const LISTING_CATEGORIES: { id: ProductItem["category"]; label: string }[] = [
  { id: "buku", label: "Buku & Modul" },
  { id: "elektronik", label: "Elektronik" },
  { id: "kos", label: "Perabot Kos" },
  { id: "pakaian", label: "Pakaian" },
  { id: "produk-umkm", label: "Produk UMKM" },
  { id: "jasa", label: "Jasa (Desain, Pemrograman, Les)" },
  { id: "jajanan", label: "Jajanan Kampus" },
];

export default function JualPage() {
  const { addListing, codSpots, profile } = useMarketplace();
  const activeSpots = codSpots.filter((s) => s.active);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductItem["category"]>("buku");
  const [faculty, setFaculty] = useState<string>(profile.faculty || "Fasilkom");
  const [condition, setCondition] = useState<ItemCondition>("Bekas Seperti Baru");
  const [isFree, setIsFree] = useState(false);
  const [priceText, setPriceText] = useState("");
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);
  const [stock, setStock] = useState(1);
  const [isUmkm, setIsUmkm] = useState(false);
  const [selectedSpots, setSelectedSpots] = useState<string[]>(() =>
    activeSpots.map((s) => s.name)
  );

  const [compressedImages, setCompressedImages] = useState<
    { url: string; originalKb: number; compressedKb: number; name: string }[]
  >([]);
  const [compressing, setCompressing] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [formError, setFormError] = useState("");
  const [createdListingId, setCreatedListingId] = useState("");

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = Math.max(0, 5 - compressedImages.length);
    if (remaining === 0) {
      setPhotoError("Maksimal 5 foto per listing (FR-09).");
      return;
    }

    setPhotoError("");
    setCompressing(true);

    try {
      const batch = files.slice(0, remaining);
      const processed: {
        url: string;
        originalKb: number;
        compressedKb: number;
        name: string;
      }[] = [];

      for (const file of batch) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.25,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
        const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
        processed.push({
          url: dataUrl,
          originalKb: Math.max(1, Math.round(file.size / 1024)),
          compressedKb: Math.max(1, Math.round(compressed.size / 1024)),
          name: file.name,
        });
      }

      setCompressedImages((prev) => [...prev, ...processed].slice(0, 5));
    } catch {
      setPhotoError(
        "Gagal mengompres gambar di browser. Pastikan berkas berformat JPG, PNG, atau WebP."
      );
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  const toggleSpot = (spotName: string) => {
    setSelectedSpots((prev) =>
      prev.includes(spotName)
        ? prev.filter((item) => item !== spotName)
        : [...prev, spotName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.ktmStatus !== "Terverifikasi") {
      setFormError(
        "Akun harus berstatus Terverifikasi KTM untuk menayangkan listing (FR-04). Periksa status di halaman Profil."
      );
      return;
    }
    if (!title.trim() || title.trim().length < 5) {
      setFormError("Judul listing minimal 5 karakter agar mudah dicari mahasiswa.");
      return;
    }
    if (!description.trim()) {
      setFormError("Tambahkan deskripsi singkat kondisi barang atau layanan.");
      return;
    }
    const numericPrice = isFree ? 0 : Number(priceText.replace(/\D/g, ""));
    if (!isFree && (!priceText.trim() || Number.isNaN(numericPrice) || numericPrice < 0)) {
      setFormError("Isi harga nominal yang valid atau centang opsi Gratis Rp0.");
      return;
    }
    if (selectedSpots.length === 0) {
      setFormError("Pilih minimal 1 Spot COD kampus yang Anda layani.");
      return;
    }

    const created = addListing({
      title: title.trim(),
      description: description.trim(),
      price: numericPrice,
      condition,
      stock: alwaysAvailable ? 1 : stock,
      alwaysAvailable,
      category,
      faculty,
      isUmkm,
      codSpots: selectedSpots,
      uploadedImages: compressedImages.map((img) => img.url),
    });

    setFormError("");
    setCreatedListingId(created.id);
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="space-y-2">
        <span className="inline-block rounded-md border-2 border-[#111827] bg-[#FACC15] px-2.5 py-0.5 text-xs font-extrabold text-[#111827]">
          FORM JUAL &lt; 1 MENIT (UI-04)
        </span>
        <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
          Pasang Listing Barang atau Produk UMKM
        </h1>
        <p className="text-sm font-medium text-[#334155]">
          Foto dikompres otomatis di browser sebelum diunggah untuk menghemat kuota.
          Dilarang menjual rokok/vape, miras, barang ilegal, atau jasa joki tugas/skripsi
          (FR-16).
        </p>
      </div>

      {profile.ktmStatus !== "Terverifikasi" && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-4 text-xs font-bold text-[#991B1B]"
        >
          Akun saat ini berstatus <strong>{profile.ktmStatus}</strong>. Selesaikan
          verifikasi KTM di{" "}
          <Link href="/profil" className="underline">
            halaman Profil
          </Link>{" "}
          sebelum menayangkan listing.
        </div>
      )}

      {createdListingId ? (
        <div
          role="status"
          className="space-y-4 rounded-3xl border-[3px] border-[#111827] bg-[#F0FDF4] p-6 shadow-[5px_5px_0px_#111827]"
        >
          <h2 className="text-xl font-extrabold text-[#15803D]">
            Listing Berhasil Diterbitkan (Post-Moderasi R1)!
          </h2>
          <p className="text-sm font-medium text-[#111827]">
            Listing Anda langsung tampil di katalog beranda
            {isUmkm ? " dan masuk Etalase UMKM gratis" : ""}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/listing/${createdListingId}`}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white"
            >
              Buka Halaman Detail Listing
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
            >
              Kembali ke Beranda
            </Link>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setPriceText("");
                setCompressedImages([]);
                setCreatedListingId("");
              }}
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827]"
            >
              Buat Listing Lain
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border-[3px] border-[#111827] bg-white p-5 shadow-[5px_5px_0px_#111827] sm:p-7"
          noValidate
        >
          {/* Upload Maks 5 Foto + Kompresi Browser */}
          <div className="space-y-2">
            <label
              htmlFor="upload-foto-listing"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Foto Barang / UMKM (Maks. 5 Foto, Kompresi Browser NFR-03)
            </label>
            <input
              id="upload-foto-listing"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="block min-h-11 w-full rounded-xl border-2 border-[#111827] bg-[#F8FAFC] p-2 text-sm font-semibold text-[#111827]"
            />
            {compressing && (
              <p role="status" className="text-xs font-bold text-[#15803D]">
                Mengompres gambar di browser...
              </p>
            )}
            {photoError && (
              <p role="alert" className="text-xs font-bold text-[#991B1B]">
                {photoError}
              </p>
            )}
            {compressedImages.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                {compressedImages.map((img, idx) => (
                  <li
                    key={`${img.name}-${idx}`}
                    className="rounded-xl border-2 border-[#111827] bg-[#F0FDF4] p-2"
                  >
                    <Image
                      unoptimized
                      src={img.url}
                      alt={`Pratinjau foto ${idx + 1}`}
                      width={160}
                      height={110}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <p className="mt-1 text-[11px] font-bold text-[#14532D]">
                      {img.originalKb} KB ke {img.compressedKb} KB
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setCompressedImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="mt-1 min-h-11 w-full rounded-lg border border-[#111827] bg-white text-xs font-bold text-[#991B1B]"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label
              htmlFor="judul-listing"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Judul Barang / Jasa <span aria-hidden="true">*</span>
            </label>
            <input
              id="judul-listing"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormError("");
              }}
              placeholder="Contoh: Buku Algoritma & Struktur Data Edisi 2 Mulus"
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="kategori-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Kategori (FR-11)
              </label>
              <select
                id="kategori-listing"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductItem["category"])}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold sm:text-sm"
              >
                {LISTING_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fakultas-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Fakultas Terkait (FR-12)
              </label>
              <select
                id="fakultas-listing"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold sm:text-sm"
              >
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="kondisi-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Kondisi Barang (FR-09)
              </label>
              <select
                id="kondisi-listing"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold sm:text-sm"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="harga-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Harga Rupiah (Mendukung Rp0 Hibah)
              </label>
              <input
                id="harga-listing"
                type="text"
                inputMode="numeric"
                disabled={isFree}
                value={isFree ? "0" : priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="Contoh: 45000"
                className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-bold text-[#111827] disabled:bg-[#E2E8F0] sm:text-sm"
              />
              <label className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#111827]">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="h-5 w-5 accent-[#15803D]"
                />
                <span>Hibah / Gratis (Rp0)</span>
              </label>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="stok-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                Jumlah Stok Tersedia
              </label>
              <input
                id="stok-listing"
                type="number"
                min={1}
                disabled={alwaysAvailable}
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(Math.max(1, Number(e.target.value) || 1))}
                className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-bold text-[#111827] disabled:bg-[#E2E8F0] sm:text-sm"
              />
              <label className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#111827]">
                <input
                  type="checkbox"
                  checked={alwaysAvailable}
                  onChange={(e) => setAlwaysAvailable(e.target.checked)}
                  className="h-5 w-5 accent-[#15803D]"
                />
                <span>Selalu Tersedia (Produk UMKM / Jasa / Jajanan)</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#111827] bg-[#FEF9C3] p-3.5">
            <label className="flex min-h-11 items-start gap-2.5 text-xs font-bold text-[#111827]">
              <input
                type="checkbox"
                checked={isUmkm}
                onChange={(e) => setIsUmkm(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#15803D]"
              />
              <span>
                Tampilkan di <strong>Etalase UMKM Gratis</strong> bagian atas beranda
                (FR-15, khusus produk/jajanan/jasa UMKM mahasiswa)
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="deskripsi-listing"
              className="block text-xs font-extrabold text-[#111827]"
            >
              Deskripsi Kondisi, Kelengkapan &amp; Detail <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="deskripsi-listing"
              rows={3}
              required
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFormError("");
              }}
              placeholder="Jelaskan kondisi nyata barang, minus jika ada, atau jadwal layanan."
              className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          <fieldset className="space-y-2 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-4">
            <legend className="px-1 text-xs font-extrabold text-[#111827]">
              Titik Spot COD Kampus yang Dilayani
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {activeSpots.map((spot) => (
                <label
                  key={spot.id}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-[#111827]/30 bg-white px-3 text-xs font-bold text-[#111827]"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpots.includes(spot.name)}
                    onChange={() => toggleSpot(spot.name)}
                    className="h-5 w-5 shrink-0 accent-[#15803D]"
                  />
                  <span>{spot.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {formError && (
            <div
              role="alert"
              className="rounded-xl border-2 border-[#111827] bg-[#FEF2F2] p-3 text-xs font-bold text-[#991B1B]"
            >
              Perhatian: {formError}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-5 py-2 text-xs font-bold text-[#111827]"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#111827] hover:bg-[#166534]"
            >
              Terbitkan Listing Sekarang
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
