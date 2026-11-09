## UNILAK MART PROJECT

## Software Requierements Specification

v1.0

04 – 11 – 2026

## Prepared by

- M. Hilal Akram

- M. Ashrafi fauzi

- Delvita Sari

- M. Zaydan Hilmi

Iman Muzamir


## 1. PENDAHULUAN

Dokumen ini menetapkan kebutuhan perangkat lunak UnilakMart, marketplace dan thrift kampus khusus sivitas akademika Universitas Lancang Kuning (Unilak), supaya pengembangan, pengujian, dan penilaian tugas memakai acuan yang sama.

| Item | Keterangan |
| --- | --- |
| Nama produk | UnilakMart |
| Versi dokumen | 1.0 (draf) |
| Mata kuliah | Technopreneurship |
| Tim | M. Ashrafi Fauzi, Delvita Sari Br. Pardede, M. Hilal Akram, M. Zaydan Hilmi, Iman Muzamir |
| Dasar penyusunan | Dokumen Ide Bisnis Pertemuan 1 |

## 1.1 Tujuan

SRS ini menjelaskan apa yang harus dilakukan UnilakMart, bukan bagaimana cara membangunnya. Pembaca utamanya adalah dosen penilai dan anggota tim pengembang. Setiap kebutuhan diberi kode unik agar mudah dilacak ke fitur, desain, dan pengujian.

## 1.2 Ruang Lingkup

UnilakMart adalah platform jual-beli barang bekas layak pakai (thrift/preloved) dan produk UMKM mahasiswa dalam bentuk website responsif dan aplikasi mobile. Tujuannya menyelesaikan empat masalah mahasiswa Unilak: buku dan modul mahal, barang kos yang mengendap, rawan penipuan di grup umum, dan UMKM mahasiswa tanpa etalase terpusat.

Yang termasuk dalam lingkup:

- Verifikasi identitas pengguna dengan NIM/KTM Unilak

- Self-listing barang dan katalog per fakultas dengan pencarian dan filter

- Penetapan Spot COD di area kampus

- Layanan Kurir Mahasiswa intra-kampus

- Pembayaran COD tunai dan QRIS dengan escrow

- Promosi berbayar (featured listing) untuk UMKM

- Pengelolaan oleh administrator


## Yang tidak termasuk:

- Melayani pengguna di luar sivitas akademika Unilak (trade-off strategi niche pada dokumen ide bisnis)

- Pengiriman ekspedisi antar-kota

## 1.3 Definisi, Akronim, dan Singkatan

| Istilah | Arti |
| --- | --- |
| SRS | Software Requirements Specification, dokumen spesifikasi kebutuhan perangkat lunak |
| Unilak | Universitas Lancang Kuning |
| Sivitas akademika | Mahasiswa, dosen, dan tenaga kependidikan Unilak |
| NIM | Nomor Induk Mahasiswa |
| KTM | Kartu Tanda Mahasiswa |
| Thrift / preloved | Barang bekas yang masih layak pakai |
| Listing | Unggahan satu barang atau produk yang dijual di platform |
| COD | Cash on Delivery, pembayaran tunai saat barang diterima |
| Spot COD | Titik temu resmi di kampus untuk transaksi COD, misalnya gazebo fakultas, perpustakaan pusat, kantin, atau area Rusunawa |
| QRIS | Standar kode QR pembayaran nasional |
| Escrow / Rekening Bersama | Dana pembeli ditahan sistem dan baru diteruskan ke penjual setelah pembeli mengonfirmasi barang diterima |
| Kurir Mahasiswa | Mahasiswa yang mengantar pesanan jarak dekat di dalam kampus dan sekitar Rumbai |
| Featured listing | Promosi berbayar agar listing tampil di bagian atas halaman utama |
| UMKM | Usaha Mikro, Kecil, dan Menengah |
| BEM / Hima | Badan Eksekutif Mahasiswa / Himpunan Mahasiswa |
| FR / NFR | Functional Requirement / Non-Functional Requirement |


## 1.4 Referensi

- IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications (digantikan oleh ISO/IEC/IEEE 29148)

- Tugas Kelompok Pertemuan 1 Technopreneurship: Ide Bisnis UnilakMart

## 1.5 Gambaran Umum Dokumen

