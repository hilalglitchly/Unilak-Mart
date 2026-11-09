## UNILAK MART PROJECT

## Software Requirements Specification

v1.1

09 – 11 – 2026

## Prepared by

- M. Hilal Akram
- M. Ashrafi Fauzi
- Delvita Sari
- M. Zaydan Hilmi
- Iman Muzamir

## 1. PENDAHULUAN

Dokumen ini menetapkan kebutuhan perangkat lunak UnilakMart, marketplace dan thrift kampus khusus sivitas akademika Universitas Lancang Kuning (Unilak) — dimulai dari mahasiswa aktif pada Rilis 1 dan diperluas ke seluruh sivitas akademika pada Rilis 2 — supaya pengembangan, pengujian, dan penilaian tugas memakai acuan yang sama.

| Item | Keterangan |
| --- | --- |
| Nama produk | UnilakMart |
| Versi dokumen | 1.1 (diselaraskan dengan [DECISIONS.md](DECISIONS.md)) |
| Mata kuliah | Technopreneurship |
| Tim | M. Ashrafi Fauzi, Delvita Sari Br. Pardede, M. Hilal Akram, M. Zaydan Hilmi, Iman Muzamir |
| Dasar penyusunan | Dokumen Ide Bisnis Pertemuan 1 & Keputusan Lingkup MVP Rilis 1 ([DECISIONS.md](DECISIONS.md)) |

## 1.1 Tujuan

SRS ini menjelaskan apa yang harus dilakukan UnilakMart, bukan bagaimana cara membangunnya secara rinci. Pembaca utamanya adalah dosen penilai dan anggota tim pengembang. Setiap kebutuhan diberi kode unik agar mudah dilacak ke fitur, desain, keputusan lingkup, dan pengujian.

## 1.2 Ruang Lingkup

UnilakMart adalah platform jual-beli barang bekas layak pakai (thrift/preloved), produk UMKM, serta jasa mahasiswa. Pada **Rilis 1 (MVP Web)**, UnilakMart diluncurkan sebagai **live pilot terbatas** di kampus dalam bentuk **100% website responsif (mobile-first, opsional PWA)** dengan transaksi **murni COD tunai (0% biaya platform)**. Tujuannya menyelesaikan empat masalah mahasiswa Unilak: buku dan modul mahal, barang kos yang mengendap, rawan penipuan di grup umum, dan UMKM mahasiswa tanpa etalase terpusat.

Yang termasuk dalam lingkup:

**Rilis 1 (MVP Web — Live Pilot Terbatas):**

- Verifikasi identitas mahasiswa aktif Unilak dengan NIM, foto KTM, dan verifikasi email wajib
- Self-listing barang/jasa (dengan stok, kondisi barang, harga mulai Rp0) serta katalog per fakultas dengan pencarian, filter, pengurutan, dan Etalase UMKM gratis
- Pemesanan dan penetapan Spot COD di area kampus dengan pembayaran COD tunai (0% biaya platform)
- Koordinasi pertemuan via tautan WhatsApp (terbuka setelah pesanan berstatus `Dijadwalkan`), notifikasi in-app dan email transaksional, ulasan, pelaporan kendala/no-show, serta hapus akun mandiri
- Pengelolaan dan post-moderasi oleh administrator

**Rilis 2 & Rilis 3 (Pengembangan Lanjutan):**

- **Rilis 2**: Pembayaran QRIS dengan escrow & saldo penjual, promosi berbayar (featured listing) UMKM, ekspor laporan pendapatan CSV, dukungan akun dosen/tenaga kependidikan/alumni baru, serta evaluasi aplikasi mobile native (target utama Android; iOS opsional)
- **Rilis 3**: Layanan Kurir Mahasiswa intra-kampus serta kemitraan event BEM/Hima & merchant sekitar kampus

**Yang tidak termasuk:**

- Melayani pengguna di luar sivitas akademika Unilak (trade-off strategi niche pada dokumen ide bisnis)
- Pengiriman ekspedisi antar-kota
- Fitur chat real-time di dalam aplikasi, pembayaran QRIS/escrow, fitur berbayar, dan layanan kurir pada Rilis 1 (ditunda ke Rilis 2–3)
- Transaksi barang dan jasa terlarang (obat keras/narkotika, minuman keras, rokok/vape, senjata tajam/api, barang ilegal/curian/bajakan, konten dewasa/pornografi, serta jasa joki tugas kuliah, ujian, dan skripsi)

## 1.3 Definisi, Akronim, dan Singkatan

| Istilah | Arti |
| --- | --- |
| SRS | Software Requirements Specification, dokumen spesifikasi kebutuhan perangkat lunak |
| Unilak | Universitas Lancang Kuning |
| Sivitas akademika | Mahasiswa, dosen, dan tenaga kependidikan Unilak (Rilis 1 difokuskan untuk mahasiswa aktif; dosen, tendik, dan alumni baru dibuka di Rilis 2) |
| NIM | Nomor Induk Mahasiswa |
| KTM | Kartu Tanda Mahasiswa |
| Thrift / preloved | Barang bekas yang masih layak pakai |
| Listing | Unggahan satu barang, produk UMKM, atau jasa yang dijual di platform (mendukung stok tunggal maupun majemuk) |
| COD | Cash on Delivery, pembayaran tunai saat barang diterima |
| Spot COD | Titik temu di kampus untuk transaksi COD, misalnya gazebo fakultas, perpustakaan pusat, kantin, atau area Rusunawa (daftar awal dikelola Admin sambil memproses izin resmi kampus) |
| Etalase UMKM | Penandaan dan tampilan khusus gratis di beranda Rilis 1 untuk produk dan jasa UMKM mahasiswa (`FR-15`) |
| QRIS | Standar kode QR pembayaran nasional (Rilis 2) |
| Escrow / Rekening Bersama | Dana pembeli ditahan sistem dan baru diteruskan ke penjual setelah pembeli mengonfirmasi barang diterima (Rilis 2) |
| Kurir Mahasiswa | Mahasiswa yang mengantar pesanan jarak dekat di dalam kampus dan sekitar Rumbai (Rilis 3) |
| Featured listing | Promosi berbayar agar listing tampil di bagian atas halaman utama (Rilis 2) |
| UMKM | Usaha Mikro, Kecil, dan Menengah |
| BEM / Hima | Badan Eksekutif Mahasiswa / Himpunan Mahasiswa |
| PWA | Progressive Web App (dukungan instalasi web opsional pada Rilis 1) |
| UU PDP | Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi |
| FR / NFR | Functional Requirement / Non-Functional Requirement |

## 1.4 Referensi

- IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications (digantikan oleh ISO/IEC/IEEE 29148)
- Tugas Kelompok Pertemuan 1 Technopreneurship: Ide Bisnis UnilakMart
- Keputusan Lingkup & Arsitektur MVP Web UnilakMart (Rilis 1): [DECISIONS.md](DECISIONS.md) (9 November 2026)

