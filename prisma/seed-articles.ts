import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL must be set");

const url = new URL(dbUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname || "localhost",
  port: url.port ? parseInt(url.port, 10) : 3306,
  user: url.username || "root",
  password: url.password || undefined,
  database: url.pathname.replace(/^\//, ""),
});

const prisma = new PrismaClient({ adapter });

const categories = {
  daerah: "af4391a5-3dca-4595-a98d-291eac286821",
  ekonomi: "b539cfa8-67cd-4a60-8e47-56901f18a4ae",
  wisata: "51a45e27-9c16-453c-805f-5fd69de5771f",
  kesehatan: "a9fba891-8a87-4de2-9e4f-05eaa565933f",
  politik: "4e12fd35-f023-40bd-9b5b-aa233be48786",
  nasional: "2097d280-d1d6-4f70-9176-e28b10d4c8a0",
  opini: "7f529232-fe13-4ce6-a701-afc8d8ec14f1",
  gayaHidup: "0c53e802-d2a8-40ae-a852-fb8b664be666",
  sejarah: "504dfbf9-7d04-4cb1-8220-e16f8433a923",
  global: "f69fec0d-46a2-4fc5-8dd2-f7c436b76d1a",
};

function slug(title: string, index: number) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) +
    "-" +
    index
  );
}

function randomDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d;
}