Bagian 2 menjelaskan konteks produk, pengguna, batasan, dan asumsi. Bagian 3 mendefinisikan antarmuka eksternal. Bagian 4 memuat kebutuhan fungsional per fitur, dan Bagian 5 kebutuhan non-fungsional. Bagian 6 berisi lampiran pendukung.

Konvensi penulisan: kebutuhan fungsional berkode FR-xx dan non-fungsional NFR-xx. Prioritas memakai tiga tingkat: Wajib (harus ada di rilis pertama), Penting (sangat diharapkan), dan Opsional (bila waktu tersedia).


## 2. DESKRIPSI UMUM

UnilakMart adalah produk baru yang berdiri sendiri, berupa ekosistem tertutup untuk sivitas akademika Unilak, dengan dua sistem eksternal: penyedia pembayaran QRIS dan sumber data untuk memverifikasi identitas kampus.

## 2.1 Perspektif Produk

UnilakMart bukan turunan dari sistem lain. Sistem ini terdiri dari website responsif dan aplikasi mobile yang memakai satu basis data dan satu layanan backend yang sama, sehingga data pengguna, listing, dan pesanan konsisten di kedua platform. Dibanding marketplace umum (Shopee, Tokopedia, Facebook Marketplace), UnilakMart sengaja menyempit ke satu komunitas agar transaksi lebih aman, tanpa ongkos kirim ekspedisi, dan relevan dengan kebutuhan kuliah di kampus Rumbai.

## 2.2 Fungsi Produk

|   | Kode Fungsi utama | Ringkasan |
| --- | --- | --- |
| F1 | Autentikasi dan verifikasi NIM | Hanya pengguna terverifikasi yang dapat menjual dan bertransaksi |
| F2 | Self-listing dan katalog | Unggah barang dalam kurang dari 1 menit, cari dengan filter per fakultas dan kategori |
| F3 | Spot COD kampus | Pilih titik temu resmi dan jam transaksi di dalam kampus |
| F4 | Kurir Mahasiswa | Pengantaran jarak dekat oleh mahasiswa yang punya jam kosong |
| F5 | Pembayaran | COD tunai dan QRIS dengan escrow |
| F6 | Promosi UMKM | Featured listing berbayar per minggu |
| F7 | Administrasi | Moderasi listing, verifikasi pengguna, laporan, dan pengaturan |


## 2.3 Karakteristik Pengguna

| Pengguna | Siapa | Peran di sistem | Kemahiran teknis |
| --- | --- | --- | --- |
| Pembeli | Mahasiswa, dosen, tenaga kependidikan, alumni baru | Mencari, memesan, membayar, dan menilai | Dasar: terbiasa dengan aplikasi belanja dan chat |
| Penjual | Mahasiswa aktif, mahasiswa tingkat akhir, alumni baru, dosen, tenaga kependidikan | Membuat dan mengelola listing barang bekas | Dasar |
|   | Penjual UMKM Wirausaha mahasiswa, pengurus BEM/Hima, freelancer kampus | Menjual produk atau jasa, membeli featured listing | Dasar sampai menengah |
|   | Kurir Mahasiswa Mahasiswa dengan jam kosong | Menerima dan mengantar pesanan jarak dekat | Dasar |
| Administrator | Pengelola UnilakMart | Verifikasi, moderasi, penanganan laporan, laporan keuangan | Menengah |

Satu akun dapat berperan sebagai pembeli dan penjual sekaligus. Peran Kurir Mahasiswa diaktifkan lewat pendaftaran tambahan.

## 2.4 Batasan

- Akses hanya untuk sivitas akademika Unilak yang identitasnya terverifikasi.

- Transaksi tatap muka hanya di Spot COD resmi yang disetujui pihak kampus.

- Pembayaran non-tunai hanya melalui QRIS lewat penyedia pembayaran berlisensi, karena sistem tidak boleh menyimpan dana pengguna sendiri tanpa izin.

- Pengelolaan data pribadi mengikuti UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.

- Tim pengembang adalah mahasiswa dengan modal terbatas, sehingga pemilihan teknologi mengutamakan biaya rendah.


## 2.5 Asumsi dan Ketergantungan

- Pengguna memiliki smartphone atau perangkat dengan akses internet.

- Pihak kampus mengizinkan titik-titik Spot COD dipakai untuk transaksi.

- Penyedia pembayaran QRIS tersedia dan bersedia bekerja sama.

