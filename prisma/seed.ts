import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Expense categories (10)
  { name: 'Makanan', icon: 'restaurant', color: '#FF6B6B', type: 'expense', sortOrder: 1 },
  { name: 'Transportasi', icon: 'directions_car', color: '#4ECDC4', type: 'expense', sortOrder: 2 },
  { name: 'Belanja', icon: 'shopping_bag', color: '#FFE66D', type: 'expense', sortOrder: 3 },
  {
    name: 'Tagihan & Utilitas',
    icon: 'receipt_long',
    color: '#A8E6CF',
    type: 'expense',
    sortOrder: 4,
  },
  { name: 'Kesehatan', icon: 'local_hospital', color: '#FF8A80', type: 'expense', sortOrder: 5 },
  { name: 'Pendidikan', icon: 'school', color: '#82B1FF', type: 'expense', sortOrder: 6 },
  { name: 'Hiburan', icon: 'sports_esports', color: '#EA80FC', type: 'expense', sortOrder: 7 },
  { name: 'Investasi', icon: 'trending_up', color: '#B9F6CA', type: 'expense', sortOrder: 8 },
  { name: 'Tabungan', icon: 'savings', color: '#FFD180', type: 'expense', sortOrder: 9 },
  { name: 'Lainnya', icon: 'more_horiz', color: '#CFD8DC', type: 'expense', sortOrder: 10 },

  // Income categories (5)
  {
    name: 'Gaji',
    icon: 'account_balance_wallet',
    color: '#34C759',
    type: 'income',
    sortOrder: 11,
  },
  { name: 'Bonus', icon: 'card_giftcard', color: '#B9F6CA', type: 'income', sortOrder: 12 },
  { name: 'Investasi', icon: 'trending_up', color: '#82B1FF', type: 'income', sortOrder: 13 },
  { name: 'Freelance', icon: 'laptop_mac', color: '#4ECDC4', type: 'income', sortOrder: 14 },
  { name: 'Lainnya', icon: 'more_horiz', color: '#CFD8DC', type: 'income', sortOrder: 15 },
];

async function main() {
  console.log('Seeding default categories...');

  const existingNames = await prisma.category.findMany({
    select: { name: true, type: true },
  });
  const existingSet = new Set(existingNames.map((c) => `${c.name}:${c.type}`));

  const toCreate = defaultCategories.filter((cat) => !existingSet.has(`${cat.name}:${cat.type}`));

  if (toCreate.length === 0) {
    console.log(`All ${defaultCategories.length} categories already exist. Skipping.`);
  } else {
    await prisma.category.createMany({
      data: toCreate.map((c) => ({ ...c, isDefault: true })),
    });
    console.log(`Created ${toCreate.length} categories.`);
  }

  // ── Banners (3) ────────────────────────────────────────
  await seedBanners();

  // ── News (10) ──────────────────────────────────────────
  await seedNews();

  console.log('Seed completed.');
}

// ═══════════════════════════════════════════════════════════
// Banner Seeder
// ═══════════════════════════════════════════════════════════
const defaultBanners = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    title: 'Kelola Keuangan Keluarga Lebih Mudah',
    sortOrder: 1,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    title: 'Pantau Pengeluaran Harian',
    sortOrder: 2,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80',
    title: 'Rencanakan Anggaran Bulanan',
    sortOrder: 3,
  },
];

async function seedBanners() {
  console.log('Seeding banners...');
  const existing = await prisma.banner.count();
  if (existing > 0) {
    console.log(`${existing} banners already exist. Skipping.`);
    return;
  }
  await prisma.banner.createMany({
    data: defaultBanners.map((b) => ({ ...b, isActive: true })),
  });
  console.log(`Created ${defaultBanners.length} banners.`);
}

