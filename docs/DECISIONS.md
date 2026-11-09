# Keputusan Lingkup & Arsitektur MVP Web UnilakMart (Rilis 1)

Dokumen ini mencatat seluruh keputusan final hasil wawancara penentuan lingkup **MVP Web UnilakMart (Rilis 1)** sebagai acuan bersama tim pengembang, penyelarasan [SRS UnilakMart (IEEE 830).md](../SRS%20UnilakMart%20(IEEE%20830).md), dan implementasi awal.

- **Tanggal keputusan**: 9 November 2026
- **Basis dokumen**: `SRS UnilakMart (IEEE 830).md` v1.0
- **Status**: Disepakati

---

## 1. Tujuan Rilis & Strategi Platform

| Aspek | Keputusan Rilis 1 | Rasional & Batas |
| --- | --- | --- |
| **Target kesiapan** | **Live pilot terbatas** di kampus Unilak | Siap dipakai mahasiswa sungguhan dengan verifikasi KTM nyata, email aktif, keamanan dasar, dan biaya serendah mungkin—bukan sekadar demo statis maupun rilis penuh 12.000+ pengguna sejak hari pertama. |
| **Platform** | **100% Web Responsif (mobile-first)**, opsional PWA | Mempercepat peluncuran dan menekan biaya tim mahasiswa. Aplikasi mobile native (target utama Android; iOS opsional) ditunda ke Rilis 2+. |
| **Model bisnis** | **Murni COD tunai (0% biaya platform)** | Fokus memvalidasi transaksi mahasiswa dan kepercayaan pengguna tanpa terhambat legalitas/integrasi payment gateway. |

---

## 2. Tech Stack, Infrastruktur, & Mitigasi Risiko

- **Framework Web**: Next.js (App Router) dengan TypeScript.
- **UI & Styling**: Tailwind CSS + shadcn/ui (antarmuka Bahasa Indonesia, mobile-first).
- **Backend, Auth, & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security / RLS).
- **Penyimpanan Berkas**: Supabase Storage — bucket publik untuk foto listing, bucket privat untuk foto KTM.
- **Hosting & Deploy**: Vercel (paket Hobby gratis) + Supabase (paket Free).
- **Lingkungan Lokal**: Node.js `v26.12.0` dan npm `11.20.0` sudah memenuhi syarat Next.js (`>= 20.9`). PHP dan Composer pada Laragon tidak digunakan; Laragon hanya menjadi lokasi folder proyek.

### Risiko Teknis & Mitigasi Wajib

| Komponen | Risiko | Mitigasi |
| --- | --- | --- |
| **Vercel Hobby** | Akun gratis bersifat non-komersial dan kolaborasi tim per kursi berbayar. | Dikelola oleh **satu akun pemilik**, anggota tim lain berkontribusi melalui **GitHub** (deploy otomatis dari repositori). Rilis 1 bebas komisi sehingga aman; **hosting wajib ditinjau ulang (upgrade/migrasi) sebelum Rilis 2** yang mulai memungut biaya platform/iklan. |
| **Vercel Node Runtime** | Node.js lokal (`v26.12.0`) lebih baru dibanding runtime default Vercel (umumnya 22.x/24.x). | Kunci versi Node melalui `engines` di `package.json` dan hindari API eksperimental khusus Node 26. |
| **Supabase Auth SMTP** | Limit email bawaan Supabase Free (~2 email/jam) akan menggagalkan pendaftaran & reset sandi saat pilot. | Wajib hubungkan **Custom SMTP gratis** (mis. Resend atau Brevo) sebelum pilot dimulai. |
| **Supabase Free Auto-Pause** | Proyek gratis otomatis *pause* setelah 7 hari tanpa aktivitas. | Pantau kesehatan layanan atau gunakan keep-alive berkala selama masa pilot aktif. |
| **Supabase Storage (1 GB) & Bandwidth** | Foto listing (maks. 5/listing) dan foto KTM cepat menghabiskan kuota gratis. | Terapkan **kompresi foto di browser** sebelum unggah (`NFR-03`) serta hapus otomatis foto KTM setelah verifikasi. |
| **Login NIM vs Email (`FR-06`)** | Supabase Auth secara native hanya menerima email + kata sandi. | Login memakai NIM diproses lewat Server Action/RPC aman untuk menerjemahkan NIM ke email di sisi server tanpa membocorkan apakah NIM terdaftar. |

---

## 3. Pengguna, Verifikasi, & Kepatuhan Data (UU PDP)

1. **Aktor Rilis 1 (`FR-01`, `FR-02`)**:
   - Hanya **Mahasiswa aktif Unilak** (pendaftaran memakai NIM + foto KTM).
   - Dosen, tenaga kependidikan, dan alumni baru **ditunda ke Rilis 2**.
   - Akun **Administrator** awal dibuat lewat *seeding* database / pengaturan role langsung (bukan pendaftaran publik).