- Verifikasi NIM dilakukan dengan NIM dan foto KTM yang ditinjau administrator. Integrasi otomatis dengan basis data akademik kampus tidak diasumsikan, kecuali pihak kampus menyediakannya.

- Dosen dan tenaga kependidikan diverifikasi dengan identitas kepegawaian Unilak (asumsi, perlu dikonfirmasi).

## 2.6 Pembagian Rilis (Usulan)

Supaya realistis untuk tim mahasiswa, kebutuhan dibagi ke tiga rilis. Pembagian ini usulan dan bisa disesuaikan.

| Rilis | Isi | Prioritas |
| --- | --- | --- |
| 1 (MVP) | Verifikasi NIM, self-listing, katalog dan pencarian, pesanan, Spot COD, pembayaran COD tunai, administrasi | Wajib |
| 2 | Pembayaran QRIS dengan escrow, featured listing | Penting |
| 3 | Kurir Mahasiswa, kemitraan event dan merchant | Opsional |


## 3. KEBUTUHAN ANTARMUKA EKSTERNAL

UnilakMart berinteraksi dengan pengguna lewat browser dan aplikasi mobile, dengan penyedia pembayaran QRIS lewat API, dan dengan layanan notifikasi.

## 3.1 Antarmuka Pengguna

| Kode | Ketentuan |
| --- | --- |
| UI-01 | Tampilan responsif dan nyaman dipakai di layar ponsel, tablet, dan desktop. |
| UI-02 | Navigasi utama sama di web dan aplikasi mobile: Beranda, Cari, Jual, Pesanan, Profil. |
| UI-03 | Halaman utama menampilkan featured listing di bagian atas, lalu listing terbaru, dan pintasan kategori. |
| UI-04 | Form listing berisi foto, deskripsi kondisi, harga, dan kategori dalam satu layar agar dapat diisi kurang dari 1 menit. |
| UI-05 | Profil penjual menampilkan nama asli, program studi, fakultas, dan lencana Terverifikasi. |
| UI-06 | Bahasa antarmuka Bahasa Indonesia. |
| UI-07 | Pesan kesalahan ditulis dalam bahasa yang mudah dipahami dan menyebut langkah perbaikan. |

Halaman utama yang harus tersedia: masuk dan daftar, verifikasi identitas, beranda dan katalog, detail listing, form listing, pemilihan Spot COD dan jam, pembayaran, riwayat pesanan, dasbor Kurir Mahasiswa, dan panel administrator.

## 3.2 Antarmuka Perangkat Keras

- Perangkat pengguna: smartphone atau komputer dengan kamera (untuk foto barang dan foto KTM) dan koneksi internet.

- Aplikasi dompet digital atau mobile banking milik pembeli untuk memindai dan membayar kode QRIS.

- Server dan penyimpanan di layanan cloud atau hosting, dengan spesifikasi ditentukan pada tahap perancangan.


## 3.3 Antarmuka Perangkat Lunak

| Komponen | Kegunaan |
| --- | --- |
| Browser modern (Chrome, Edge, Firefox, Safari: dua versi terbaru) | Mengakses versi web |
| Aplikasi mobile (Android sebagai target utama; iOS opsional) | Mengakses versi mobile |
| API penyedia pembayaran QRIS | Membuat tagihan QRIS, menahan dana (escrow), dan menerima status pembayaran |
| Layanan notifikasi (push dan email) | Mengabarkan status pesanan, verifikasi, dan pembayaran |
| Penyimpanan berkas gambar | Foto listing dan foto KTM |
| Basis data | Data pengguna, listing, pesanan, pembayaran, dan Spot COD |

## 3.4 Antarmuka Komunikasi

- Seluruh komunikasi klien dan server memakai HTTPS.

- Web dan aplikasi mobile mengakses layanan backend yang sama melalui API.

- Status pembayaran dari penyedia QRIS diterima lewat callback (webhook) yang diverifikasi tanda tangannya.


## 4. KEBUTUHAN FUNGSIONAL

Bagian ini memuat kebutuhan per fungsi utama (F1 sampai F7). Prioritas mengikuti pembagian rilis di bagian 2.6: Wajib untuk rilis 1, Penting untuk rilis 2, dan Opsional untuk rilis 3. Pengecualian ditandai di kolom prioritas.