## 1.5 Gambaran Umum Dokumen

Bagian 2 menjelaskan konteks produk, pengguna, batasan, asumsi, dan pembagian rilis. Bagian 3 mendefinisikan antarmuka eksternal. Bagian 4 memuat kebutuhan fungsional per fitur, dan Bagian 5 kebutuhan non-fungsional. Bagian 6 berisi lampiran pendukung.

Konvensi penulisan: kebutuhan fungsional berkode `FR-xx` dan non-fungsional `NFR-xx`. Prioritas memakai tiga tingkat yang dipetakan ke rilis: `Wajib` dan `Penting (Rilis 1)` masuk ke **Rilis 1 (MVP Web)**, `Penting (Rilis 2)` / `Opsional (Rilis 2)` ditunda ke **Rilis 2**, dan `Opsional (Rilis 3)` ditunda ke **Rilis 3**.

## 2. DESKRIPSI UMUM

UnilakMart adalah produk baru yang berdiri sendiri, berupa ekosistem tertutup untuk komunitas Unilak. Pada **Rilis 1**, sistem berjalan mandiri tanpa integrasi basis data akademik maupun payment gateway (verifikasi identitas dilakukan manual oleh Administrator melalui foto KTM dan verifikasi email melalui layanan email transaksional). Sistem eksternal penyedia pembayaran QRIS baru dihubungkan pada **Rilis 2**.

## 2.1 Perspektif Produk

UnilakMart bukan turunan dari sistem lain. Pada **Rilis 1**, sistem dibangun sebagai **100% aplikasi web responsif (mobile-first, opsional PWA)** menggunakan **Next.js (App Router) + TypeScript**, **Tailwind CSS + shadcn/ui**, serta **Supabase** (PostgreSQL, Supabase Auth, Row Level Security / RLS, dan Supabase Storage dengan bucket publik untuk foto listing serta bucket privat untuk foto KTM), yang di-deploy ke **Vercel (Hobby)** dan **Supabase (Free)**.

Saat aplikasi mobile native (target utama Android; iOS opsional) dikembangkan pada **Rilis 2+**, web dan aplikasi mobile akan berbagi satu basis data dan layanan backend yang sama melalui endpoint API terpadu agar data pengguna, listing, dan pesanan tetap konsisten. Dibanding marketplace umum (Shopee, Tokopedia, Facebook Marketplace), UnilakMart sengaja menyempit ke satu komunitas agar transaksi lebih aman, tanpa ongkos kirim ekspedisi, dan relevan dengan kebutuhan kuliah di kampus Rumbai.

## 2.2 Fungsi Produk

| Kode | Fungsi Utama | Ringkasan |
| --- | --- | --- |
| F1 | Autentikasi dan verifikasi NIM (Rilis 1) | Pendaftaran mahasiswa aktif dengan NIM, foto KTM, verifikasi email wajib, persetujuan UU PDP, serta hapus akun mandiri |
| F2 | Self-listing dan katalog (Rilis 1) | Unggah barang/jasa (< 1 menit) dengan stok, kondisi, dan harga mulai Rp0; pencarian, filter fakultas/kategori, pengurutan, dan Etalase UMKM gratis |
| F3 | Spot COD kampus (Rilis 1) | Pemilihan 1 Spot COD dan usulan jam temu saat checkout, pelacakan status pesanan, auto-selesai 48 jam, ulasan, dan kontak WhatsApp setelah `Dijadwalkan` |
| F4 | Kurir Mahasiswa (Rilis 3) | Pengantaran jarak dekat oleh mahasiswa yang punya jam kosong (ditunda ke Rilis 3) |
| F5 | Pembayaran (Rilis 1 & Rilis 2) | Rilis 1 murni COD tunai (0% biaya platform); pembayaran QRIS dengan escrow ditambahkan pada Rilis 2 |
| F6 | Promosi UMKM berbayar (Rilis 2) | Featured listing berbayar per minggu (ditunda ke Rilis 2; Rilis 1 memakai Etalase UMKM gratis pada F2) |
| F7 | Administrasi (Rilis 1 & Rilis 2) | Verifikasi KTM manual, post-moderasi listing, pengelolaan Spot COD/kategori/fakultas, laporan/no-show, dan dasbor ringkas di Rilis 1; ekspor CSV pendapatan pada Rilis 2 |

## 2.3 Karakteristik Pengguna

| Pengguna | Siapa | Peran di sistem | Kemahiran teknis |
| --- | --- | --- | --- |
| Pembeli | **Rilis 1**: Mahasiswa aktif Unilak berstatus Terverifikasi.<br>**Rilis 2**: Dosen, tenaga kependidikan, alumni baru.<br>*(Pengunjung tamu tanpa login & akun Belum Verifikasi hanya akses read-only katalog/detail listing.)* | Mencari, memesan, memilih Spot COD & jam temu, membayar tunai (QRIS di Rilis 2), mengonfirmasi selesai, menilai, dan melaporkan pelanggaran | Dasar: terbiasa dengan web/aplikasi belanja dan WhatsApp |
| Penjual | **Rilis 1**: Mahasiswa aktif Unilak berstatus Terverifikasi.<br>**Rilis 2**: Dosen, tenaga kependidikan, alumni baru | Membuat dan mengelola listing, menerima/menolak pesanan, menandai `Sudah Diserahkan`, memberi ulasan *(tarik saldo pada Rilis 2)* | Dasar |
| Penjual UMKM | Wirausaha mahasiswa, pengurus BEM/Hima, freelancer mahasiswa aktif (Terverifikasi) | Menjual produk UMKM, jajanan, atau jasa dengan stok majemuk; menandai listing ke Etalase UMKM gratis (Rilis 1); membeli featured listing (Rilis 2) | Dasar sampai menengah |
| Kurir Mahasiswa *(Rilis 3)* | Mahasiswa dengan jam kosong | Menerima dan mengantar pesanan jarak dekat di sekitar kampus | Dasar |
| Administrator | Pengelola UnilakMart (akun awal dibuat lewat *seeding* database/pengaturan role, bukan pendaftaran publik) | Verifikasi KTM manual, post-moderasi listing, penanganan laporan/no-show, pengelolaan Spot COD, dan dasbor statistik ringkas *(sengketa escrow & laporan keuangan pada Rilis 2)* | Menengah |

Satu akun dapat berperan sebagai pembeli dan penjual sekaligus. Peran Kurir Mahasiswa diaktifkan lewat pendaftaran tambahan pada Rilis 3.

## 2.4 Batasan