2. **Alur Verifikasi Identitas (`FR-02`, `FR-03`)**:
   - Verifikasi KTM dilakukan **manual oleh Administrator**.
   - **Wajib verifikasi email** saat pendaftaran agar pemulihan kata sandi (`FR-06`) dan notifikasi email valid.
3. **Retensi Foto KTM (`NFR-07`)**:
   - Disimpan di bucket privat Supabase Storage (hanya dapat diakses pemilik dan Administrator via signed URL).
   - **Langsung dihapus otomatis** segera setelah verifikasi disetujui, atau **maksimal 7 hari setelah ditolak** sebagai masa banding.
4. **Akses Katalog & Privasi Kontak (`FR-04`)**:
   - Katalog dan detail listing terbuka *read-only* bagi tamu tanpa login maupun akun Belum Verifikasi.
   - Fitur membuat listing, memesan, melaporkan, memberi ulasan, dan melihat kontak penjual terkunci hanya untuk akun berstatus **Terverifikasi**.
5. **Persetujuan & Hak Hapus Akun (`NFR-10`)**:
   - Saat mendaftar, pengguna wajib menyetujui kebijakan privasi UU No. 27 Tahun 2022 yang **secara eksplisit menyebutkan bahwa nomor WhatsApp pengguna akan dibagikan kepada lawan transaksi setelah pesanan diterima (`Dijadwalkan`)**.
   - Pengguna dapat melakukan **hapus akun mandiri** dari pengaturan profil selama tidak memiliki pesanan aktif; data pribadi (nama, NIM, email, nomor HP) dianonimkan tanpa merusak integritas riwayat transaksi dan ulasan yang sudah selesai.

---

## 4. Cakupan Fitur Rilis 1 vs Rilis Selanjutnya

### Masuk di Rilis 1 (MVP Web)
- **F1 Autentikasi & Verifikasi**: `FR-01` s.d. `FR-08` (termasuk `FR-08` edit profil & ubah kata sandi).
- **F2 Katalog & Self-Listing**: `FR-09` s.d. `FR-16` (termasuk `FR-14` urutkan katalog dan `FR-15` penandaan & Etalase UMKM gratis).
- **F3 Pesanan & Spot COD**: `FR-17` s.d. `FR-25` (termasuk `FR-23` pembatalan dengan alasan dan `FR-24` penilaian bintang & ulasan).
- **F5 Pembayaran**: `FR-26` (COD tunai 0% biaya platform).
- **F7 Administrasi**: `FR-46` s.d. `FR-49` (termasuk `FR-49` dasbor statistik ringkas admin).

### Ditunda ke Rilis 2 & Rilis 3
- **Rilis 2**: Pembayaran QRIS dengan escrow & saldo penjual (`FR-27` s.d. `FR-33`), featured listing / iklan berbayar (`FR-40` s.d. `FR-43`), ekspor laporan pendapatan CSV (`FR-50`), dukungan akun Dosen/Tendik/Alumni, serta evaluasi aplikasi mobile Android dan tinjauan ulang hosting.
- **Rilis 3**: Layanan Kurir Mahasiswa intra-kampus (`FR-34` s.d. `FR-39`) dan kemitraan event BEM/Hima & merchant (`FR-44`, `FR-45`).

---

## 5. Aturan Bisnis & Penyesuaian Alur Rilis 1

### 5.1 Katalog, Stok, & Beranda (`FR-09`, `FR-11`, `FR-13`, `FR-15`, `UI-03`)
- **7 Kategori `FR-11` tetap didukung**: Buku dan Modul, Elektronik, Perabot Kos, Pakaian, Produk UMKM, Jasa (desain, pemrograman), dan Jajanan Kampus.
- **Model Stok Sederhana** (menyelesaikan konflik `FR-17` vs UMKM/Jajanan/Jasa):
  - Setiap listing memiliki field `stok` (default `1` untuk barang thrift/bekas, dapat diisi `> 1` atau opsi *selalu tersedia* untuk produk UMKM, jajanan, dan jasa).
  - Pemesanan mengurangi/mengunci kuota stok yang tersedia. Listing hanya terkunci dari pesanan baru dan otomatis berstatus **Terjual** saat `stok` mencapai `0`.
- **Kondisi Barang**: Pilihan baku untuk filter dan form cepat: `Baru`, `Bekas Seperti Baru`, `Bekas Layak Pakai`.
- **Harga & Batas Spam**: Harga `Rp0` (hibah/gratis sesama mahasiswa) diizinkan. Batas maksimal **20 listing aktif** per akun biasa (batas lebih longgar untuk akun penjual UMKM).
- **Tampilan Atas Beranda (`UI-03`)**: Karena featured listing berbayar ditunda, bagian atas beranda Rilis 1 menampilkan **Etalase UMKM (`FR-15`)**, diikuti **Pintasan Kategori & Fakultas**, lalu **Listing Terbaru**.