## 4.1 Registrasi, Autentikasi, dan Verifikasi NIM (F1)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-01 | Sistem harus menyediakan pendaftaran akun dengan NIM, nama lengkap, program studi, fakultas, email, nomor HP, dan kata sandi. | Wajib |
| FR-02 | Sistem harus meminta foto KTM Unilak untuk verifikasi identitas dan menampilkan status akun: Belum Verifikasi, Menunggu, Terverifikasi, atau Ditolak. | Wajib |
| FR-03 | Administrator harus dapat menyetujui atau menolak verifikasi dengan alasan, dan pengguna menerima notifikasi hasilnya. | Wajib |
| FR-04 | Hanya akun Terverifikasi yang dapat membuat listing, memesan, dan bertransaksi. Akun lain hanya dapat melihat katalog. | Wajib |
| FR-05 | Sistem harus menolak NIM yang sudah dipakai akun lain (satu NIM, satu akun). | Wajib |
| FR-06 | Pengguna harus dapat masuk dengan NIM atau email dan kata sandi, serta mengatur ulang kata sandi lewat email. | Wajib |
| FR-07 | Profil penjual harus menampilkan nama asli, program studi, fakultas, dan lencana Terverifikasi. | Wajib |
| FR-08 | Pengguna harus dapat mengubah data profil dan kata sandi. | Penting |

## 4.2 Self-Listing dan Katalog (F2)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-09 | Penjual harus dapat membuat listing berisi foto (maksimal 5), judul, deskripsi kondisi, harga, dan kategori. | Wajib |
| FR-10 | Penjual harus dapat mengubah, menonaktifkan, menghapus, dan menandai listing miliknya sebagai terjual. | Wajib |
| FR-11 | Sistem harus menyediakan kategori: Buku dan Modul, Elektronik, Perabot Kos, Pakaian, Produk UMKM, Jasa (desain, pemrograman), dan Jajanan Kampus. | Wajib |


| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-12 | Katalog harus dapat difilter per fakultas, misalnya Modul Fasilkom. | Wajib |
| FR-13 | Sistem harus menyediakan pencarian kata kunci dengan filter kategori, fakultas, rentang harga, dan kondisi barang. | Wajib |
| FR-14 | Hasil katalog harus dapat diurutkan menurut terbaru, harga terendah, dan harga tertinggi. | Penting |
| FR-15 | Penjual UMKM harus dapat menandai listing sebagai produk atau jasa UMKM agar tampil di etalase UMKM. | Penting (rilis 1) |
| FR-16 | Pengguna harus dapat melaporkan listing atau pengguna yang melanggar aturan. | Wajib |

## 4.3 Pesanan dan Spot COD (F3)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-17 | Pembeli harus dapat memesan listing yang tersedia, dan sistem mengunci listing agar tidak dipesan ganda. | Wajib |
| FR-18 | Penjual harus dapat menerima atau menolak pesanan. Pesanan yang tidak dijawab dalam batas waktu yang diatur administrator (usulan awal 24 jam) kedaluwarsa otomatis dan listing dibuka kembali. | Wajib |
|   | FR-19 Administrator harus dapat mengelola daftar Spot COD: nama, lokasi, jam layanan, dan status aktif. | Wajib |
| FR-20 | Setelah pesanan diterima, pembeli dan penjual harus dapat memilih Spot COD dan jam temu dari pilihan yang tersedia, dan kedua pihak menerima notifikasi jadwal. | Wajib |
| FR-21 | Sistem harus menampilkan status pesanan: Menunggu, Diterima, Dijadwalkan, Selesai, atau Dibatalkan. | Wajib |
| FR-22 | Pembeli harus dapat menandai pesanan Selesai setelah barang diterima, dan listing otomatis berstatus Terjual. | Wajib |
| FR-23 | Pembeli atau penjual harus dapat membatalkan pesanan sebelum pertemuan dengan menyebut alasan, dan listing dibuka kembali. | Penting (rilis 1) |
| FR-24 | Setelah pesanan selesai, pembeli dan penjual harus dapat saling memberi penilaian bintang dan ulasan singkat. | Penting |
| FR-25 | Sistem harus mengirim notifikasi untuk perubahan status verifikasi, pesanan, pembayaran, dan pengantaran. | Wajib |


