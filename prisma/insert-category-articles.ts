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

const categoryArticleMap = {
  politik: [
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
  ],
  ekonomi: [
    {
      title: "Pasar UMKM Aceh Menguat dengan Modal Usaha Bersama",
      slug: "pasar-umkm-aceh-menguat-dengan-modal-usaha-bersama",
      excerpt: "Koperasi lokal di Aceh memimpin kebangkitan usaha kecil lewat akses modal dan pelatihan bisnis.",
      content: "Pelaku UMKM mencatat peningkatan penjualan setelah program bersama mempertemukan produsen dengan pemasok dan konsumen baru.",
      publishedAt: new Date("2026-06-01T09:00:00Z"),
    },
    {
      title: "Investasi Lingkungan Hidup Dorong Pabrik Ramah Lingkungan di Banda Aceh",
      slug: "investasi-lingkungan-hidup-dorong-pabrik-ramah-lingkungan-di-banda-aceh",
      excerpt: "Perusahaan baru memanfaatkan insentif pemerintah untuk membangun fasilitas produksi rendah emisi.",
      content: "Pabrik modern ini hendak memenuhi permintaan ekspor sekaligus menjaga komitmen Aceh terhadap kelestarian lingkungan.",
      publishedAt: new Date("2026-06-01T11:30:00Z"),
    },
    {
      title: "Koperasi Perikanan Terima Dana Pembinaan Usaha",
      slug: "koperasi-perikanan-terima-dana-pembinaan-usaha",
      excerpt: "Nelayan Aceh mendapatkan pendanaan untuk memperbaiki pengolahan hasil laut dan akses pasar.",
      content: "Program ini fokus pada kualitas produk dan sertifikasi agar ikan segar Aceh bisa menembus pasar internasional.",
      publishedAt: new Date("2026-06-02T08:15:00Z"),
    },
    {
      title: "Pemerintah Aceh Luncurkan Bantuan Digitalisasi UMKM",
      slug: "pemerintah-aceh-luncurkan-bantuan-digitalisasi-umkm",
      excerpt: "Pelatihan e-commerce dan pemasaran online diberikan bagi pelaku usaha kecil di 10 kabupaten.",
      content: "Program baru ini memasangkan UMKM dengan platform penjualan digital dan mentor bisnis untuk meningkatkan omzet.",
      publishedAt: new Date("2026-06-02T10:00:00Z"),
    },
    {
      title: "Harga Kopi Gayo Meroket, Ekspor Dorong Laju Ekonomi",
      slug: "harga-kopi-gayo-meroket-ekspor-dorong-laju-ekonomi",
      excerpt: "Permintaan kopi Arabika Aceh tumbuh tajam setelah penandatanganan kontrak ekspor baru.",
      content: "Eksportir mengatakan lonjakan harga membuka peluang pendapatan lebih tinggi untuk petani dan pengolah lokal.",
      publishedAt: new Date("2026-06-02T12:20:00Z"),
    },
    {
      title: "Bandara Internasional Aceh Catat Kenaikan Kargo dan Penumpang",
      slug: "bandara-internasional-aceh-catat-kenaikan-kargo-dan-penumpang",
      excerpt: "Rute baru dan promosi pariwisata membawa lonjakan pengiriman barang serta wisatawan asing.",
      content: "Pihak bandara menyatakan kesiapan layanan logistik modern untuk mendukung usaha ekspor dan pariwisata.",
      publishedAt: new Date("2026-06-02T14:35:00Z"),
    },
    {
      title: "Rencana Perluasan Zona Ekonomi Khusus di Aceh",
      slug: "rencana-perluasan-zona-ekonomi-khusus-di-aceh",
      excerpt: "Pemerintah meninjau area baru untuk menarik investasi manufaktur dan teknologi dengan insentif fiskal.",
      content: "Zona ekonomi khusus diharapkan menciptakan lapangan kerja dan memperkuat rantai nilai lokal.",
      publishedAt: new Date("2026-06-03T08:40:00Z"),
    },
    {
      title: "Perusahaan Teknologi Lokal Awali Pusat Inkubasi Startup",
      slug: "perusahaan-teknologi-lokal-awali-pusat-inkubasi-startup",
      excerpt: "Startup Aceh mendapat ruang kerja dan mentor untuk mengembangkan aplikasi digital ramah lokal.",
      content: "Inkubator ini akan mempercepat pengembangan usaha teknologi, konten kreatif, dan solusi pertanian pintar.",
      publishedAt: new Date("2026-06-03T10:50:00Z"),
    },
    {
      title: "Anggaran Pertanian Aceh Fokus pada Irigasi dan Penyuluhan",
      slug: "anggaran-pertanian-aceh-fokus-pada-irigasi-dan-penyuluhan",
      excerpt: "Dana tambahan digunakan untuk memperbaiki saluran irigasi dan memberdayakan petani dengan pelatihan teknis.",
      content: "Dinas pertanian menyatakan langkah ini penting untuk menjaga produksi dan ketahanan pangan daerah.",
      publishedAt: new Date("2026-06-03T13:05:00Z"),
    },
    {
      title: "Pelatihan Wirausaha Muda Dorong Ekonomi Kerakyatan",
      slug: "pelatihan-wirausaha-muda-dorong-ekonomi-kerakyatan",
      excerpt: "Generasi muda Aceh diberi panduan untuk mengembangkan usaha kreatif berbasis lokal.",
      content: "Program ini menargetkan pelaku usaha baru di bidang kuliner, kerajinan, dan jasa digital.",
      publishedAt: new Date("2026-06-03T15:25:00Z"),
    },
  ],
  budaya: [
    {
      title: "Festival Seni Lokal Aceh Suguhkan Pertunjukan Budaya Menginspirasi",
      slug: "festival-seni-lokal-aceh-suguhkan-pertunjukan-budaya-menginspirasi",
      excerpt: "Acara tahunan mempertemukan tarian tradisional, musik, dan pameran kerajinan khas Aceh.",
      content: "Penyelenggara berharap festival ini menjadi magnet wisata budaya sekaligus ruang apresiasi seniman lokal.",
      publishedAt: new Date("2026-06-01T08:10:00Z"),
    },
    {
      title: "Pelestarian Tari Saman Dijadikan Program Sekolah",
      slug: "pelestarian-tari-saman-dijadikan-program-sekolah",
      excerpt: "Siswa di Aceh belajar tarian tradisional sebagai bagian dari kurikulum kebudayaan lokal.",
      content: "Program ini bertujuan meneruskan warisan budaya ke generasi muda dan memperkuat identitas daerah.",
      publishedAt: new Date("2026-06-01T10:30:00Z"),
    },
    {
      title: "Museum Banda Aceh Buka Pameran Sejarah Nusantara",
      slug: "museum-banda-aceh-buka-pameran-sejarah-nusantara",
      excerpt: "Pameran baru menampilkan artefak, dokumen, dan cerita tentang perjalanan sejarah Aceh dan Indonesia.",
      content: "Kurator menyebut pameran sebagai upaya memperkaya pemahaman publik terhadap peran Aceh dalam sejarah nasional.",
      publishedAt: new Date("2026-06-01T13:15:00Z"),
    },
    {
      title: "Kolaborasi Seniman Aceh dengan Desainer Internasional",
      slug: "kolaborasi-seniman-aceh-dengan-desainer-internasional",
      excerpt: "Proyek baru memberi ruang bagi motif tradisional Aceh dalam koleksi mode global.",
      content: "Seniman lokal memperlihatkan keindahan kain tradisional dan kerajinan tangan melalui catwalk internasional.",
      publishedAt: new Date("2026-06-02T09:20:00Z"),
    },
    {
      title: "Pertunjukan Teater Lokal Sambut Turis dengan Legenda Aceh",
      slug: "pertunjukan-teater-lokal-sambut-turis-dengan-legenda-aceh",
      excerpt: "Drama sejarah menampilkan kisah pahlawan lokal dan budaya Aceh kepada penonton nasional.",
      content: "Produksi teater ini menjadi daya tarik baru di kalangan wisatawan budaya dan pelajar seni.",
      publishedAt: new Date("2026-06-02T11:45:00Z"),
    },
    {
      title: "Pameran Fotografi Kota Lama Angkat Warisan Arsitektur",
      slug: "pameran-fotografi-kota-lama-angkat-warisan-arsitektur",
      excerpt: "Foto-foto landmark bersejarah Aceh menyorot detail ornamen dan lanskap kota lama.",
      content: "Pameran mengajak pengunjung mengenang kebesaran budaya sambil mendukung pelestarian bangunan ikonik.",
      publishedAt: new Date("2026-06-02T14:05:00Z"),
    },
    {
      title: "Pelatihan Kerajinan Tangan Batik Tapis untuk Ibu-Ibu",
      slug: "pelatihan-kerajinan-tangan-batik-tapis-untuk-ibu-ibu",
      excerpt: "Pelatihan ini meningkatkan keterampilan dan peluang usaha perempuan desa.",
      content: "Peserta mempelajari teknik batik tapis khas Aceh untuk dijual sebagai produk budaya bernilai tinggi.",
      publishedAt: new Date("2026-06-03T08:55:00Z"),
    },
    {
      title: "Karnaval Budaya Tengah Tahun Aceh Dihadiri Ribuan Warga",
      slug: "karnaval-budaya-tengah-tahun-aceh-dihadiri-ribuan-warga",
      excerpt: "Parade warna-warni menampilkan tarian, musik, dan kostum tradisional dari berbagai daerah Aceh.",
      content: "Karnaval menjadi momen kebanggaan budaya sekaligus promosi warisan lokal kepada pengunjung.",
      publishedAt: new Date("2026-06-03T11:30:00Z"),
    },
    {
      title: "Program Penulisan Sastra Muda Memacu Kreativitas",
      slug: "program-penulisan-sastra-muda-memacu-kreativitas",
      excerpt: "Kompetisi sastra mendorong generasi muda Aceh menulis cerita dan puisi tentang identitas budaya.",
      content: "Pemenang akan diterbitkan dalam antologi dan mendapat kesempatan belajar dengan penulis senior.",
      publishedAt: new Date("2026-06-03T13:45:00Z"),
    },
    {
      title: "Galeri Seni Kontemporer Dukung Talenta Baru",
      slug: "galeri-seni-kontemporer-dukung-talenta-baru",
      excerpt: "Seniman muda memamerkan karya digital, lukisan, dan instalasi yang menggabungkan tradisi dan modernitas.",
      content: "Galeri ini membuka peluang penjualan karya dan jaringan bagi pelaku seni Aceh.",
      publishedAt: new Date("2026-06-03T16:05:00Z"),
    },
  ],
  wisata: [
    {
      title: "Peluncuran Paket Wisata Sabang untuk Musim Liburan",
      slug: "peluncuran-paket-wisata-sabang-untuk-musim-liburan",
      excerpt: "Paket baru menghadirkan tur laut, snorkeling, dan kuliner lokal untuk wisatawan domestik.",
      content: "Destinasi Sabang kembali dipromosikan sebagai tujuan utama dengan rute penerbangan dan kapal baru.",
      publishedAt: new Date("2026-06-01T08:50:00Z"),
    },
    {
      title: "Desa Ekowisata Lokon Dijadikan Destinasi Keluarga",
      slug: "desa-ekowisata-lokon-dijadikan-destinasi-keluarga",
      excerpt: "Wisata alam dan budaya di Lokon kini dibuka sebagai tujuan ramah keluarga.",
      content: "Keindahan alam dan pengalaman komunitas setempat menjadi fokus pengembangan desa wisata ini.",
      publishedAt: new Date("2026-06-01T11:10:00Z"),
    },
    {
      title: "Jalur Sepeda Pesisir Aceh Buka Rute Baru",
      slug: "jalur-sepeda-pesisir-aceh-buka-rute-baru",
      excerpt: "Rute baru menghubungkan pantai-pantai cantik dengan fasilitas istirahat bagi pesepeda.",
      content: "Proyek ini bertujuan meningkatkan kegiatan olahraga dan pariwisata sambil menjaga kawasan pesisir.",
      publishedAt: new Date("2026-06-01T13:20:00Z"),
    },
    {
      title: "Hotel Batik Matadee Bersiap Menyambut Turis Internasional",
      slug: "hotel-batik-matadee-bersiap-menyambut-turis-internasional",
      excerpt: "Hotel baru menambahkan fasilitas premium dan pelatihan layanan untuk tamu asing.",
      content: "Manajemen hotel fokus pada pengalaman lokal yang dikombinasikan dengan standar internasional.",
      publishedAt: new Date("2026-06-02T09:05:00Z"),
    },
    {
      title: "Wisata Pantai Lhoknga Dapat Garis Penarik Baru",
      slug: "wisata-pantai-lhoknga-dapat-garis-penarik-baru",
      excerpt: "Pantai populer Aceh tampil segar dengan fasilitas baru dan area foto ikonik.",
      content: "Peningkatan ini diharapkan memperkuat Lhoknga sebagai tujuan utama surfers dan keluarga.",
      publishedAt: new Date("2026-06-02T11:35:00Z"),
    },
    {
      title: "Kapal Pesiar Labuan Bajo Terbuka untuk Turis Domestik",
      slug: "kapal-pesiar-labuan-bajo-terbuka-untuk-turis-domestik",
      excerpt: "Rute pelayaran baru menawarkan paket wisata laut dan snorkeling untuk wisatawan lokal.",
      content: "Pelayaran ini menambah pilihan wisata kelas menengah dengan fokus keberlanjutan.",
      publishedAt: new Date("2026-06-02T14:00:00Z"),
    },
    {
      title: "Rencana Kereta Turis Aceh Menjadi Destinasi Heritage",
      slug: "rencana-kereta-turis-aceh-menjadi-destinasi-heritage",
      excerpt: "Kereta wisata direncanakan menghubungkan situs sejarah dan kawasan alam di Aceh.",
      content: "Proyek ini diharapkan mendukung pariwisata budaya serta transportasi ramah lingkungan.",
      publishedAt: new Date("2026-06-03T08:30:00Z"),
    },
    {
      title: "Pelatihan Pemandu Wisata Bahasa Inggris untuk Pelayanan",
      slug: "pelatihan-pemandu-wisata-bahasa-inggris-untuk-pelayanan",
      excerpt: "Program ini menyiapkan pemandu lokal menghadapi turis mancanegara dengan kemampuan bahasa yang baik.",
      content: "Pelatihan berfokus pada komunikasi cerita lokal dan etika layanan wisata.",
      publishedAt: new Date("2026-06-03T10:55:00Z"),
    },
    {
      title: "Konservasi Terumbu Karang Aceh Didukung Komunitas Lokal",
      slug: "konservasi-terumbu-karang-aceh-didukung-komunitas-lokal",
      excerpt: "Proyek penyelamatan terumbu karang melibatkan penyelam dan pelajar setempat.",
      content: "Kegiatan ini sekaligus memperkenalkan ekowisata yang ramah lingkungan dan edukatif.",
      publishedAt: new Date("2026-06-03T13:15:00Z"),
    },
    {
      title: "Resor Biosfer Bukit Dukung Ekonomi Wisata Perempuan",
      slug: "resor-biosfer-bukit-dukung-ekonomi-wisata-perempuan",
      excerpt: "Resor baru berkolaborasi dengan kelompok wanita untuk menyediakan kesejahteraan ekonomi.",
      content: "Inisiatif ini menitikberatkan pelatihan hospitality, produk lokal, dan menjaga lingkungan.",
      publishedAt: new Date("2026-06-03T15:30:00Z"),
    },
  ],
};