- Pada Rilis 1, pendaftaran akun dibatasi khusus **Mahasiswa aktif Unilak** (NIM + foto KTM + email aktif); akses membuat listing, memesan, melaporkan, memberi ulasan, dan melihat kontak penjual hanya untuk akun **Terverifikasi**.
- Transaksi tatap muka diarahkan ke Spot COD yang disediakan pada sistem (daftar titik awal dikelola Administrator sambil memproses izin resmi pihak kampus).
- Pembayaran Rilis 1 murni COD tunai (0% biaya platform). Pembayaran non-tunai pada Rilis 2 hanya melalui QRIS lewat penyedia pembayaran berlisensi, karena sistem tidak boleh menyimpan dana pengguna sendiri tanpa izin.
- Pengelolaan data pribadi mengikuti **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**: persetujuan eksplisit pembagian nomor WhatsApp saat mendaftar, penghapusan otomatis foto KTM setelah verifikasi, dan hak hapus akun mandiri dengan anonimisasi PII.
- Tim pengembang adalah mahasiswa dengan modal terbatas: Rilis 1 memakai **Vercel Hobby** (dikelola satu akun pemilik, kontribusi tim via GitHub; wajib ditinjau ulang sebelum komersialisasi Rilis 2) dan **Supabase Free** (mematuhi batas storage 1 GB, custom SMTP gratis, kompresi gambar browser, serta mengunci versi Node.js `>= 20.9` di `package.json`).

## 2.5 Asumsi dan Ketergantungan

- Pengguna memiliki smartphone atau komputer dengan kamera (untuk foto barang dan foto KTM), browser modern, koneksi internet, dan nomor WhatsApp aktif.
- Pihak kampus mengizinkan titik-titik Spot COD dipakai untuk transaksi (sambil izin resmi diproses, Rilis 1 memakai titik awal yang dikonfigurasi Administrator).
- Penyedia pembayaran QRIS bersedia bekerja sama saat memasuki **Rilis 2** (tidak menjadi ketergantungan Rilis 1).
- Verifikasi NIM dilakukan manual oleh Administrator menggunakan NIM dan foto KTM tanpa integrasi basis data akademik kampus, disertai verifikasi email wajib melalui **Custom SMTP gratis** (mis. Resend atau Brevo) untuk menghindari batas limit bawaan Supabase Free (~2 email/jam).
- Proyek Supabase Free dipantau/di-keep-alive secara berkala selama masa pilot aktif agar terhindar dari *auto-pause* setelah 7 hari tanpa aktivitas.
- Dosen, tenaga kependidikan, dan alumni baru (beserta mekanisme verifikasi identitas non-KTM) ditunda ke **Rilis 2**.

## 2.6 Pembagian Rilis (Disepakati)

Mengacu pada [DECISIONS.md](DECISIONS.md), kebutuhan dibagi ke tiga rilis berikut:

| Rilis | Isi | Prioritas |
| --- | --- | --- |
| 1 (MVP Web — Live Pilot Terbatas) | 100% Web Responsif mobile-first (opsional PWA); registrasi mahasiswa aktif (NIM, KTM, verifikasi email, persetujuan UU PDP), login NIM/email, edit profil/sandi (`FR-08`), hapus akun mandiri; self-listing (stok, kondisi, harga `>= Rp0`, batas 20 listing aktif); katalog baca-saja untuk tamu/belum verifikasi, filter, urutkan (`FR-14`), Etalase UMKM gratis (`FR-15`); pesanan & Spot COD (pilih Spot & usul jam saat pesan, status `Menunggu`/`Dijadwalkan`/`Sudah Diserahkan`/`Selesai`/`Dibatalkan`/`Kedaluwarsa`, auto-kedaluwarsa 24 jam, auto-selesai 48 jam, tombol WhatsApp setelah `Dijadwalkan` tanpa chat in-app); pembatalan dengan alasan (`FR-23`), ulasan (`FR-24`), notifikasi in-app & email (`FR-25`), COD tunai 0% biaya (`FR-26`); pelaporan & post-moderasi (`FR-16`, `FR-46`, `FR-47`), konfigurasi Spot/kategori/fakultas (`FR-48`), dasbor ringkas admin (`FR-49`) | Wajib & Penting (Rilis 1) |
| 2 | Pembayaran QRIS dengan escrow & saldo penjual (`FR-27` s.d. `FR-33`), featured listing / iklan berbayar (`FR-40` s.d. `FR-43`), ekspor laporan pendapatan CSV (`FR-50`), dukungan akun dosen/tendik/alumni, tinjauan ulang hosting komersial, serta evaluasi aplikasi mobile Android (iOS opsional) beserta API klien mobile | Penting (Rilis 2) & Opsional (Rilis 2) |
| 3 | Kurir Mahasiswa intra-kampus (`FR-34` s.d. `FR-39`), kemitraan event BEM/Hima & merchant sekitar kampus (`FR-44`, `FR-45`) | Opsional (Rilis 3) |

## 3. KEBUTUHAN ANTARMUKA EKSTERNAL

Pada Rilis 1, UnilakMart berinteraksi dengan pengguna lewat browser pada perangkat desktop maupun ponsel, dengan backend/storage Supabase, dan dengan layanan email transaksional (Custom SMTP). Integrasi API penyedia pembayaran QRIS dan aplikasi mobile native ditambahkan pada Rilis 2.

## 3.1 Antarmuka Pengguna

| Kode | Ketentuan |
| --- | --- |
| UI-01 | Tampilan responsif (mobile-first) dan nyaman dipakai di layar ponsel, tablet, dan desktop. |
| UI-02 | Navigasi utama konsisten: Beranda, Cari, Jual, Pesanan, Profil (pada web Rilis 1 maupun aplikasi mobile Rilis 2+). |
| UI-03 | Pada Rilis 1, halaman utama menampilkan **Etalase UMKM gratis (`FR-15`)** di bagian atas, diikuti **Pintasan Kategori & Fakultas**, lalu **Listing Terbaru** *(slot featured listing berbayar ditambahkan di bagian atas pada Rilis 2)*. |
| UI-04 | Form listing berisi foto (maks. 5, terkompresi di browser), judul, deskripsi, kondisi barang (`Baru`, `Bekas Seperti Baru`, `Bekas Layak Pakai`), harga (mendukung `Rp0`), stok, kategori, dan Spot COD dalam satu layar agar dapat diisi kurang dari 1 menit. |
| UI-05 | Profil publik penjual menampilkan nama asli, program studi, fakultas, dan lencana Terverifikasi *(nomor WhatsApp tidak ditampilkan secara publik dan baru dibagikan ke lawan transaksi setelah pesanan berstatus `Dijadwalkan`)*. |
| UI-06 | Bahasa antarmuka Bahasa Indonesia. |
| UI-07 | Pesan kesalahan ditulis dalam bahasa yang mudah dipahami dan menyebut langkah perbaikan. |