## 4.4 Pembayaran (F5)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-26 | Sistem harus mendukung pembayaran COD tunai di Spot COD tanpa biaya platform. | Wajib |
| FR-27 | Sistem harus membuat kode QRIS dinamis sesuai nominal pesanan untuk pembayaran non-tunai. | Penting |
| FR-28 | Pada pembayaran QRIS, dana harus ditahan (escrow) sampai pembeli mengonfirmasi barang diterima dengan baik. | Penting |
| FR-29 | Setelah konfirmasi pembeli, sistem harus meneruskan dana ke saldo penjual dikurangi admin fee 1% sampai 2% dari nilai transaksi. | Penting |
| FR-30 | Jika pembeli tidak mengonfirmasi dan tidak mengajukan sengketa dalam batas waktu yang diatur administrator (usulan awal 2 hari setelah jadwal temu), dana diteruskan otomatis ke penjual. | Penting |
| FR-31 | Pembeli harus dapat mengajukan sengketa sebelum konfirmasi. Dana tetap ditahan sampai administrator memutuskan. | Penting |
| FR-32 | Penjual harus dapat melihat saldo dan menarik dana ke rekening bank atau dompet digital. | Penting |
| FR-33 | Sistem harus mencatat riwayat setiap transaksi pembayaran sebagai jejak audit yang tidak dapat diubah pengguna. | Penting |

## 4.5 Kurir Mahasiswa Intra-Kampus (F4)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-34 | Pengguna terverifikasi harus dapat mendaftar sebagai Kurir Mahasiswa dan mengatur status aktif atau nonaktif. | Opsional |
| FR-35 | Saat memesan, pembeli harus dapat memilih pengantaran Kurir Mahasiswa dan melihat tarif Rp3.000 sampai Rp5.000 sekali jalan sesuai jarak. | Opsional |
| FR-36 | Pesanan pengantaran harus tampil di dasbor kurir aktif, dan satu kurir dapat mengambilnya. | Opsional |
| FR-37 | Sistem harus menampilkan status pengantaran: Diambil Kurir, Dalam Perjalanan, Sampai, dan Selesai. | Opsional |
| FR-38 | Tarif kurir harus dibagi otomatis: 80% sampai 85% ke saldo kurir dan 15% sampai 20% ke kas platform. | Opsional |
| FR-39 | Pembeli harus dapat menilai kurir setelah pengantaran selesai. | Opsional |


## 4.6 Promosi UMKM (F6)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-40 | Penjual UMKM harus dapat membeli featured listing (boost post) atau slot banner atas untuk durasi mingguan dengan tarif Rp5.000 sampai Rp15.000 per minggu. | Penting |
| FR-41 | Pembayaran featured listing harus dilakukan lewat QRIS. | Penting |
| FR-42 | Listing yang dipromosikan harus tampil di bagian atas beranda dengan label Promosi selama masa aktif, lalu kembali ke urutan biasa setelah masa aktif habis. | Penting |
| FR-43 | Penjual harus dapat melihat jumlah tayangan dan klik listing yang dipromosikan. | Opsional |

## 4.7 Kemitraan Event dan Merchant

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-44 | Administrator harus dapat membuat halaman event (seminar atau bazar BEM/Hima) dan slot promosi bagi usaha sekitar kampus. | Opsional |
| FR-45 | Sistem harus mencatat komisi tiket atau paket sponsor dari mitra. Rincian mekanisme penjualan tiket ditetapkan pada rilis 3. | Opsional |

## 4.8 Administrasi (F7)

| Kode | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-46 | Administrator harus dapat melihat laporan listing atau pengguna, lalu menyembunyikan atau menghapus listing yang melanggar. | Wajib |
| FR-47 | Administrator harus dapat menangguhkan atau memblokir akun yang melanggar aturan. | Wajib |
| FR-48 | Administrator harus dapat mengelola kategori, fakultas, daftar Spot COD, persentase admin fee, dan tarif promosi serta kurir. | Wajib |
| FR-49 | Dasbor administrator harus menampilkan jumlah pengguna, listing aktif, transaksi, dan pendapatan. | Penting |
| FR-50 | Administrator harus dapat mengekspor laporan pendapatan per sumber (komisi, featured listing, kurir, kemitraan) dalam format CSV. | Penting |


## 5. KEBUTUHAN NON-FUNGSIONAL