const articles = [
  // DAERAH
  {
    title: "Pemkot Banda Aceh Luncurkan Program Beasiswa untuk Pelajar Kurang Mampu",
    content: `<p>Pemerintah Kota Banda Aceh resmi meluncurkan program beasiswa bagi pelajar dari keluarga kurang mampu yang berprestasi. Program ini menyasar siswa SMA dan mahasiswa perguruan tinggi negeri di wilayah Banda Aceh.</p><p>Wali Kota Banda Aceh menyatakan bahwa program ini merupakan bagian dari komitmen pemerintah dalam meningkatkan kualitas sumber daya manusia di ibu kota provinsi. "Kami ingin memastikan tidak ada anak Aceh yang putus sekolah karena alasan ekonomi," ujarnya dalam acara peluncuran yang berlangsung di Balai Kota.</p><p>Total anggaran yang dialokasikan untuk program ini mencapai Rp 2,5 miliar dari APBK 2026. Setiap penerima beasiswa akan mendapatkan bantuan biaya pendidikan, biaya hidup bulanan, serta akses ke program mentoring akademik.</p><p>Pendaftaran dibuka mulai 1 Juli 2026 dan dapat dilakukan secara online melalui portal resmi Pemkot Banda Aceh. Calon penerima beasiswa diwajibkan memiliki nilai rata-rata minimal 8,0 dan surat keterangan tidak mampu dari kelurahan setempat.</p>`,
    excerpt: "Pemkot Banda Aceh alokasikan Rp 2,5 miliar untuk beasiswa pelajar berprestasi dari keluarga kurang mampu.",
    categoryId: categories.daerah,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/beasiswa/800/500",
  },
  {
    title: "Jembatan Krueng Aceh Diperlebar untuk Atasi Kemacetan di Pusat Kota",
    content: `<p>Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Aceh mengumumkan proyek pelebaran Jembatan Krueng Aceh yang menghubungkan kawasan Peunayong dengan pusat kota Banda Aceh. Proyek ini diperkirakan akan selesai pada akhir tahun 2026.</p><p>Kepala Dinas PUPR Aceh menjelaskan bahwa jembatan yang saat ini memiliki lebar 6 meter akan diperlebar menjadi 12 meter, sehingga dapat menampung dua jalur kendaraan di masing-masing arah. "Ini akan sangat membantu mengurangi kemacetan yang selama ini menjadi keluhan warga," katanya.</p><p>Proyek senilai Rp 18 miliar ini menggunakan dana dari APBA dan dijadwalkan mulai dikerjakan pada bulan Juli 2026. Selama proses pengerjaan, akan ada rekayasa lalu lintas sementara yang mengalihkan kendaraan berat ke jalur alternatif.</p>`,
    excerpt: "Jembatan Krueng Aceh akan diperlebar dari 6 meter menjadi 12 meter untuk mengatasi kemacetan.",
    categoryId: categories.daerah,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/jembatan/800/500",
  },
  {
    title: "Ratusan Rumah di Aceh Utara Terendam Banjir Akibat Hujan Deras Semalaman",
    content: `<p>Banjir melanda sejumlah desa di Kabupaten Aceh Utara setelah hujan deras mengguyur wilayah tersebut selama lebih dari 10 jam berturut-turut. Berdasarkan data Badan Penanggulangan Bencana Daerah (BPBD) Aceh Utara, sebanyak 347 rumah terendam dengan ketinggian air antara 50 centimeter hingga 1,5 meter.</p><p>Desa-desa yang terdampak antara lain Desa Pulo Rungkom, Desa Meunasah Teungoh, dan Desa Keude Krueng Mane di Kecamatan Muara Batu. Warga yang rumahnya terendam dievakuasi ke tempat pengungsian sementara di balai desa dan masjid setempat.</p><p>Tim SAR gabungan dari BPBD, TNI, Polri, dan relawan dikerahkan untuk membantu proses evakuasi. Hingga berita ini diturunkan, belum ada laporan korban jiwa akibat bencana ini.</p><p>Kepala BPBD Aceh Utara menghimbau warga untuk tetap waspada karena curah hujan masih diprediksi tinggi dalam beberapa hari ke depan. Bantuan berupa makanan siap saji, air bersih, dan selimut telah didistribusikan ke lokasi pengungsian.</p>`,
    excerpt: "Sebanyak 347 rumah di Aceh Utara terendam banjir setelah hujan deras mengguyur selama 10 jam.",
    categoryId: categories.daerah,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: true,
    imageUrl: "https://picsum.photos/seed/banjir/800/500",
  },

  // EKONOMI
  {
    title: "Ekspor Kopi Gayo Tembus Pasar Amerika Serikat dan Eropa, Cetak Rekor Tertinggi",
    content: `<p>Volume ekspor kopi arabika Gayo dari Kabupaten Aceh Tengah dan Bener Meriah mencapai rekor tertinggi sepanjang sejarah pada semester pertama 2026. Data dari Dinas Perkebunan Aceh menunjukkan ekspor kopi Gayo mencapai 4.800 ton senilai USD 28 juta, meningkat 23 persen dibandingkan periode yang sama tahun lalu.</p><p>Amerika Serikat masih menjadi pasar utama dengan serapan sebesar 40 persen dari total ekspor, diikuti Jerman, Belanda, dan Jepang. Kopi Gayo dikenal di pasar internasional karena karakteristiknya yang unik dengan cita rasa earthy, rendah kafein alami, dan proses pengolahan wet-hull yang khas.</p><p>Ketua Asosiasi Petani Kopi Gayo menyatakan bahwa peningkatan ekspor ini tidak terlepas dari program sertifikasi organik yang diikuti oleh lebih dari 12.000 petani kopi di kedua kabupaten tersebut. "Sertifikasi organik membuat kopi Gayo mendapat harga premium di pasar internasional," ujarnya.</p><p>Pemerintah Aceh berencana meningkatkan kapasitas pengolahan pasca panen dan membuka akses pasar baru ke kawasan Timur Tengah dan Australia pada tahun 2027.</p>`,
    excerpt: "Ekspor kopi arabika Gayo capai rekor 4.800 ton senilai USD 28 juta pada semester pertama 2026.",
    categoryId: categories.ekonomi,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/kopi/800/500",
  },
  {
    title: "Kawasan Industri Ladong Siap Tampung 50 Perusahaan Baru pada 2027",
    content: `<p>Kawasan Industri Ladong di Kabupaten Aceh Besar terus berkembang pesat. Badan Pengusahaan Kawasan Sabang (BPKS) mengumumkan bahwa kawasan industri ini siap menampung hingga 50 perusahaan baru pada tahun 2027 dengan berbagai insentif fiskal yang menarik.</p><p>Infrastruktur pendukung seperti jalan akses, jaringan listrik, dan sistem pengolahan limbah industri telah ditingkatkan kapasitasnya. Selain itu, dermaga khusus industri berkapasitas 5.000 DWT juga sedang dalam tahap penyelesaian akhir.</p><p>Sejumlah perusahaan dari Jakarta dan Surabaya telah menyatakan minat untuk berinvestasi di kawasan ini, terutama di sektor pengolahan hasil laut, pengolahan kelapa sawit, dan industri tekstil.</p>`,
    excerpt: "Kawasan Industri Ladong siapkan lahan dan infrastruktur untuk 50 perusahaan baru pada 2027.",
    categoryId: categories.ekonomi,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/industri/800/500",
  },

  // WISATA
  {
    title: "Festival Karang Sabang 2026 Resmi Dibuka, Dongkrak Kunjungan Wisatawan Bahari",
    content: `<p>Pj Wali Kota Sabang secara resmi membuka Festival Karang Sabang 2026 yang diselenggarakan di Pantai Iboih, Pulau Weh. Festival tahunan ini diikuti oleh ratusan penyelam dari dalam dan luar negeri yang antusias menjelajahi keindahan bawah laut Sabang.</p><p>Festival yang berlangsung selama lima hari ini menampilkan berbagai kegiatan bahari seperti lomba fotografi bawah air, snorkeling bersama, penanaman terumbu karang, dan pameran produk maritim lokal. Peserta dari 12 negara tercatat hadir dalam festival kali ini.</p><p>Kepala Dinas Pariwisata Sabang menyampaikan bahwa festival ini bertujuan untuk memperkenalkan potensi wisata bahari Sabang kepada dunia internasional sekaligus mendorong kesadaran konservasi terumbu karang. "Sabang memiliki lebih dari 350 spesies ikan dan 100 jenis terumbu karang yang harus kita jaga bersama," tuturnya.</p><p>Pemerintah Kota Sabang menargetkan kunjungan wisatawan mancanegara sebanyak 25.000 orang sepanjang tahun 2026, naik 40 persen dari tahun sebelumnya.</p>`,
    excerpt: "Festival Karang Sabang 2026 dibuka dengan diikuti peserta dari 12 negara, targetkan 25 ribu wisatawan mancanegara.",
    categoryId: categories.wisata,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/sabang/800/500",
  },
  {
    title: "Pantai Lampuuk Masuk Daftar 10 Pantai Terbaik di Indonesia Versi Majalah Travel Asia",
    content: `<p>Pantai Lampuuk di Kabupaten Aceh Besar kembali mendapat pengakuan internasional setelah masuk dalam daftar 10 pantai terbaik di Indonesia versi majalah Travel Asia edisi Juni 2026. Pantai yang pernah porak poranda akibat tsunami 2004 ini kini telah bertransformasi menjadi destinasi wisata unggulan di Aceh.</p><p>Majalah Travel Asia menggambarkan Pantai Lampuuk sebagai "surga tersembunyi yang menakjubkan" dengan hamparan pasir putih sepanjang 5 kilometer, ombak yang cocok untuk surfing, dan suasana yang masih alami. Pantai ini juga dipuji atas kebersihan dan fasilitas yang terus ditingkatkan oleh pemerintah setempat.</p><p>Ketua Kelompok Sadar Wisata Lampuuk mengaku bangga atas penghargaan ini. "Kami terus berupaya menjaga kebersihan dan kenyamanan pantai. Ini adalah buah dari kerja keras seluruh masyarakat Lampuuk," ujarnya.</p>`,
    excerpt: "Pantai Lampuuk masuk daftar 10 pantai terbaik Indonesia versi Travel Asia berkat keindahan alam dan kebersihan.",
    categoryId: categories.wisata,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/lampuuk/800/500",
  },

  // KESEHATAN
  {
    title: "RSUD dr. Zainoel Abidin Kini Miliki Fasilitas MRI Terbaru, Layani Pasien Lebih Cepat",
    content: `<p>Rumah Sakit Umum Daerah (RSUD) dr. Zainoel Abidin Banda Aceh resmi mengoperasikan mesin MRI (Magnetic Resonance Imaging) generasi terbaru dengan teknologi 3 Tesla. Dengan adanya fasilitas ini, pasien yang membutuhkan pemeriksaan MRI tidak perlu lagi menunggu antrian panjang yang sebelumnya bisa mencapai dua minggu.</p><p>Direktur RSUD dr. Zainoel Abidin menjelaskan bahwa mesin MRI baru ini mampu menghasilkan gambar dengan resolusi lebih tinggi dan waktu pemeriksaan yang lebih singkat, dari rata-rata 45 menit menjadi hanya 20 menit per pasien. "Ini akan sangat membantu diagnosis penyakit-penyakit neurologis, ortopedi, dan onkologi," jelasnya.</p><p>Pengadaan mesin MRI senilai Rp 12 miliar ini dibiayai dari dana hibah Pemerintah Aceh dan dukungan Kementerian Kesehatan. Layanan MRI tersedia setiap hari kerja dan dapat diakses oleh pasien BPJS Kesehatan dengan rujukan dari dokter spesialis.</p>`,
    excerpt: "RSUD dr. Zainoel Abidin operasikan MRI 3 Tesla terbaru, pangkas waktu antrian dari dua minggu menjadi hitungan hari.",
    categoryId: categories.kesehatan,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/rumahsakit/800/500",
  },
  {
    title: "Dinkes Aceh Gelar Vaksinasi Massal di 23 Kabupaten/Kota Sambut Musim Pancaroba",
    content: `<p>Dinas Kesehatan (Dinkes) Aceh menggelar program vaksinasi massal serentak di 23 kabupaten/kota se-Aceh sebagai langkah antisipasi menghadapi musim pancaroba yang rawan penyakit. Program ini menyasar vaksinasi influenza, DBD, dan hepatitis A bagi masyarakat usia 5 tahun ke atas.</p><p>Kepala Dinkes Aceh menyebutkan bahwa musim pancaroba yang diprediksi berlangsung hingga Agustus 2026 kerap memicu lonjakan kasus Demam Berdarah Dengue (DBD) dan penyakit saluran pernapasan. "Vaksinasi adalah langkah preventif yang paling efektif," tegasnya.</p><p>Vaksinasi dapat dilakukan di seluruh Puskesmas, Posyandu, dan pos vaksin sementara yang dibuka di pasar tradisional dan pusat keramaian. Masyarakat tidak dipungut biaya apapun karena seluruh anggaran ditanggung oleh Pemerintah Aceh.</p>`,
    excerpt: "Dinkes Aceh gelar vaksinasi massal serentak di 23 kabupaten/kota antisipasi lonjakan penyakit musim pancaroba.",
    categoryId: categories.kesehatan,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/vaksin/800/500",
  },

  // POLITIK
  {
    title: "DPRA Sahkan Qanun Infrastruktur Hijau untuk Cegah Bencana Banjir di Aceh",
    content: `<p>Dewan Perwakilan Rakyat Aceh (DPRA) mengesahkan Qanun Infrastruktur Hijau Aceh dalam sidang paripurna yang berlangsung di gedung DPRA, Banda Aceh. Qanun ini menjadi regulasi pertama di Indonesia yang secara khusus mengatur tentang pembangunan infrastruktur berbasis alam sebagai solusi mitigasi bencana.</p><p>Ketua DPRA menyatakan bahwa qanun ini lahir dari keprihatinan atas seringnya banjir dan longsor yang melanda Aceh setiap tahunnya. "Kita tidak bisa terus-menerus membangun tanggul beton saja. Kita perlu pendekatan yang lebih holistik dengan memadukan infrastruktur teknis dan infrastruktur hijau berbasis ekosistem," ujarnya.</p><p>Qanun ini mengatur kewajiban penanaman pohon pada sempadan sungai, pembangunan hutan kota, dan penerapan sistem drainase berwawasan lingkungan di setiap proyek pembangunan. Pelanggaran terhadap qanun ini dapat dikenai sanksi administratif hingga pencabutan izin usaha.</p>`,
    excerpt: "DPRA sahkan Qanun Infrastruktur Hijau, regulasi pertama di Indonesia soal mitigasi bencana berbasis alam.",
    categoryId: categories.politik,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: true,
    imageUrl: "https://picsum.photos/seed/dpra/800/500",
  },

  // NASIONAL
  {
    title: "Presiden Kunjungi Aceh, Resmikan Proyek Strategis Nasional Senilai Rp 4,2 Triliun",
    content: `<p>Presiden Republik Indonesia melakukan kunjungan kerja ke Aceh dan meresmikan sejumlah Proyek Strategis Nasional (PSN) yang telah lama dinantikan masyarakat. Total nilai proyek yang diresmikan mencapai Rp 4,2 triliun, meliputi jalan tol Sigli-Banda Aceh seksi 6, pembangkit listrik tenaga angin di pesisir barat Aceh, dan fasilitas pengolahan gas alam di Lhokseumawe.</p><p>Dalam sambutannya, Presiden menegaskan komitmen pemerintah pusat untuk terus mendorong percepatan pembangunan di Aceh sebagai daerah yang memiliki keistimewaan. "Aceh adalah bagian yang tak terpisahkan dari Indonesia, dan kemajuan Aceh adalah kemajuan kita semua," kata Presiden.</p><p>Gubernur Aceh menyambut hangat kunjungan ini dan berharap momentum peresmian proyek-proyek strategis ini dapat mendorong pertumbuhan ekonomi Aceh yang ditargetkan mencapai 5,8 persen pada tahun 2026.</p>`,
    excerpt: "Presiden resmikan proyek strategis nasional senilai Rp 4,2 triliun di Aceh termasuk tol Sigli-Banda Aceh seksi 6.",
    categoryId: categories.nasional,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/presiden/800/500",
  },

  // OPINI
  {
    title: "Menjaga Warisan Budaya Aceh di Era Digital: Tantangan dan Peluang",
    content: `<p>Oleh: Dr. Teuku Iskandar, Akademisi Universitas Syiah Kuala</p><p>Di tengah arus digitalisasi yang semakin deras, warisan budaya Aceh menghadapi tantangan sekaligus peluang yang belum pernah ada sebelumnya. Tari Saman yang kini bisa ditonton jutaan orang di YouTube, atau syair-syair hikayat yang dibagikan melalui media sosial, adalah bukti bahwa teknologi bisa menjadi jembatan antara tradisi dan modernitas.</p><p>Namun di balik peluang tersebut, tersimpan ancaman yang tidak boleh kita abaikan. Ketika budaya dikonsumsi secara digital tanpa pemahaman konteks yang memadai, ia berisiko kehilangan kedalaman maknanya. Tari Saman bukan sekadar gerakan estetis yang memukau; ia adalah ekspresi spiritual, solidaritas komunal, dan identitas keacehan yang lahir dari rahim pesantren.</p><p>Digitalisasi budaya yang bermartabat harus disertai dengan narasi yang kuat tentang nilai-nilai yang dikandungnya. Pemerintah Aceh, lembaga pendidikan, dan komunitas budaya perlu berkolaborasi membangun platform digital yang tidak hanya menampilkan, tetapi juga menjelaskan dan mendidik.</p><p>Generasi muda Aceh perlu dilibatkan secara aktif—bukan sebagai objek pelestarian, tetapi sebagai subjek yang secara sadar memilih untuk mewarisi dan mengembangkan budayanya sendiri.</p>`,
    excerpt: "Digitalisasi budaya Aceh membuka peluang besar tapi juga ancaman hilangnya kedalaman makna jika tidak disertai narasi yang kuat.",
    categoryId: categories.opini,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/budaya/800/500",
  },

  // GAYA HIDUP
  {
    title: "Tren Kafe Kopi Specialty di Banda Aceh Semakin Berkembang, Anak Muda Jadi Motor Utama",
    content: `<p>Industri kopi specialty di Banda Aceh terus menunjukkan tren pertumbuhan yang signifikan. Dalam dua tahun terakhir, lebih dari 30 kafe kopi specialty baru bermunculan di berbagai sudut kota, menandai pergeseran budaya minum kopi masyarakat Aceh dari warung kopi tradisional menuju pengalaman kopi yang lebih modern.</p><p>Anak muda Aceh menjadi motor utama tren ini, baik sebagai konsumen maupun pengusaha. Banyak barista muda Aceh yang kini mendapatkan sertifikasi internasional dan bahkan berhasil memenangkan kompetisi barista tingkat nasional.</p><p>Menariknya, kafe-kafe ini tidak meninggalkan identitas lokal. Banyak yang mengangkat kopi Gayo sebagai menu andalan dengan metode seduh yang bervariasi, mulai dari pour over, aeropress, hingga cold brew. Beberapa kafe bahkan menghadirkan pengalaman edukasi tentang proses dari kebun hingga cangkir.</p><p>"Kami bangga bisa memperkenalkan kopi Gayo kepada generasi muda dengan cara yang lebih menarik dan modern," kata salah satu pemilik kafe di kawasan Kota Baru, Banda Aceh.</p>`,
    excerpt: "Lebih dari 30 kafe kopi specialty baru muncul di Banda Aceh dalam dua tahun, anak muda jadi penggerak utama tren ini.",
    categoryId: categories.gayaHidup,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/kafe/800/500",
  },

  // SEJARAH
  {
    title: "Arsip Digital Perang Aceh Diluncurkan, Ribuan Dokumen Bersejarah Kini Bisa Diakses Publik",
    content: `<p>Dinas Perpustakaan dan Kearsipan Aceh bekerja sama dengan Arsip Nasional Belanda meluncurkan portal Arsip Digital Perang Aceh yang memuat lebih dari 15.000 dokumen, foto, dan peta bersejarah dari periode 1873-1913. Portal ini dapat diakses secara gratis oleh masyarakat umum melalui arsip.acehprov.go.id.</p><p>Koleksi digital ini mencakup berbagai material berharga seperti laporan militer Belanda, surat menyurat Sultan Aceh, foto-foto ekspedisi militer, peta topografi wilayah Aceh pada akhir abad ke-19, serta dokumen-dokumen perjanjian yang pernah dibuat antara pihak Aceh dan Belanda.</p><p>Kepala Dinas Perpustakaan dan Kearsipan Aceh menyatakan bahwa peluncuran arsip digital ini merupakan langkah penting dalam upaya pelestarian sejarah Aceh. "Dengan digitalisasi ini, generasi mendatang bisa mempelajari sejarah perlawanan leluhur kita tanpa harus bepergian ke Belanda," ujarnya.</p><p>Selain koleksi dari Belanda, arsip ini juga memuat dokumen-dokumen yang berasal dari berbagai koleksi museum dan perpustakaan di Aceh, Malaysia, dan Singapura.</p>`,
    excerpt: "Portal Arsip Digital Perang Aceh diluncurkan, muat 15.000 dokumen bersejarah periode 1873-1913 yang kini bisa diakses gratis.",
    categoryId: categories.sejarah,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/arsip/800/500",
  },

  // GLOBAL
  {
    title: "Komunitas Diaspora Aceh di Malaysia Galang Dana untuk Korban Banjir Aceh Utara",
    content: `<p>Komunitas diaspora Aceh di Malaysia yang tergabung dalam Persatuan Masyarakat Aceh Malaysia (PMAM) bergerak cepat menggalang dana untuk membantu korban banjir di Aceh Utara. Dalam waktu tiga hari, mereka berhasil mengumpulkan dana sebesar RM 85.000 atau setara Rp 285 juta.</p><p>Ketua PMAM menyatakan bahwa solidaritas sesama orang Aceh tidak mengenal batas geografis. "Meski kami berada jauh di Malaysia, hati kami selalu bersama saudara-saudara di Aceh. Ini adalah bentuk nyata dari semangat Aceh bersaudara," tuturnya.</p><p>Dana yang terkumpul akan disalurkan melalui koordinasi dengan Pemerintah Kabupaten Aceh Utara dan digunakan untuk kebutuhan mendesak para pengungsi seperti makanan, pakaian, selimut, dan peralatan sanitasi.</p><p>Selain PMAM, komunitas Aceh di Jeddah, Arab Saudi, juga turut bergerak mengumpulkan donasi. Total bantuan dari diaspora Aceh di seluruh dunia diperkirakan akan mencapai Rp 500 juta.</p>`,
    excerpt: "Diaspora Aceh di Malaysia galang RM 85.000 dalam tiga hari untuk bantu korban banjir Aceh Utara.",
    categoryId: categories.global,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: false,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/diaspora/800/500",
  },

  // Extra featured articles
  {
    title: "Masjid Raya Baiturrahman Gelar Festival Ramadan Internasional, Hadirkan Qari dari 15 Negara",
    content: `<p>Masjid Raya Baiturrahman Banda Aceh akan menjadi tuan rumah Festival Ramadan Internasional yang dijadwalkan berlangsung pada bulan Ramadan 1448 H. Festival ini akan menghadirkan qari (pembaca Al-Quran) dari 15 negara termasuk Mesir, Arab Saudi, Turki, Iran, dan Malaysia.</p><p>Ketua Panitia Festival menyampaikan bahwa kegiatan ini merupakan yang pertama kali diselenggarakan dan diharapkan dapat menjadikan Masjid Raya Baiturrahman sebagai pusat kegiatan Islam internasional di Asia Tenggara. "Kami ingin Baiturrahman bukan hanya simbol kebanggaan Aceh, tapi juga landmark Islam dunia," ujarnya.</p><p>Selain pembacaan Al-Quran, festival ini juga akan menampilkan pameran kaligrafi internasional, seminar ulama, dan bazar kuliner halal dari berbagai negara. Terbuka untuk umum tanpa tiket masuk.</p>`,
    excerpt: "Masjid Raya Baiturrahman gelar Festival Ramadan Internasional dengan qari dari 15 negara.",
    categoryId: categories.daerah,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/baiturrahman/800/500",
  },
  {
    title: "Program Makan Bergizi Gratis di Sekolah Aceh Berhasil Turunkan Angka Stunting",
    content: `<p>Program Makan Bergizi Gratis (MBG) yang telah berjalan selama satu tahun di sekolah-sekolah Aceh menunjukkan hasil yang menggembirakan. Data terbaru dari Dinas Kesehatan Aceh mencatat penurunan prevalensi stunting pada anak usia sekolah sebesar 3,2 persen, dari 28,5 persen menjadi 25,3 persen.</p><p>Program yang menyasar siswa SD dan SMP di 23 kabupaten/kota ini menyediakan satu kali makan siang bergizi setiap hari sekolah dengan menu yang dirancang oleh ahli gizi. Bahan baku makanan diprioritaskan dari produk lokal untuk sekaligus mendukung petani dan nelayan Aceh.</p><p>Kepala Dinas Pendidikan Aceh menyatakan bahwa selain dampak gizi, program ini juga berdampak positif pada tingkat kehadiran siswa di sekolah. "Angka absensi siswa turun 15 persen sejak program ini berjalan. Anak-anak lebih semangat ke sekolah," jelasnya.</p>`,
    excerpt: "Program Makan Bergizi Gratis di sekolah-sekolah Aceh berhasil turunkan prevalensi stunting 3,2 persen dalam satu tahun.",
    categoryId: categories.kesehatan,
    type: "TEKS",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: false,
    imageUrl: "https://picsum.photos/seed/mbg/800/500",
  },
];

async function main() {
  // Get admin user
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user found. Run the user seed first.");

  console.log(`Seeding ${articles.length} articles...`);

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const articleSlug = slug(a.title, i + 1);
    const publishedAt = randomDate(30);

    await prisma.article.upsert({
      where: { slug: articleSlug },
      update: {},
      create: {
        title: a.title,
        slug: articleSlug,
        content: a.content,
        excerpt: a.excerpt,
        imageUrl: a.imageUrl,
        categoryId: a.categoryId,
        authorId: admin.id,
        type: a.type as any,
        status: a.status as any,
        isFeatured: a.isFeatured,
        isBreaking: a.isBreaking,
        publishedAt,
      },
    });

    console.log(`✓ ${i + 1}/${articles.length}: ${a.title.slice(0, 60)}...`);
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
