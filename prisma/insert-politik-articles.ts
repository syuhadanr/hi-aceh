import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const url = new URL(dbUrl);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname || "localhost",
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username || "root",
    password: url.password || undefined,
    database: url.pathname.replace(/^\//, ""),
  }),
});

const politicsArticles = [
  {
    title: "DPR Aceh Setujui Rancangan Anggaran Perubahan Tahun Ini",
    slug: "dpr-aceh-setujui-rancangan-anggaran-perubahan-tahun-ini",
    excerpt: "Legislatif Aceh memberikan lampu hijau terhadap perubahan anggaran yang fokus pada pemulihan ekonomi dan program sosial.",
    content: "Dewan Perwakilan Rakyat Aceh resmi menyetujui rancangan anggaran perubahan tahun ini, dengan prioritas pada pemulihan ekonomi daerah dan bantuan langsung untuk pelaku UMKM.",
    publishedAt: new Date("2026-06-04T09:30:00Z"),
  },
  {
    title: "Gubernur Aceh Dorong Percepatan Pembangunan Jalan Strategis",
    slug: "gubernur-aceh-dorong-percepatan-pembangunan-jalan-strategis",
    excerpt: "Pemerintah provinsi menargetkan proyek infrastruktur untuk memperkuat konektivitas antar kabupaten menjelang musim panen.",
    content: "Dalam rapat kerja bersama DPR Aceh, gubernur menegaskan pentingnya meningkatkan kapasitas jaringan jalan untuk mendukung distribusi hasil pertanian dan pariwisata.",
    publishedAt: new Date("2026-06-04T11:15:00Z"),
  },
  {
    title: "Fraksi Politik Aceh Sepakat Prioritaskan Reformasi Pendidikan",
    slug: "fraksi-politik-aceh-sepakat-prioritaskan-reformasi-pendidikan",
    excerpt: "Anggota legislatif Aceh sepakat mengalokasikan anggaran lebih besar untuk pendidikan vokasi dan sekolah darurat.",
    content: "Pembahasan komisi mengungkap kebutuhan mendesak untuk meningkatkan kualitas guru dan infrastruktur sekolah di daerah terpencil.",
    publishedAt: new Date("2026-06-04T13:00:00Z"),
  },
  {
    title: "Menlu Aceh Bertemu Delegasi ASEAN untuk Kerjasama Ekonomi",
    slug: "menlu-aceh-bertemu-delegasi-asean-untuk-kerjasama-ekonomi",
    excerpt: "Pertemuan menegaskan komitmen Aceh membuka peluang investasi hijau dan pariwisata berkelanjutan dengan negara tetangga.",
    content: "Delegasi ASEAN menyambut baik inisiatif Aceh memperkuat hubungan dagang melalui proyek energi terbarukan dan ekowisata.",
    publishedAt: new Date("2026-06-04T14:45:00Z"),
  },
  {
    title: "Komisi IV Minta Pemerintah Aceh Perbaiki Data Bansos di Pedalaman",
    slug: "komisi-iv-minta-pemerintah-aceh-perbaiki-data-bansos-di-pedalaman",
    excerpt: "Kritik muncul setelah audit menunjukkan ketidaksesuaian data keluarga penerima manfaat di beberapa kecamatan.",
    content: "Anggota komisi menuntut transparansi dan pembaruan sistem informasi untuk memastikan bantuan sosial tepat sasaran.",
    publishedAt: new Date("2026-06-05T08:00:00Z"),
  },
  {
    title: "Pemerintah Aceh Bentuk Tim Khusus Atasi Konflik Lahan Pertanian",
    slug: "pemerintah-aceh-bentuk-tim-khusus-atasi-konflik-lahan-pertanian",
    excerpt: "Tim baru akan memfasilitasi mediasi antara petani dan investor untuk menjaga stabilitas sosial dan produktivitas pangan.",
    content: "Langkah ini diambil setelah sejumlah sengketa lahan memicu demonstrasi di beberapa kabupaten Aceh.",
    publishedAt: new Date("2026-06-05T10:20:00Z"),
  },
  {
    title: "Wali Kota Janji Tingkatkan Pelayanan Publik Lewat Smart City",
    slug: "wali-kota-janji-tingkatkan-pelayanan-publik-lewat-smart-city",
    excerpt: "Implementasi aplikasi layanan publik diperkirakan mempercepat proses perizinan dan pengaduan masyarakat.",
    content: "Rencana smart city akan meliputi layanan kesehatan, perizinan usaha, dan monitoring kerusakan fasilitas umum.",
    publishedAt: new Date("2026-06-05T12:10:00Z"),
  },
  {
    title: "Hakim Agung Tinjau Kasus Sengketa Tambang dengan Pendekatan Hukum Adat",
    slug: "hakim-agung-tinjau-kasus-sengketa-tambang-dengan-pendekatan-hukum-adat",
    excerpt: "Putusan pengadilan akan mempertimbangkan peran hukum adat dalam menyelesaikan konflik sumber daya alam.",
    content: "Para pakar menjelaskan bahwa integrasi hukum adat penting untuk menjaga kedaulatan masyarakat lokal dan investor asing.",
    publishedAt: new Date("2026-06-05T14:50:00Z"),
  },
  {
    title: "Ketua DPR Aceh Dorong Program Lansia untuk Keluarga Nelayan",
    slug: "ketua-dpr-aceh-dorong-program-lansia-untuk-keluarga-nelayan",
    excerpt: "Inisiatif sosial ini dirancang untuk meningkatkan kesejahteraan lansia di komunitas nelayan pesisir.",
    content: "Program mencakup layanan kesehatan bergerak, bantuan pangan, dan pelatihan usaha mikro untuk keluarga lansia.",
    publishedAt: new Date("2026-06-06T09:40:00Z"),
  },
  {
    title: "Pemerintah Aceh Siapkan Regulasi Baru untuk Keamanan Siber Pemerintahan",
    slug: "pemerintah-aceh-siapkan-regulasi-baru-untuk-keamanan-siber-pemerintahan",
    excerpt: "Aturan baru menargetkan perlindungan data publik dan keamanan jaringan pemerintah daerah dari serangan siber.",
    content: "Kebijakan ini merupakan respons terhadap peningkatan percobaan penetrasi dan kejahatan digital di instansi pemerintahan.",
    publishedAt: new Date("2026-06-06T11:55:00Z"),
  },
];