Angka target di bawah adalah usulan awal untuk skala satu kampus (12.000+ mahasiswa aktif) dan perlu diuji pada tahap pengujian.

| Kode | Kategori | Kebutuhan |
| --- | --- | --- |
| NFR-01 | Performa | Halaman katalog dan detail listing termuat dalam 3 detik atau kurang untuk 95% permintaan pada koneksi 4G normal. |
| NFR-02 | Performa | Sistem melayani sedikitnya 500 pengguna aktif bersamaan tanpa penurunan layanan yang berarti. |
| NFR-03 | Performa | Pengguna dapat menyelesaikan satu listing (foto, deskripsi, harga, kategori) dalam kurang dari 1 menit; foto dikompres otomatis sebelum diunggah. |
| NFR-04 | Keamanan | Kata sandi disimpan dalam bentuk hash dengan algoritma modern (misalnya bcrypt atau Argon2), tidak pernah dalam teks biasa. |
| NFR-05 | Keamanan | Seluruh lalu lintas memakai HTTPS. Sistem terlindung dari kerentanan umum OWASP Top 10, termasuk SQL injection, XSS, dan CSRF. |
| NFR-06 | Keamanan | Hak akses berbasis peran: pembeli, penjual, kurir, dan administrator hanya dapat mengakses fungsi sesuai perannya. |
| NFR-07 | Keamanan | Foto KTM hanya dapat dilihat pemilik akun dan administrator, disimpan terenkripsi, dan dihapus setelah verifikasi selesai (usulan 30 hari). |
| NFR-08 | Keamanan | Login dibatasi percobaan berulang (rate limiting), dan sesi berakhir otomatis setelah tidak aktif. |
| NFR-09 | Keamanan | Callback pembayaran diverifikasi tanda tangannya dan diproses satu kali (idempoten) agar tidak ada dana ganda atau hilang. |
| NFR-10 | Kepatuhan | Pengelolaan data pribadi mengikuti UU No. 27 Tahun 2022: persetujuan pengguna saat mendaftar, dan pengguna dapat meminta penghapusan akunnya. |
| NFR-11 | Usability | Pengguna baru dapat membuat listing pertama dan memesan barang tanpa panduan tertulis. |
| NFR-12 | Usability | Antarmuka berbahasa Indonesia, kontras warna memadai, dan teks terbaca di layar ponsel. |
| NFR-13 | Ketersediaan | Layanan tersedia sedikitnya 99% per bulan di luar pemeliharaan terjadwal. |


| Kode | Kategori | Kebutuhan |
| --- | --- | --- |
| NFR-14 | Keandalan | Basis data dicadangkan setiap hari dan dapat dipulihkan dari cadangan terakhir. |
| NFR-15 | Portabilitas | Web berjalan di dua versi terbaru Chrome, Edge, Firefox, dan Safari. Aplikasi mobile berjalan di Android 8.0 ke atas. |
| NFR-16 | Pemeliharaan | Kode modular dan API terdokumentasi. Persentase fee dan tarif dapat diubah administrator tanpa mengubah kode. |
| NFR-17 | Skalabilitas | Kapasitas server dapat ditambah tanpa mengubah rancangan sistem bila jumlah pengguna bertambah. |


## 6. LAMPIRAN

## 6.1 Aktor dan Use Case

Lima aktor berinteraksi dengan UnilakMart. Penyedia pembayaran QRIS adalah aktor sistem eksternal, bukan pengguna manusia.

| Aktor | Use case | Kebutuhan terkait |
| --- | --- | --- |
| Pembeli | Mendaftar dan verifikasi NIM; mencari dan memfilter katalog; memesan barang; memilih Spot COD dan jam; membayar COD atau QRIS; mengonfirmasi barang diterima; mengajukan sengketa; menilai penjual dan kurir; melaporkan listing | FR-01 sampai FR-07, FR- 13, FR-16, FR-17, FR-20 sampai FR-22, FR-24, FR- 26 sampai FR-28, FR-31 |
| Penjual | Membuat, mengubah, dan menghapus listing; menerima atau menolak pesanan; memilih Spot COD dan jam; menarik saldo; membeli featured listing (penjual UMKM) | FR-09, FR-10, FR-15, FR- 18, FR-20, FR-32, FR-40 sampai FR-43 |
| Kurir Mahasiswa | Mendaftar sebagai kurir; mengambil dan mengantar pesanan; menerima bagi hasil | FR-34 sampai FR-39 |
|   | Administrator Memverifikasi pengguna; memoderasi listing; memblokir akun; mengelola Spot COD, kategori, dan tarif; memutuskan sengketa; melihat dan mengekspor laporan | FR-03, FR-19, FR-31, FR- 44 sampai FR-50 |
| Penyedia pembayaran QRIS | Menerbitkan QRIS, menahan dana, dan mengirim status pembayaran | FR-27 sampai FR-29, FR- 41 |