Halaman utama pada **Rilis 1** meliputi: masuk dan daftar (termasuk verifikasi email & persetujuan UU PDP), status verifikasi KTM, beranda dan katalog (serta Etalase UMKM), detail listing, form listing, pembuatan pesanan (pemilihan 1 Spot COD & usulan jam temu), riwayat dan detail pesanan (tombol WhatsApp saat `Dijadwalkan`, pembatalan, konfirmasi selesai, ulasan, laporan), pengaturan profil & hapus akun mandiri, serta panel administrator. Halaman pembayaran QRIS, saldo/penarikan, dan promosi berbayar ditambahkan pada **Rilis 2**, sedangkan dasbor Kurir Mahasiswa ditambahkan pada **Rilis 3**.

## 3.2 Antarmuka Perangkat Keras

- Perangkat pengguna: smartphone atau komputer dengan kamera (untuk foto barang dan foto KTM) dan koneksi internet.
- Aplikasi dompet digital atau mobile banking milik pembeli untuk memindai dan membayar kode QRIS *(berlaku mulai Rilis 2)*.
- Server dan penyimpanan di layanan cloud/hosting (Vercel + Supabase pada Rilis 1).

## 3.3 Antarmuka Perangkat Lunak

| Komponen | Kegunaan |
| --- | --- |
| Browser modern (Chrome, Edge, Firefox, Safari: dua versi terbaru) | Mengakses aplikasi web responsif (Rilis 1) |
| Aplikasi web Next.js (App Router, TypeScript, Tailwind CSS, shadcn/ui) | Antarmuka web responsif, SSR, serta logika server/Server Actions (Rilis 1) |
| Layanan notifikasi (In-app notification & Custom SMTP transaksional) | Mengabarkan verifikasi email, reset sandi, status verifikasi KTM, dan status pesanan pada Rilis 1 *(Web Push Notification ditunda ke Rilis 2+)* |
| Penyimpanan berkas gambar (Supabase Storage) | Bucket publik untuk foto listing dan bucket privat untuk foto KTM (akses via signed URL) |
| Basis data & Auth (Supabase PostgreSQL + Auth + RLS) | Data pengguna, listing, pesanan, ulasan, laporan, notifikasi, dan Spot COD |
| Aplikasi mobile (Android sebagai target utama; iOS opsional) | Mengakses versi mobile native *(Rilis 2+)* |
| API penyedia pembayaran QRIS | Membuat tagihan QRIS, menahan dana (escrow), dan menerima status pembayaran *(Rilis 2)* |

## 3.4 Antarmuka Komunikasi

- Seluruh komunikasi klien dan server memakai HTTPS.
- Pada Rilis 1, klien web Next.js berkomunikasi langsung dengan layanan backend/database melalui Server Actions, Route Handlers, dan kebijakan Row Level Security (RLS) Supabase; endpoint REST/API publik untuk aplikasi mobile disediakan pada Rilis 2+.
- Status pembayaran dari penyedia QRIS diterima lewat callback (webhook) yang diverifikasi tanda tangannya *(berlaku mulai Rilis 2)*.

## 4. KEBUTUHAN FUNGSIONAL

Bagian ini memuat kebutuhan per fungsi utama (`F1` sampai `F7`). Penandaan prioritas mengikuti pembagian rilis pada Bagian 2.6: `Wajib` dan `Penting (Rilis 1)` diimplementasikan pada **Rilis 1**, `Penting (Rilis 2)` / `Opsional (Rilis 2)` ditunda ke **Rilis 2**, dan `Opsional (Rilis 3)` ditunda ke **Rilis 3**.

## 4.1 Registrasi, Autentikasi, dan Verifikasi NIM (F1)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-01 | Sistem harus menyediakan pendaftaran akun khusus **Mahasiswa aktif Unilak** dengan NIM, nama lengkap, program studi, fakultas, email, nomor HP (WhatsApp), kata sandi, **verifikasi email wajib**, serta **persetujuan kebijakan privasi UU No. 27 Tahun 2022 yang secara eksplisit menyatakan bahwa nomor WhatsApp pengguna akan dibagikan kepada lawan transaksi setelah pesanan diterima (`Dijadwalkan`)**. *(Dukungan akun dosen, tendik, dan alumni baru ditunda ke Rilis 2.)* | Wajib |
| FR-02 | Sistem harus meminta foto KTM Unilak (disimpan di bucket privat) untuk verifikasi identitas dan menampilkan status akun: `Belum Verifikasi`, `Menunggu`, `Terverifikasi`, atau `Ditolak`. | Wajib |
| FR-03 | Administrator harus dapat menyetujui atau menolak verifikasi KTM secara manual dengan alasan, pengguna menerima notifikasi hasilnya (in-app & email), dan **foto KTM langsung dihapus otomatis segera setelah disetujui atau maksimal 7 hari setelah ditolak** (masa banding). | Wajib |
| FR-04 | Katalog dan detail listing dapat diakses secara *read-only* oleh pengunjung tanpa login (tamu) maupun akun Belum Verifikasi/Menunggu/Ditolak. Hanya akun `Terverifikasi` yang dapat membuat listing, memesan, melaporkan pelanggaran, memberi ulasan, dan melihat kontak penjual setelah pesanan `Dijadwalkan`. | Wajib |
| FR-05 | Sistem harus menolak NIM yang sudah dipakai akun lain (satu NIM, satu akun). | Wajib |
| FR-06 | Pengguna harus dapat masuk dengan NIM atau email dan kata sandi (lookup NIM ke email diproses aman di sisi server tanpa membocorkan status keterdaftaran NIM), serta mengatur ulang kata sandi lewat email. | Wajib |
| FR-07 | Profil publik penjual harus menampilkan nama asli, program studi, fakultas, dan lencana Terverifikasi (tanpa membuka nomor WhatsApp sebelum status pesanan `Dijadwalkan`). | Wajib |
| FR-08 | Pengguna harus dapat mengubah data profil dan kata sandi, serta melakukan **hapus akun mandiri** dari pengaturan profil selama tidak memiliki pesanan aktif (data pribadi seperti nama, NIM, email, dan nomor HP dianonimkan tanpa merusak integritas riwayat transaksi dan ulasan yang sudah selesai). | Penting (Rilis 1) |