async function main() {
  const author = await prisma.user.upsert({
    where: { email: "redaksi@hiaceh.com" },
    update: { name: "Redaksi Aceh", role: "PENULIS" },
    create: {
      email: "redaksi@hiaceh.com",
      name: "Redaksi Aceh",
      password: "password", // This field is required but not used for public display
      role: "PENULIS",
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "politik" },
    update: { name: "Politik" },
    create: {
      name: "Politik",
      slug: "politik",
      description: "Berita politik lokal, nasional, dan kebijakan publik.",
    },
  });

  const existingSlugs = new Set(
    (await prisma.article.findMany({
      where: { slug: { in: politicsArticles.map((article) => article.slug) } },
      select: { slug: true },
    })).map((article) => article.slug)
  );

  const toCreate = politicsArticles.filter((article) => !existingSlugs.has(article.slug));

  if (toCreate.length === 0) {
    console.log("Semua artikel politik sudah ada di database. Tidak ada yang ditambahkan.");
  } else {
    await prisma.article.createMany({
      data: toCreate.map((article) => ({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: "PUBLISHED",
        isBreaking: false,
        isFeatured: false,
        publishedAt: article.publishedAt,
        viewCount: Math.floor(Math.random() * 500) + 300,
        authorId: author.id,
        categoryId: category.id,
      })),
      skipDuplicates: true,
    });
    console.log(`Added ${toCreate.length} politics articles to the database.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