## 6.2 Entitas Data Awal

Daftar ini bahan awal untuk ERD. Diagram ERD lengkap dibuat pada tahap perancangan.

| Entitas | Atribut utama | Relasi utama |
| --- | --- | --- |
| Pengguna | NIM, nama, prodi, fakultas, email, nomor HP, status verifikasi, peran | Memiliki banyak Listing dan Pesanan |
| Verifikasi | Pengguna, foto KTM, status, alasan penolakan, waktu | Milik satu Pengguna, diproses Administrator |
| Listing | Judul, deskripsi kondisi, harga, status, kategori, fakultas | Milik satu Pengguna, punya banyak Foto |
| Kategori dan Fakultas Nama |   | Mengelompokkan Listing |


| Entitas | Atribut utama | Relasi utama |
| --- | --- | --- |
| Spot COD | Nama, lokasi, jam layanan, status aktif Dipakai oleh banyak | Pesanan |
| Pesanan | Pembeli, penjual, listing, Spot COD, jadwal, status, metode bayar | Punya satu Pembayaran dan nol atau satu Pengantaran |
| Pembayaran | Nominal, metode (COD atau QRIS), status escrow, admin fee | Milik satu Pesanan |
| Pengantaran | Kurir, tarif, bagian kurir, bagian platform, status | Milik satu Pesanan |
| Ulasan | Pemberi, penerima, bintang, komentar Terkait satu Pesanan |   |
| Laporan dan Sengketa | Pelapor, objek, alasan, status, keputusan Terkait Listing, Pengguna, | atau Pesanan |
| Promosi | Listing, tanggal mulai, tanggal akhir, tarif | Milik satu Listing |
| Notifikasi | Penerima, jenis, isi, status baca | Milik satu Pengguna |

## 6.3 Keterlacakan ke Dokumen Ide Bisnis

| Bagian dokumen ide bisnis | Kebutuhan terkait |
| --- | --- |
| Fitur 1: Verifikasi NIM kampus | FR-01 sampai FR-08, NFR-07 |
| Fitur 2: Self-listing dan katalog per fakultas | FR-09 sampai FR-16, NFR-03 |
| Fitur 3: Spot COD kampus | FR-17 sampai FR-25 |
| Fitur 4: Kurir Mahasiswa | FR-34 sampai FR-39 |
| Fitur 5: COD tunai dan QRIS escrow | FR-26 sampai FR-33, NFR-09 |
| Pendapatan: komisi transaksi non-tunai | FR-29 |
| Pendapatan: featured listing dan ads UMKM | FR-40 sampai FR-43 |
| Pendapatan: margin kurir | FR-38 |
| Pendapatan: kemitraan event dan merchant | FR-44, FR-45 |


## 6.4 Pertanyaan Terbuka

- 1. Bagaimana verifikasi NIM dilakukan: manual oleh administrator atau terhubung ke basis data akademik Unilak?

- 2. Dengan identitas apa dosen dan tenaga kependidikan diverifikasi?

- 3. Penyedia pembayaran QRIS mana yang dipakai, dan apakah biayanya masih tertutup oleh admin fee 1% sampai 2%?

- 4. Apakah perlu fitur chat dalam aplikasi, atau notifikasi dan kontak lewat profil sudah cukup?

- 5. Aplikasi mobile dibuat untuk Android saja atau juga iOS?

- 6. Barang atau jasa apa yang dilarang dijual (misalnya obat, minuman keras, atau barang ilegal)?

- 7. Bagaimana kebijakan pengembalian dana saat sengketa, dan siapa menanggung barang rusak saat diantar kurir?

- 8. Apakah pihak kampus sudah menyetujui titik Spot COD dan keterlibatan Kurir Mahasiswa?