async function main() {
  const author = await prisma.user.upsert({
    where: { email: "redaksi@hiaceh.com" },
    update: { name: "Redaksi Aceh", role: "PENULIS" },
    create: {
      email: "redaksi@hiaceh.com",
      name: "Redaksi Aceh",
      password: "password",
      role: "PENULIS",
    },
  });

  const categoryRecords = await Promise.all(
    Object.keys(categoryArticleMap).map((slug) =>
      prisma.category.upsert({
        where: { slug },
        update: { name: slug === "politik" ? "Politik" : slug === "ekonomi" ? "Ekonomi" : slug === "budaya" ? "Budaya" : "Wisata" },
        create: {
          name: slug === "politik" ? "Politik" : slug === "ekonomi" ? "Ekonomi" : slug === "budaya" ? "Budaya" : "Wisata",
          slug,
          description: slug === "politik"
            ? "Berita politik lokal, nasional, dan kebijakan publik."
            : slug === "ekonomi"
              ? "Berita ekonomi, investasi, UMKM, dan bisnis Aceh."
              : slug === "budaya"
                ? "Liputan seni, budaya, tradisi, dan event kreatif Aceh."
                : "Informasi pariwisata, perjalanan, dan destinasi menarik Aceh.",
        },
      })
    )
  );

  const categoryIdBySlug = categoryRecords.reduce((map, category) => {
    map[category.slug] = category.id;
    return map;
  }, {} as Record<string, string>);

  const allArticles = Object.entries(categoryArticleMap).flatMap(([slug, articles]) =>
    articles.map((article) => ({ ...article, categorySlug: slug }))
  );

  const existingSlugs = new Set(
    (await prisma.article.findMany({
      where: { slug: { in: allArticles.map((article) => article.slug) } },
      select: { slug: true },
    })).map((article) => article.slug)
  );

  const toCreate = allArticles.filter((article) => !existingSlugs.has(article.slug));

  if (toCreate.length === 0) {
    console.log("Semua artikel kategori sudah ada di database. Tidak ada yang ditambahkan.");
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
        categoryId: categoryIdBySlug[article.categorySlug],
      })),
      skipDuplicates: true,
    });
    console.log(`Added ${toCreate.length} new category articles to the database.`);
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