// ═══════════════════════════════════════════════════════════
// News Seeder
// ═══════════════════════════════════════════════════════════
const defaultNews = [
  {
    title: 'Tips Mengelola Keuangan Rumah Tangga di Tahun 2026',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    content: `# Tips Mengelola Keuangan Rumah Tangga

Mengelola keuangan keluarga membutuhkan perencanaan yang matang. Berikut beberapa tips yang bisa Anda terapkan:

## 1. Buat Anggaran Bulanan
Tentukan alokasi untuk setiap kategori pengeluaran. Pastikan pemasukan selalu lebih besar dari pengeluaran.

## 2. Catat Setiap Transaksi
Pencatatan rutin membantu Anda memahami pola pengeluaran dan menemukan area yang bisa dihemat.

## 3. Siapkan Dana Darurat
Idealnya, dana darurat mencakup **3-6 bulan** pengeluaran rutin keluarga.

- Mulai dari nominal kecil
- Konsisten menabung setiap bulan
- Simpan di rekening terpisah`,
  },
  {
    title: 'Cara Mudah Menghemat Pengeluaran Harian',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-uj4ede2e0r31?w=800&q=80',
    content: `# Cara Mudah Menghemat Pengeluaran Harian

Penghematan dimulai dari kebiasaan kecil sehari-hari.

## Bawa Bekal dari Rumah
Memasak sendiri bisa menghemat hingga **50%** dibanding makan di luar setiap hari.

## Gunakan Transportasi Umum
Pertimbangkan untuk menggunakan transportasi umum atau *carpooling* untuk menghemat biaya bahan bakar.

## Hindari Belanja Impulsif
Buat daftar belanja sebelum pergi ke toko dan patuhi daftar tersebut.

- Tunggu 24 jam sebelum beli barang non-esensial
- Bandingkan harga di beberapa toko
- Manfaatkan promo dan diskon dengan bijak`,
  },
  {
    title: 'Pentingnya Dana Darurat untuk Keluarga',
    imageUrl: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80',
    content: `# Pentingnya Dana Darurat

Dana darurat adalah **jaring pengaman finansial** yang harus dimiliki setiap keluarga.

## Berapa Idealnya?
- Lajang: 3-6 bulan pengeluaran
- Menikah tanpa anak: 6-9 bulan pengeluaran
- Menikah dengan anak: 9-12 bulan pengeluaran

## Cara Membangun Dana Darurat
1. Tentukan target nominal
2. Sisihkan **10-20%** dari penghasilan bulanan
3. Simpan di instrumen yang likuid
4. Jangan gunakan untuk keperluan non-darurat`,
  },
  {
    title: 'Investasi Sederhana untuk Pemula',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    content: `# Investasi Sederhana untuk Pemula

Mulai berinvestasi tidak harus dengan modal besar.

## Pilihan Investasi untuk Pemula

### Reksa Dana
Cocok untuk pemula karena dikelola oleh manajer investasi profesional. Bisa mulai dari **Rp 10.000**.

### Emas
Investasi klasik yang relatif aman. Tersedia dalam bentuk digital maupun fisik.

### Deposito
Risiko rendah dengan imbal hasil yang pasti. Cocok untuk dana darurat jangka pendek.

## Tips Memulai
- Pelajari profil risiko Anda
- Mulai dari nominal kecil
- Diversifikasi portofolio
- *Konsisten* lebih penting dari nominal besar`,
  },
  {
    title: 'Mengajarkan Anak tentang Uang Sejak Dini',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    content: `# Mengajarkan Anak tentang Uang

Literasi keuangan sebaiknya diajarkan sejak dini agar anak tumbuh dengan kebiasaan finansial yang baik.

## Usia 3-5 Tahun
- Kenalkan konsep uang melalui permainan
- Ajarkan perbedaan **kebutuhan** dan **keinginan**

## Usia 6-10 Tahun
- Berikan uang saku mingguan
- Ajarkan menabung untuk membeli sesuatu
- Buat celengan transparan agar mereka melihat uang bertambah

## Usia 11-15 Tahun
- Libatkan dalam diskusi anggaran keluarga
- Ajarkan konsep *bunga* dan investasi sederhana
- Dorong mereka mencari penghasilan sendiri`,
  },
  {
    title: 'Strategi Melunasi Hutang dengan Cepat',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    content: `# Strategi Melunasi Hutang

Hutang yang tidak dikelola bisa menjadi beban finansial yang berat.

## Metode Snowball
Lunasi hutang dari yang **terkecil** dulu. Setelah lunas, alokasikan pembayarannya ke hutang berikutnya.

## Metode Avalanche
Prioritaskan hutang dengan **bunga tertinggi**. Secara matematis, metode ini lebih efisien.

## Tips Tambahan
- Hindari menambah hutang baru
- Negosiasi suku bunga dengan kreditur
- Cari penghasilan tambahan untuk mempercepat pelunasan
- Gunakan aplikasi untuk melacak progress pelunasan`,
  },
  {
    title: 'Fitur Baru: Laporan Keuangan Bulanan',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    content: `# Fitur Baru: Laporan Keuangan Bulanan

Kami dengan senang hati mengumumkan fitur baru di aplikasi Money Management!

## Apa yang Baru?
- **Grafik tren bulanan** — Lihat pola pemasukan dan pengeluaran dalam 6 bulan terakhir
- **Breakdown kategori** — Ketahui kategori mana yang paling banyak menyerap pengeluaran
- **Perbandingan bulan** — Bandingkan kinerja keuangan antar bulan

## Cara Mengakses
1. Buka halaman **Laporan** dari menu navigasi
2. Pilih bulan dan tahun yang ingin dilihat
3. Geser untuk melihat detail tiap kategori

Fitur ini tersedia untuk semua pengguna tanpa biaya tambahan!`,
  },
  {
    title: 'Panduan Membuat Anggaran Keluarga',
    imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80',
    content: `# Panduan Membuat Anggaran Keluarga

Anggaran adalah fondasi dari pengelolaan keuangan yang sehat.

## Langkah-langkah

### 1. Hitung Total Pemasukan
Jumlahkan semua sumber pendapatan keluarga: gaji, bonus, penghasilan sampingan.

### 2. Catat Pengeluaran Tetap
- Cicilan rumah/kontrakan
- Listrik, air, internet
- Asuransi
- Biaya sekolah anak

### 3. Alokasikan dengan Aturan 50/30/20
- **50%** untuk kebutuhan pokok
- **30%** untuk keinginan
- **20%** untuk tabungan dan investasi

### 4. Evaluasi Rutin
Review anggaran setiap akhir bulan dan sesuaikan jika diperlukan.`,
  },
  {
    title: 'Keuntungan Mencatat Keuangan Secara Digital',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    content: `# Keuntungan Mencatat Keuangan Secara Digital

Beralih dari pencatatan manual ke digital membawa banyak manfaat.

## Akses Kapan Saja
Data keuangan Anda tersedia di genggaman tangan, kapan pun dan di mana pun.

## Otomatis & Akurat
- Kalkulasi otomatis mengurangi risiko kesalahan hitung
- Kategori terorganisir dengan rapi
- **Grafik visual** memudahkan analisis

## Kolaborasi Keluarga
Dengan aplikasi Money Management, semua anggota keluarga bisa:
- Mencatat transaksi masing-masing
- Melihat ringkasan keuangan bersama
- Memantau anggaran secara *real-time*

## Keamanan Data
Data tersimpan aman dengan enkripsi dan backup otomatis.`,
  },
  {
    title: 'Resolusi Keuangan 2026: Mulai dari Mana?',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    content: `# Resolusi Keuangan 2026

Tahun baru, semangat baru untuk mengelola keuangan lebih baik!

## Target yang Realistis
Jangan langsung memasang target terlalu tinggi. Mulai dari hal kecil:
- Catat pengeluaran setiap hari selama **30 hari pertama**
- Kurangi satu kebiasaan boros
- Mulai menabung minimal 10% dari penghasilan

## Evaluasi Kondisi Saat Ini
Sebelum membuat resolusi, ketahui posisi keuangan Anda:
1. Berapa total aset?
2. Berapa total hutang?
3. Berapa *net worth* Anda?

## Buat Rencana Aksi
- Tentukan target spesifik (misal: menabung **Rp 50 juta** dalam setahun)
- Pecah menjadi target bulanan
- Pantau progress secara rutin melalui aplikasi

*Konsistensi adalah kunci keberhasilan finansial!*`,
  },
];

async function seedNews() {
  console.log('Seeding news...');
  const existing = await prisma.news.count();
  if (existing > 0) {
    console.log(`${existing} news already exist. Skipping.`);
    return;
  }
  await prisma.news.createMany({
    data: defaultNews.map((n) => ({ ...n, isPublished: true })),
  });
  console.log(`Created ${defaultNews.length} news articles.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