## 4.2 Self-Listing dan Katalog (F2)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-09 | Penjual harus dapat membuat listing berisi foto (maksimal 5, dikompres di browser sebelum unggah), judul, deskripsi, **pilihan kondisi barang (`Baru`, `Bekas Seperti Baru`, `Bekas Layak Pakai`)**, harga (**mengizinkan `Rp0` untuk hibah/gratis**), **`stok` (default `1` untuk barang thrift/bekas; dapat diisi `> 1` atau opsi *selalu tersedia* untuk produk UMKM, jajanan, dan jasa)**, kategori, serta pilihan Spot COD yang dilayani (default seluruh Spot aktif), dengan batas **maksimal 20 listing aktif per akun biasa** (batas lebih longgar untuk akun penjual UMKM). | Wajib |
| FR-10 | Penjual harus dapat mengubah, menonaktifkan, menghapus, dan menandai listing miliknya sebagai `Terjual` (atau mengaktifkan kembali dengan menyesuaikan stok). | Wajib |
| FR-11 | Sistem harus menyediakan 7 kategori: Buku dan Modul, Elektronik, Perabot Kos, Pakaian, Produk UMKM, Jasa (desain, pemrograman), dan Jajanan Kampus. | Wajib |
| FR-12 | Katalog harus dapat difilter per fakultas, misalnya Modul Fasilkom. | Wajib |
| FR-13 | Sistem harus menyediakan pencarian kata kunci dengan filter kategori, fakultas, rentang harga, dan kondisi barang (`Baru`, `Bekas Seperti Baru`, `Bekas Layak Pakai`). | Wajib |
| FR-14 | Hasil katalog harus dapat diurutkan menurut terbaru, harga terendah, dan harga tertinggi. | Penting (Rilis 1) |
| FR-15 | Penjual UMKM harus dapat menandai listing sebagai produk atau jasa UMKM secara gratis agar tampil di **Etalase UMKM** pada bagian atas beranda Rilis 1. | Penting (Rilis 1) |
| FR-16 | Pengguna Terverifikasi harus dapat melaporkan listing atau pengguna yang melanggar aturan, termasuk **kendala transaksi COD, pelanggaran *no-show*, maupun konten barang/jasa terlarang** (obat keras/narkotika, minuman keras, rokok/vape, senjata tajam/api, barang ilegal/curian/bajakan, konten dewasa/pornografi, serta jasa joki tugas kuliah, ujian, dan skripsi). | Wajib |

## 4.3 Pesanan dan Spot COD (F3)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-17 | Pembeli Terverifikasi harus dapat memesan 1 listing yang tersedia dengan jumlah sesuai stok. Pemesanan **mengurangi/mengunci kuota `stok` yang tersedia**; listing hanya terkunci dari pesanan baru dan otomatis berstatus `Terjual` saat `stok` mencapai `0` *(untuk opsi selalu tersedia, stok tidak habis)*. | Wajib |
| FR-18 | Penjual harus dapat menerima atau menolak pesanan. Pesanan yang tidak dijawab dalam batas waktu **24 jam** (dapat diatur administrator) otomatis berstatus `Kedaluwarsa` dan kuota `stok` dikembalikan. | Wajib |
| FR-19 | Administrator harus dapat mengelola daftar Spot COD: nama, lokasi, jam layanan, dan status aktif. Daftar Spot COD awal (mis. Gazebo Fakultas, Perpustakaan Pusat, Kantin Utama, area Rusunawa) dikelola Admin sambil memproses izin resmi pihak kampus. | Wajib |
| FR-20 | Saat membuat pesanan, pembeli memilih **1 Spot COD** dari daftar yang didukung listing, **mengusulkan jam temu**, dan dapat mengisi catatan pesanan. Ketika penjual menyetujui pesanan dan jadwal, status langsung berubah menjadi `Dijadwalkan`, kedua pihak menerima notifikasi jadwal, dan tombol **"Hubungi via WhatsApp"** (tautan `wa.me` + template kode pesanan) terbuka bagi pembeli dan penjual *(tanpa chat in-app di Rilis 1)*. | Wajib |
| FR-21 | Sistem harus menampilkan status pesanan: `Menunggu`, `Dijadwalkan`, `Sudah Diserahkan`, `Selesai`, `Dibatalkan`, dan `Kedaluwarsa`. | Wajib |
| FR-22 | Penjual dapat menandai pesanan `Sudah Diserahkan` setelah serah terima di Spot COD. Pembeli dapat langsung menandai pesanan `Selesai` setelah barang diterima (baik langsung maupun setelah `Sudah Diserahkan`); jika penjual telah menandai `Sudah Diserahkan` dan pembeli tidak mengonfirmasi maupun melaporkan kendala dalam **48 jam**, status otomatis menjadi `Selesai`. | Wajib |
| FR-23 | Pembeli atau penjual dapat membatalkan pesanan dengan menyebut alasan sebelum status `Sudah Diserahkan`/`Selesai`, dan kuota `stok` dikembalikan. | Penting (Rilis 1) |
| FR-24 | Setelah pesanan berstatus `Selesai`, pembeli dan penjual harus dapat saling memberi penilaian bintang dan ulasan singkat. | Penting (Rilis 1) |
| FR-25 | Sistem harus mengirim notifikasi **in-app (ikon lonceng) dan email transaksional** untuk verifikasi email, reset sandi, hasil verifikasi KTM, dan perubahan status pesanan pada Rilis 1 *(notifikasi Web Push, pembayaran QRIS, dan pengantaran kurir ditunda ke Rilis 2–3; WhatsApp gateway berbayar tidak dipakai)*. | Wajib |

## 4.4 Pembayaran (F5)

