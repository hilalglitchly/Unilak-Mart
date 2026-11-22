"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { compressListingImages, type CompressedListingImage } from "@/lib/listing-images";
import {
  CONDITIONS,
  EDITABLE_LISTING_CATEGORIES,
  EN_CATEGORY_LABELS,
  EN_CONDITION_LABELS,
  EN_KTM_STATUS_LABELS,
  FACULTIES,
  getDisplayLabel,
  type ItemCondition,
  type ProductItem,
} from "@/lib/preview-data";

export default function JualPage() {
  const { addListing, codSpots, profile, locale } = useMarketplace();
  const isEn = locale === "en";
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

  const [compressedImages, setCompressedImages] = useState<CompressedListingImage[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [formError, setFormError] = useState("");
  const [createdListingId, setCreatedListingId] = useState("");

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = Math.max(0, 5 - compressedImages.length);
    if (remaining === 0) {
      setPhotoError(isEn ? "Maximum 5 photos per listing." : "Maksimal 5 foto per listing.");
      return;
    }

    setPhotoError("");
    setCompressing(true);

    try {
      const processed = await compressListingImages(files, remaining);
      setCompressedImages((prev) => [...prev, ...processed].slice(0, 5));
    } catch {
      setPhotoError(
        isEn
          ? "Failed to compress image in browser. Make sure the file is JPG, PNG, or WebP."
          : "Gagal mengompres gambar di browser. Pastikan berkas berformat JPG, PNG, atau WebP."
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.ktmStatus !== "Terverifikasi") {
      setFormError(
        isEn
          ? "Your account must be KTM Verified before publishing a listing. Check your status in Profile."
          : "Akun harus berstatus Terverifikasi KTM untuk menayangkan listing. Periksa status di halaman Profil."
      );
      return;
    }
    if (!title.trim() || title.trim().length < 5) {
      setFormError(
        isEn
          ? "Listing title must be at least 5 characters so students can easily find it."
          : "Judul listing minimal 5 karakter agar mudah dicari mahasiswa."
      );
      return;
    }
    if (!description.trim()) {
      setFormError(
        isEn
          ? "Add a brief description of the item's condition or service details."
          : "Tambahkan deskripsi singkat kondisi barang atau layanan."
      );
      return;
    }
    const numericPrice = isFree ? 0 : Number(priceText.replace(/\D/g, ""));
    if (!isFree && (!priceText.trim() || Number.isNaN(numericPrice) || numericPrice < 0)) {
      setFormError(
        isEn
          ? "Enter a valid price amount or check the Free Rp0 option."
          : "Isi harga nominal yang valid atau centang opsi Gratis Rp0."
      );
      return;
    }
    if (selectedSpots.length === 0) {
      setFormError(
        isEn
          ? "Select at least 1 campus COD spot you support."
          : "Pilih minimal 1 Spot COD kampus yang Anda layani."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await addListing({
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
        uploadedFiles: compressedImages.map((img) => img.file),
      });

      if (!res.ok || !res.product) {
        setFormError(
          res.error ??
            (isEn ? "Failed to publish new listing." : "Gagal menerbitkan listing baru.")
        );
        return;
      }

      setFormError("");
      setCreatedListingId(res.product.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      id="konten-utama"
      className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
          {isEn ? "Post an Item or UMKM Listing" : "Pasang Listing Barang atau UMKM"}
        </h1>
        <p className="text-sm font-medium text-[#475569]">
          {isEn
            ? "Photos are compressed automatically in your browser. Please avoid prohibited items (cigarettes/vapes, alcohol, or paid assignment writing)."
            : "Foto otomatis dikompres di browser. Pastikan tidak menjual rokok/vape, miras, atau jasa joki tugas kuliah."}
        </p>
      </div>

      {profile.ktmStatus !== "Terverifikasi" && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-[#111827] bg-[#FEF2F2] p-4 text-xs font-bold text-[#991B1B]"
        >
          {isEn ? (
            <>
              Your account status is{" "}
              <strong>{getDisplayLabel(locale, profile.ktmStatus, EN_KTM_STATUS_LABELS)}</strong>.
              Complete KTM verification on your{" "}
              <Link href="/profil" className="underline">
                Profile page
              </Link>{" "}
              before publishing a listing.
            </>
          ) : (
            <>
              Akun saat ini berstatus <strong>{profile.ktmStatus}</strong>. Selesaikan
              verifikasi KTM di{" "}
              <Link href="/profil" className="underline">
                halaman Profil
              </Link>{" "}
              sebelum menayangkan listing.
            </>
          )}
        </div>
      )}

      {createdListingId ? (
        <div
          role="status"
          className="space-y-4 rounded-2xl border-2 border-[#111827] bg-[#F0FDF4] p-6"
        >
          <h2 className="text-xl font-extrabold text-[#15803D]">
            {isEn ? "Listing Published Successfully" : "Listing Berhasil Diterbitkan"}
          </h2>
          <p className="text-sm font-medium text-[#111827]">
            {isEn
              ? `Your listing is now live in the home catalog${isUmkm ? " and featured in the free UMKM Storefront" : ""}.`
              : `Listing Anda langsung tampil di katalog beranda${isUmkm ? " dan masuk Etalase UMKM gratis" : ""}.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/listing/${createdListingId}`}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-5 py-2 text-xs font-bold text-white"
            >
              {isEn ? "Open Listing Detail" : "Buka Halaman Detail Listing"}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-4 py-2 text-xs font-bold text-[#111827]"
            >
              {isEn ? "Back to Home" : "Kembali ke Beranda"}
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
              {isEn ? "Create Another Listing" : "Buat Listing Lain"}
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border-2 border-[#111827] bg-white p-5 sm:p-7"
          noValidate
        >
          {/* Upload Maks 5 Foto + Kompresi Browser */}
          <div className="space-y-2">
            <label
              htmlFor="upload-foto-listing"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn ? "Item / UMKM Photos (Max 5 Photos)" : "Foto Barang / UMKM (Maks. 5 Foto)"}
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
                {isEn ? "Compressing images in browser..." : "Mengompres gambar di browser..."}
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
                      alt={isEn ? `Photo preview ${idx + 1}` : `Pratinjau foto ${idx + 1}`}
                      width={160}
                      height={110}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <p className="mt-1 text-[11px] font-bold text-[#14532D]">
                      {img.originalKb} KB {isEn ? "to" : "ke"} {img.compressedKb} KB
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setCompressedImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="mt-1 min-h-11 w-full rounded-lg border border-[#111827] bg-white text-xs font-bold text-[#991B1B]"
                    >
                      {isEn ? "Remove" : "Hapus"}
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
              {isEn ? "Item / Service Title" : "Judul Barang / Jasa"}{" "}
              <span aria-hidden="true">*</span>
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
              placeholder={
                isEn
                  ? "Example: Algorithms & Data Structures Textbook 2nd Ed"
                  : "Contoh: Buku Algoritma & Struktur Data Edisi 2 Mulus"
              }
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="kategori-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Category" : "Kategori"}
              </label>
              <select
                id="kategori-listing"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductItem["category"])}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold sm:text-sm"
              >
                {EDITABLE_LISTING_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isEn ? EN_CATEGORY_LABELS[c.id] : c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fakultas-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Related Faculty" : "Fakultas Terkait"}
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
                {isEn ? "Item Condition" : "Kondisi Barang"}
              </label>
              <select
                id="kondisi-listing"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 text-base font-semibold sm:text-sm"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {getDisplayLabel(locale, cond, EN_CONDITION_LABELS)}
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
                {isEn ? "Price in IDR (Supports Free Rp0)" : "Harga Rupiah (Mendukung Rp0 Hibah)"}
              </label>
              <input
                id="harga-listing"
                type="text"
                inputMode="numeric"
                disabled={isFree}
                value={isFree ? "0" : priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder={isEn ? "Example: 45000" : "Contoh: 45000"}
                className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-bold text-[#111827] disabled:bg-[#E2E8F0] sm:text-sm"
              />
              <label className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#111827]">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="h-5 w-5 accent-[#15803D]"
                />
                <span>{isEn ? "Giveaway / Free (Rp0)" : "Hibah / Gratis (Rp0)"}</span>
              </label>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="stok-listing"
                className="block text-xs font-extrabold text-[#111827]"
              >
                {isEn ? "Available Stock" : "Jumlah Stok Tersedia"}
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
                <span>
                  {isEn
                    ? "Always Available (UMKM / Service / Snacks)"
                    : "Selalu Tersedia (Produk UMKM / Jasa / Jajanan)"}
                </span>
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
                {isEn ? (
                  <>
                    Show in the top <strong>Free MSME Showcase</strong> strip on home
                    (for student UMKM goods, snacks, or services)
                  </>
                ) : (
                  <>
                    Tampilkan di <strong>Etalase UMKM Gratis</strong> bagian atas beranda
                    (khusus produk, jajanan, atau jasa UMKM mahasiswa)
                  </>
                )}
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="deskripsi-listing"
              className="block text-xs font-extrabold text-[#111827]"
            >
              {isEn
                ? "Condition, Completeness & Details"
                : "Deskripsi Kondisi, Kelengkapan & Detail"}{" "}
              <span aria-hidden="true">*</span>
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
              placeholder={
                isEn
                  ? "Describe real item condition, flaws if any, or service schedule."
                  : "Jelaskan kondisi nyata barang, minus jika ada, atau jadwal layanan."
              }
              className="mt-1 w-full rounded-xl border-2 border-[#111827] bg-white px-3 py-2 text-base font-medium text-[#111827] sm:text-sm"
            />
          </div>

          <fieldset className="space-y-2 rounded-2xl border-2 border-[#111827] bg-[#F8FAFC] p-4">
            <legend className="px-1 text-xs font-extrabold text-[#111827]">
              {isEn ? "Supported Campus COD Spots" : "Titik Spot COD Kampus yang Dilayani"}
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
              {isEn ? "Notice:" : "Perhatian:"} {formError}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#111827] bg-white px-5 py-2 text-xs font-bold text-[#111827]"
            >
              {isEn ? "Cancel" : "Batal"}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111827] bg-[#15803D] px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#111827] hover:bg-[#166534] disabled:opacity-60"
            >
              {submitting
                ? isEn
                  ? "Uploading & Publishing..."
                  : "Mengunggah & Menerbitkan..."
                : isEn
                  ? "Publish Listing Now"
                  : "Terbitkan Listing Sekarang"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