### 5.2 Alur Spot COD, Status Pesanan, & Sengketa (`FR-17` s.d. `FR-23`, `FR-26`)
- **Pemilihan Spot COD (`FR-19`, `FR-20`)**:
  - Penjual menentukan Spot COD yang dilayani saat membuat/mengedit listing (default: seluruh Spot aktif).
  - Pembeli memilih **1 Spot COD** dan **mengusulkan jam temu** langsung saat membuat pesanan (1 pesanan = 1 listing dengan jumlah).
  - Daftar Spot COD awal (mis. Gazebo Fakultas, Perpustakaan Pusat, Kantin Utama, area Rusunawa) dikelola Admin sambil memproses izin resmi pihak kampus.
- **Status Pesanan (`FR-21`)**:
  - `Menunggu` → `Dijadwalkan` (saat penjual menyetujui pesanan + jadwal) → `Sudah Diserahkan` (ditandai penjual setelah serah terima COD) → `Selesai`.
  - Status akhir alternatif: `Dibatalkan` (pembeli atau penjual membatalkan dengan alasan sebelum selesai, stok dikembalikan) dan `Kedaluwarsa` (otomatis jika penjual tidak merespons dalam **24 jam**, stok dikembalikan).
- **Konfirmasi & Auto-Selesai (`FR-22`)**:
  - Pembeli dapat langsung menekan `Selesai` setelah barang diterima, atau setelah penjual menandai `Sudah Diserahkan`.
  - Jika penjual sudah menandai `Sudah Diserahkan` dan pembeli tidak mengonfirmasi maupun melaporkan kendala dalam **48 jam**, status otomatis menjadi `Selesai`.
- **Kebijakan Sengketa & No-Show**:
  - Untuk COD tunai, pembeli **wajib memeriksa kondisi barang secara langsung di Spot COD sebelum menyerahkan uang tunai**.
  - Platform tidak memproses pengembalian dana (*refund*) atas transaksi tunai yang telah disepakati di tempat; penipuan atau pelanggaran *no-show* ditangani lewat fitur **Laporan Kendala/No-Show (`FR-16`)** serta sanksi penangguhan/pemblokiran akun oleh Admin (`FR-47`).

### 5.3 Komunikasi & Kanal Notifikasi (`FR-25`)
- **Komunikasi**: Tidak ada fitur chat dalam aplikasi di Rilis 1. Koordinasi pertemuan memakai tombol **"Hubungi via WhatsApp"** (tautan `wa.me` + template kode pesanan) yang **hanya terbuka setelah penjual menerima pesanan (`Dijadwalkan`)**, ditambah catatan pesanan.
- **Notifikasi**: Memakai **In-app notification** (ikon lonceng di web) dan **Email transaksional** (via Custom SMTP) untuk verifikasi akun, reset sandi, dan perubahan status pesanan. Web Push Notification dan WhatsApp gateway berbayar tidak dipakai di Rilis 1.

### 5.4 Moderasi Konten & Daftar Terlarang (`FR-16`, `FR-46`, `FR-47`)
- **Post-Moderasi**: Listing dari akun Terverifikasi langsung tayang agar memenuhi target unggah `< 1 menit` (`NFR-03`). Admin menyembunyikan/menghapus listing pelanggar berdasarkan laporan pengguna (`FR-16`) atau pemeriksaan berkala.
- **Daftar Barang & Jasa Terlarang**: Obat keras/narkotika, minuman keras, rokok/vape, senjata tajam/api, barang ilegal/curian/bajakan, konten dewasa/pornografi, serta **jasa joki tugas kuliah, ujian, dan skripsi**.

---

## 6. Resolusi Pertanyaan Terbuka SRS (Bagian 6.4)

| No. SRS | Pertanyaan Terbuka | Keputusan |
| --- | --- | --- |
| **#1** | Verifikasi NIM manual atau integrasi DB akademik? | Manual oleh Administrator lewat foto KTM + verifikasi email wajib. |
| **#2** | Identitas verifikasi dosen dan tendik? | Ditunda ke Rilis 2; Rilis 1 khusus Mahasiswa aktif Unilak. |
| **#3** | Penyedia QRIS & kecukupan fee 1–2%? | Ditunda ke Rilis 2; Rilis 1 murni COD tunai tanpa biaya. |
| **#4** | Perlu chat dalam aplikasi atau cukup kontak? | Tanpa chat in-app; pakai tombol WhatsApp setelah status `Dijadwalkan`. |
| **#5** | Mobile Android saja atau juga iOS? | Rilis 1 fokus Web Responsif; Android utama & iOS opsional ditunda ke Rilis 2+. |
| **#6** | Barang/jasa apa yang dilarang? | Obat/narkotika, miras/rokok/vape, senjata, bajakan/curian, konten dewasa, jasa joki tugas/ujian/skripsi. |
| **#7** | Kebijakan refund sengketa & kerusakan kurir? | Tidak ada kurir maupun escrow di Rilis 1; cek di tempat sebelum bayar tunai, pelanggaran ditindak lewat laporan & blokir akun. |
| **#8** | Apakah kampus sudah menyetujui Spot COD & Kurir? | Kurir ditunda ke Rilis 3; Spot COD memakai titik awal yang dikonfigurasi Admin sambil memproses izin resmi kampus. |