*Catatan lingkup: Pada Rilis 1, sistem hanya mendukung `FR-26` (COD tunai tanpa biaya platform). Kebutuhan QRIS dan escrow (`FR-27` s.d. `FR-33`) ditunda ke **Rilis 2**.*

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-26 | Sistem harus mendukung pembayaran **COD tunai di Spot COD dengan 0% biaya platform**. Pembeli wajib memeriksa kondisi barang secara langsung di Spot COD sebelum menyerahkan uang tunai; platform tidak memproses pengembalian dana (*refund*) atas transaksi tunai yang telah disepakati di tempat (penipuan/*no-show* ditangani lewat `FR-16` dan `FR-47`). | Wajib |
| FR-27 | Sistem harus membuat kode QRIS dinamis sesuai nominal pesanan untuk pembayaran non-tunai. | Penting (Rilis 2) |
| FR-28 | Pada pembayaran QRIS, dana harus ditahan (escrow) sampai pembeli mengonfirmasi barang diterima dengan baik. | Penting (Rilis 2) |
| FR-29 | Setelah konfirmasi pembeli, sistem harus meneruskan dana ke saldo penjual dikurangi admin fee 1% sampai 2% dari nilai transaksi. | Penting (Rilis 2) |
| FR-30 | Jika pembeli tidak mengonfirmasi dan tidak mengajukan sengketa dalam batas waktu yang diatur administrator (usulan awal 2 hari setelah jadwal temu), dana diteruskan otomatis ke penjual. | Penting (Rilis 2) |
| FR-31 | Pembeli harus dapat mengajukan sengketa sebelum konfirmasi. Dana tetap ditahan sampai administrator memutuskan. | Penting (Rilis 2) |
| FR-32 | Penjual harus dapat melihat saldo dan menarik dana ke rekening bank atau dompet digital. | Penting (Rilis 2) |
| FR-33 | Sistem harus mencatat riwayat setiap transaksi pembayaran sebagai jejak audit yang tidak dapat diubah pengguna. | Penting (Rilis 2) |

## 4.5 Kurir Mahasiswa Intra-Kampus (F4)

*Catatan lingkup: Seluruh kebutuhan Kurir Mahasiswa (`FR-34` s.d. `FR-39`) ditunda ke **Rilis 3**.*

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-34 | Pengguna terverifikasi harus dapat mendaftar sebagai Kurir Mahasiswa dan mengatur status aktif atau nonaktif. | Opsional (Rilis 3) |
| FR-35 | Saat memesan, pembeli harus dapat memilih pengantaran Kurir Mahasiswa dan melihat tarif Rp3.000 sampai Rp5.000 sekali jalan sesuai jarak. | Opsional (Rilis 3) |
| FR-36 | Pesanan pengantaran harus tampil di dasbor kurir aktif, dan satu kurir dapat mengambilnya. | Opsional (Rilis 3) |
| FR-37 | Sistem harus menampilkan status pengantaran: Diambil Kurir, Dalam Perjalanan, Sampai, dan Selesai. | Opsional (Rilis 3) |
| FR-38 | Tarif kurir harus dibagi otomatis: 80% sampai 85% ke saldo kurir dan 15% sampai 20% ke kas platform. | Opsional (Rilis 3) |
| FR-39 | Pembeli harus dapat menilai kurir setelah pengantaran selesai. | Opsional (Rilis 3) |

## 4.6 Promosi UMKM Berbayar (F6)

*Catatan lingkup: Promosi berbayar (`FR-40` s.d. `FR-43`) ditunda ke **Rilis 2**. Pada Rilis 1, penjual UMKM menggunakan Etalase UMKM gratis (`FR-15`).*

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-40 | Penjual UMKM harus dapat membeli featured listing (boost post) atau slot banner atas untuk durasi mingguan dengan tarif Rp5.000 sampai Rp15.000 per minggu. | Penting (Rilis 2) |
| FR-41 | Pembayaran featured listing harus dilakukan lewat QRIS. | Penting (Rilis 2) |
| FR-42 | Listing yang dipromosikan harus tampil di bagian atas beranda dengan label Promosi selama masa aktif, lalu kembali ke urutan biasa setelah masa aktif habis. | Penting (Rilis 2) |
| FR-43 | Penjual harus dapat melihat jumlah tayangan dan klik listing yang dipromosikan. | Opsional (Rilis 2) |

## 4.7 Kemitraan Event dan Merchant

*Catatan lingkup: Kemitraan event dan merchant (`FR-44`, `FR-45`) ditunda ke **Rilis 3**.*

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-44 | Administrator harus dapat membuat halaman event (seminar atau bazar BEM/Hima) dan slot promosi bagi usaha sekitar kampus. | Opsional (Rilis 3) |
| FR-45 | Sistem harus mencatat komisi tiket atau paket sponsor dari mitra. Rincian mekanisme penjualan tiket ditetapkan pada Rilis 3. | Opsional (Rilis 3) |

## 4.8 Administrasi (F7)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-46 | Administrator harus dapat melihat laporan listing atau pengguna (termasuk kendala/*no-show* COD), dan melakukan **post-moderasi** dengan menyembunyikan atau menghapus listing yang melanggar aturan maupun daftar barang/jasa terlarang *(listing akun Terverifikasi tayang langsung agar memenuhi target unggah < 1 menit pada `NFR-03`)*. | Wajib |
| FR-47 | Administrator harus dapat menangguhkan atau memblokir akun yang melanggar aturan (termasuk pelaku penipuan atau *no-show* berulang). | Wajib |
| FR-48 | Administrator harus dapat mengelola kategori, fakultas, daftar Spot COD, dan status akun penjual UMKM pada Rilis 1 *(pengaturan persentase admin fee serta tarif promosi dan kurir ditambahkan pada Rilis 2–3)*. | Wajib |
| FR-49 | Dasbor administrator Rilis 1 harus menampilkan statistik ringkas: jumlah pengguna (total & terverifikasi/menunggu), listing aktif, dan pesanan/transaksi COD *(metrik pendapatan platform ditambahkan pada Rilis 2)*. | Penting (Rilis 1) |
| FR-50 | Administrator harus dapat mengekspor laporan pendapatan per sumber (komisi, featured listing, kurir, kemitraan) dalam format CSV. | Penting (Rilis 2) |

## 5. KEBUTUHAN NON-FUNGSIONAL

Angka target di bawah adalah acuan sistem. Pada **Rilis 1 (live pilot terbatas)**, pengujian diprioritaskan pada kelancaran alur pilot dan efisiensi kuota layanan gratis (Vercel Hobby & Supabase Free), sedangkan target skala penuh satu kampus (12.000+ mahasiswa aktif) divalidasi bertahap menuju Rilis 2.

| Kode | Kategori | Kebutuhan |
| --- | --- | --- |
| NFR-01 | Performa | Halaman katalog dan detail listing termuat dalam 3 detik atau kurang untuk 95% permintaan pada koneksi 4G normal. |
| NFR-02 | Performa | Sistem melayani sedikitnya 500 pengguna aktif bersamaan tanpa penurunan layanan yang berarti (target skala penuh kampus). |
| NFR-03 | Performa | Pengguna dapat menyelesaikan satu listing (foto, deskripsi, kondisi, harga, stok, kategori) dalam kurang dari 1 menit; foto **dikompres otomatis di browser klien** sebelum diunggah ke storage untuk menghemat kuota 1 GB & bandwidth. |
| NFR-04 | Keamanan | Kata sandi disimpan dalam bentuk hash modern (dikelola Supabase Auth dengan algoritma bcrypt/Argon2), tidak pernah dalam teks biasa. |
| NFR-05 | Keamanan | Seluruh lalu lintas memakai HTTPS. Sistem terlindung dari kerentanan umum OWASP Top 10, termasuk SQL injection, XSS, CSRF, serta kebocoran akses data lewat Row Level Security (RLS). |
| NFR-06 | Keamanan | Hak akses berbasis peran: tamu/belum verifikasi (read-only katalog), pembeli, penjual, administrator (serta kurir di Rilis 3) hanya dapat mengakses fungsi sesuai perannya. |
| NFR-07 | Keamanan | Foto KTM disimpan di bucket privat (hanya dapat dilihat pemilik akun dan administrator melalui signed URL), dan **langsung dihapus otomatis segera setelah verifikasi disetujui atau maksimal 7 hari setelah ditolak** (masa banding). |
| NFR-08 | Keamanan | Login dibatasi percobaan berulang (rate limiting), dan sesi berakhir otomatis setelah tidak aktif. |
| NFR-09 | Keamanan | Callback pembayaran diverifikasi tanda tangannya dan diproses satu kali (idempoten) agar tidak ada dana ganda atau hilang *(berlaku mulai Rilis 2 untuk QRIS)*. |
| NFR-10 | Kepatuhan | Pengelolaan data pribadi mengikuti **UU No. 27 Tahun 2022 (UU PDP)**: pendaftaran wajib menyertakan persetujuan privasi yang secara eksplisit menyebut pembagian nomor WhatsApp kepada lawan transaksi setelah status pesanan `Dijadwalkan`, serta pengguna dapat melakukan **hapus akun mandiri** selama tanpa pesanan aktif (data pribadi dianonimkan tanpa merusak integritas riwayat transaksi dan ulasan selesai). |
| NFR-11 | Usability | Pengguna baru dapat membuat listing pertama dan memesan barang tanpa panduan tertulis. |
| NFR-12 | Usability | Antarmuka berbahasa Indonesia, mobile-first, kontras warna memadai, dan teks terbaca di layar ponsel. |
| NFR-13 | Ketersediaan | Layanan tersedia sedikitnya 99% per bulan di luar pemeliharaan terjadwal; proyek Supabase Free dipantau/di-keep-alive selama pilot aktif agar tidak *auto-pause* setelah 7 hari tanpa aktivitas. |
| NFR-14 | Keandalan | Basis data dicadangkan secara berkala dan dapat dipulihkan dari cadangan terakhir. |
| NFR-15 | Portabilitas | Web responsif berjalan di dua versi terbaru Chrome, Edge, Firefox, dan Safari. Aplikasi mobile berjalan di Android 8.0 ke atas *(target Rilis 2+)*. |
| NFR-16 | Pemeliharaan | Kode modular, versi Node.js (`>= 20.9`) dikunci lewat `engines` di `package.json`, dan API terdokumentasi. Konfigurasi operasional (daftar Spot COD, kategori, fakultas; serta fee dan tarif pada Rilis 2–3) dapat diubah administrator tanpa mengubah kode. |
| NFR-17 | Skalabilitas | Kapasitas server dan paket layanan dapat ditingkatkan (termasuk tinjauan ulang hosting sebelum Rilis 2) tanpa mengubah rancangan dasar sistem bila jumlah pengguna bertambah. |

## 6. LAMPIRAN

## 6.1 Aktor dan Use Case

Lima aktor berinteraksi dengan UnilakMart secara bertahap sesuai pembagian rilis. Pada **Rilis 1**, aktor aktif adalah **Pembeli** (mahasiswa aktif), **Penjual** (mahasiswa aktif termasuk UMKM), dan **Administrator**. **Penyedia pembayaran QRIS** aktif pada **Rilis 2**, dan **Kurir Mahasiswa** aktif pada **Rilis 3**.

| Aktor | Use case | Kebutuhan terkait |
| --- | --- | --- |
| Pembeli *(Rilis 1: Mahasiswa aktif; Rilis 2: Dosen/Tendik/Alumni)* | Mendaftar & verifikasi email + KTM; mengubah profil/sandi & hapus akun mandiri; mencari, memfilter, dan mengurutkan katalog; memesan listing, memilih 1 Spot COD & mengusulkan jam temu; membayar COD tunai; menghubungi penjual via WhatsApp (setelah `Dijadwalkan`); membatalkan pesanan dengan alasan; mengonfirmasi selesai; menilai penjual; melaporkan listing/kendala/*no-show* *(membayar QRIS & mengajukan sengketa escrow di Rilis 2; memilih & menilai kurir di Rilis 3)* | `FR-01` s.d. `FR-08`, `FR-12` s.d. `FR-14`, `FR-16`, `FR-17`, `FR-20` s.d. `FR-26` *(Rilis 2: `FR-27`, `FR-28`, `FR-31`; Rilis 3: `FR-35`, `FR-39`)* |
| Penjual *(Rilis 1: Mahasiswa aktif; Rilis 2: Dosen/Tendik/Alumni)* | Membuat, mengubah, menonaktifkan, dan menghapus listing (stok, kondisi, harga Rp0, Spot COD, tanda Etalase UMKM gratis); menerima atau menolak pesanan; menghubungi pembeli via WhatsApp (setelah `Dijadwalkan`); menandai `Sudah Diserahkan`; membatalkan pesanan dengan alasan; menilai pembeli; melaporkan kendala/*no-show* *(tarik saldo & beli featured listing berbayar di Rilis 2)* | `FR-08` s.d. `FR-11`, `FR-15`, `FR-16`, `FR-18`, `FR-20` s.d. `FR-25` *(Rilis 2: `FR-32`, `FR-40` s.d. `FR-43`)* |
| Administrator *(Rilis 1; fitur finansial pada Rilis 2)* | Memverifikasi KTM secara manual (dengan hapus foto otomatis); post-moderasi listing & barang/jasa terlarang; menangguhkan/memblokir akun; mengelola Spot COD, kategori, fakultas, dan akun UMKM; melihat dasbor ringkas *(memutuskan sengketa escrow, mengatur fee/tarif, & ekspor CSV pendapatan di Rilis 2; mengelola event & mitra di Rilis 3)* | `FR-03`, `FR-19`, `FR-46` s.d. `FR-49` *(Rilis 2: `FR-31`, `FR-48`, `FR-50`; Rilis 3: `FR-44`, `FR-45`)* |
| Penyedia pembayaran QRIS *(Rilis 2)* | Menerbitkan kode QRIS dinamis, menahan dana (escrow), dan mengirim status pembayaran via webhook | `FR-27` s.d. `FR-29`, `FR-41` |
| Kurir Mahasiswa *(Rilis 3)* | Mendaftar sebagai kurir; mengambil dan mengantar pesanan intra-kampus; menerima bagi hasil | `FR-34` s.d. `FR-39` |

## 6.2 Entitas Data Awal

Daftar ini merupakan bahan awal untuk perancangan skema database PostgreSQL (Supabase) dan ERD. Entitas Rilis 2–3 ditandai sesuai jadwal rilisnya.

| Entitas | Atribut utama | Relasi utama |
| --- | --- | --- |
| Pengguna | NIM, nama, prodi, fakultas, email, `email_terverifikasi`, nomor HP (WhatsApp), `persetujuan_uu_pdp`, status verifikasi, peran, `is_umkm`, `deleted_at` (penanda anonimisasi hapus akun mandiri) | Memiliki banyak Listing, Pesanan, Ulasan, dan Notifikasi |
| Verifikasi | Pengguna, path foto KTM (bucket privat; dihapus otomatis saat disetujui atau maks. 7 hari setelah ditolak), status, alasan penolakan, waktu proses | Milik satu Pengguna, diproses Administrator |
| Listing | Judul, deskripsi, `kondisi` (`Baru`/`Bekas Seperti Baru`/`Bekas Layak Pakai`), harga (`>= Rp0`), `stok` (atau flag `selalu_tersedia`), `is_umkm`, status (`Aktif`/`Nonaktif`/`Terjual`/`Disembunyikan`), kategori, fakultas, Spot COD yang didukung | Milik satu Pengguna, punya banyak Foto (maks. 5) dan terhubung ke banyak Spot COD |
| Kategori dan Fakultas | Nama, jenis (`kategori` / `fakultas`), status aktif | Mengelompokkan Listing |
| Spot COD | Nama, lokasi, jam layanan, status aktif | Dipakai oleh banyak Listing dan Pesanan |
| Pesanan | Kode pesanan, pembeli, penjual, listing, `jumlah`, Spot COD terpilih, `usulan_jam_temu`, `catatan`, status (`Menunggu`, `Dijadwalkan`, `Sudah Diserahkan`, `Selesai`, `Dibatalkan`, `Kedaluwarsa`), `alasan_batal`, `waktu_diserahkan`, metode bayar (`COD` di Rilis 1; `QRIS` di Rilis 2) | Milik satu Pembeli, Penjual, dan Listing; punya banyak Ulasan dan Laporan *(serta 1 Pembayaran & 0..1 Pengantaran pada Rilis 2–3)* |
| Ulasan | Pesanan, pemberi, penerima, bintang, komentar | Terkait satu Pesanan yang sudah `Selesai` |
| Laporan dan Sengketa | Pelapor, objek (`Listing`, `Pengguna`, atau `Pesanan` untuk kendala/*no-show*), alasan, catatan, status, keputusan Admin | Terkait Listing, Pengguna, atau Pesanan |
| Notifikasi | Penerima, jenis, isi, kanal (`in-app`, `email`), status baca | Milik satu Pengguna |
| Pembayaran *(Rilis 2)* | Pesanan, nominal, metode (`QRIS`), status escrow, admin fee, referensi webhook | Milik satu Pesanan |
| Pengantaran *(Rilis 3)* | Pesanan, kurir, tarif, bagian kurir, bagian platform, status | Milik satu Pesanan |
| Promosi *(Rilis 2)* | Listing, tanggal mulai, tanggal akhir, tarif, jumlah tayangan & klik | Milik satu Listing |

## 6.3 Keterlacakan ke Dokumen Ide Bisnis & Keputusan Rilis

| Bagian dokumen ide bisnis | Kebutuhan terkait | Target rilis |
| --- | --- | --- |
| Fitur 1: Verifikasi NIM kampus | `FR-01` s.d. `FR-08`, `NFR-07`, `NFR-10` | Rilis 1 |
| Fitur 2: Self-listing dan katalog per fakultas | `FR-09` s.d. `FR-16`, `NFR-03` | Rilis 1 |
| Fitur 3: Spot COD kampus | `FR-17` s.d. `FR-25` | Rilis 1 |
| Fitur 4: Kurir Mahasiswa | `FR-34` s.d. `FR-39` | Rilis 3 |
| Fitur 5: COD tunai (Rilis 1) & QRIS escrow (Rilis 2) | `FR-26` (Rilis 1); `FR-27` s.d. `FR-33`, `NFR-09` (Rilis 2) | Rilis 1 & 2 |
| Pendapatan: komisi transaksi non-tunai | `FR-29`, `FR-50` | Rilis 2 |
| Pendapatan: featured listing dan ads UMKM | `FR-40` s.d. `FR-43` (Etalase gratis di Rilis 1: `FR-15`) | Rilis 2 |
| Pendapatan: margin kurir | `FR-38` | Rilis 3 |
| Pendapatan: kemitraan event dan merchant | `FR-44`, `FR-45` | Rilis 3 |
| Keputusan Lingkup & Arsitektur MVP Rilis 1 | Seluruh penyesuaian di [DECISIONS.md](DECISIONS.md) | Rilis 1–3 |

## 6.4 Pertanyaan Terbuka (Status: Terjawab)

Seluruh 8 pertanyaan terbuka pada draf v1.0 telah disepakati pada 9 November 2026 dan dicatat lengkap dalam [DECISIONS.md](DECISIONS.md):

1. **Bagaimana verifikasi NIM dilakukan: manual oleh administrator atau terhubung ke basis data akademik Unilak?**
   **Terjawab:** Dilakukan **manual oleh Administrator** melalui foto KTM, disertai verifikasi email wajib saat pendaftaran.
2. **Dengan identitas apa dosen dan tenaga kependidikan diverifikasi?**
   **Terjawab:** Ditunda ke **Rilis 2**; Rilis 1 dikhususkan untuk **Mahasiswa aktif Unilak**.
3. **Penyedia pembayaran QRIS mana yang dipakai, dan apakah biayanya masih tertutup oleh admin fee 1% sampai 2%?**
   **Terjawab:** Ditunda ke **Rilis 2**; Rilis 1 berjalan murni dengan **COD tunai (0% biaya platform)**.
4. **Apakah perlu fitur chat dalam aplikasi, atau notifikasi dan kontak lewat profil sudah cukup?**
   **Terjawab:** Tanpa chat dalam aplikasi di Rilis 1; koordinasi memakai tombol **"Hubungi via WhatsApp"** yang baru terbuka setelah pesanan diterima (`Dijadwalkan`), ditambah catatan pesanan serta notifikasi in-app dan email.
5. **Aplikasi mobile dibuat untuk Android saja atau juga iOS?**
   **Terjawab:** Rilis 1 berfokus pada **100% Web Responsif (mobile-first, opsional PWA)**; aplikasi mobile native (target utama Android; iOS opsional) ditunda ke **Rilis 2+**.
6. **Barang atau jasa apa yang dilarang dijual (misalnya obat, minuman keras, atau barang ilegal)?**
   **Terjawab:** Dilarang keras: obat keras/narkotika, minuman keras, rokok/vape, senjata tajam/api, barang ilegal/curian/bajakan, konten dewasa/pornografi, serta **jasa joki tugas kuliah, ujian, dan skripsi**.
7. **Bagaimana kebijakan pengembalian dana saat sengketa, dan siapa menanggung barang rusak saat diantar kurir?**
   **Terjawab:** Kurir dan escrow belum ada di Rilis 1; pembeli wajib memeriksa barang langsung di Spot COD sebelum membayar tunai (tanpa *refund* lewat platform). Pelanggaran penipuan atau *no-show* ditindak lewat fitur Laporan (`FR-16`) dan blokir akun (`FR-47`).
8. **Apakah pihak kampus sudah menyetujui titik Spot COD dan keterlibatan Kurir Mahasiswa?**
   **Terjawab:** Kurir Mahasiswa ditunda ke **Rilis 3**; Spot COD pada Rilis 1 memakai titik awal yang dikonfigurasi Administrator sambil memproses izin resmi pihak kampus.
