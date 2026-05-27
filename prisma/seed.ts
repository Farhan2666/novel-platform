import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    { name: "Fantasi", slug: "fantasi" },
    { name: "Romance", slug: "romance" },
    { name: "Horor", slug: "horor" },
    { name: "Komedi", slug: "komedi" },
    { name: "Drama", slug: "drama" },
    { name: "Aksi", slug: "aksi" },
    { name: "Slice of Life", slug: "slice-of-life" },
    { name: "Sci-Fi", slug: "sci-fi" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }

  const genres = [
    { name: "Fantasi Urban", slug: "fantasi-urban" },
    { name: "Fantasi Epik", slug: "fantasi-epik" },
    { name: "Isekai", slug: "isekai" },
    { name: "Romance Sekolah", slug: "romance-sekolah" },
    { name: "Romance Dewasa", slug: "romance-dewasa" },
    { name: "Horor Psikologis", slug: "horor-psikologis" },
    { name: "Horor Supernatural", slug: "horor-supernatural" },
    { name: "Komedi Romantis", slug: "komedi-romantis" },
    { name: "Drama Keluarga", slug: "drama-keluarga" },
    { name: "Aksi Petualangan", slug: "aksi-petualangan" },
    { name: "Martial Arts", slug: "martial-arts" },
    { name: "Misteri", slug: "misteri" },
    { name: "Post-Apocalyptic", slug: "post-apocalyptic" },
    { name: "Reinkarnasi", slug: "reinkarnasi" },
  ];
  for (const genre of genres) {
    await prisma.genre.upsert({ where: { slug: genre.slug }, update: {}, create: genre });
  }

  const tags = [
    { name: "Slow Burn", slug: "slow-burn" },
    { name: "Enemies to Lovers", slug: "enemies-to-lovers" },
    { name: "Friends to Lovers", slug: "friends-to-lovers" },
    { name: "Love Triangle", slug: "love-triangle" },
    { name: "Strong Female Lead", slug: "strong-female-lead" },
    { name: "Male Lead", slug: "male-lead" },
    { name: "Anti Hero", slug: "anti-hero" },
    { name: "Multiple POV", slug: "multiple-pov" },
    { name: "First Love", slug: "first-love" },
    { name: "Second Chance", slug: "second-chance" },
    { name: "Forced Marriage", slug: "forced-marriage" },
    { name: "Contract Marriage", slug: "contract-marriage" },
    { name: "College Life", slug: "college-life" },
    { name: "System", slug: "system" },
    { name: "Leveling Up", slug: "leveling-up" },
    { name: "Reincarnation", slug: "reincarnation" },
    { name: "Transmigration", slug: "transmigration" },
    { name: "Hidden Identity", slug: "hidden-identity" },
    { name: "Revenge", slug: "revenge" },
    { name: "Amnesia", slug: "amnesia" },
  ];
  for (const tag of tags) {
    await prisma.tag.upsert({ where: { slug: tag.slug }, update: {}, create: tag });
  }

  // Dummy users
  const password = await bcrypt.hash("password123", 10);
  const users = [
    { username: "si_penulis", email: "penulis@novelnest.com", password, role: "author", avatarUrl: "" },
    { username: "si_pembaca", email: "pembaca@novelnest.com", password, role: "reader", avatarUrl: "" },
    { username: "rinnsensei", email: "rin@novelnest.com", password, role: "author", avatarUrl: "" },
    { username: "bayuln", email: "bayu@novelnest.com", password, role: "author", avatarUrl: "" },
    { username: "dian_ayu", email: "dian@novelnest.com", password, role: "author", avatarUrl: "" },
  ];

  const createdUsers = [];
  for (const u of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
    if (existingUser) {
      createdUsers.push(existingUser);
    } else {
      const user = await prisma.user.create({ data: u });
      await prisma.wallet.create({ data: { userId: user.id, coins: 100 } });
      createdUsers.push(user);
    }
  }

  const [author1, reader1, author2, author3, author4] = createdUsers;
  const allGenres = await prisma.genre.findMany();
  const allTags = await prisma.tag.findMany();
  const catFantasi = await prisma.category.findUnique({ where: { slug: "fantasi" } });
  const catRomance = await prisma.category.findUnique({ where: { slug: "romance" } });
  const catHoror = await prisma.category.findUnique({ where: { slug: "horor" } });
  const catAksi = await prisma.category.findUnique({ where: { slug: "aksi" } });
  const catDrama = await prisma.category.findUnique({ where: { slug: "drama" } });
  const catKomedi = await prisma.category.findUnique({ where: { slug: "komedi" } });

  const novelData = [
    {
      authorId: author1.id, title: "Langit Senja", description: "Seorang gadis desa menemukan kakaknya yang hilang di medan perang, namun ia telah berubah menjadi sesuatu yang bukan manusia. Dalam pencariannya, ia harus menghadapi konspirasi kerajaan dan kekuatan gelap yang mengancam seluruh negeri.", status: "ongoing", categoryId: catFantasi?.id,
      genres: [allGenres[0]?.id, allGenres[1]?.id], tags: [allTags[4]?.id, allTags[7]?.id],
    },
    {
      authorId: author2.id, title: "Hujan di Bulan Juni", description: "Pertemuan tak sengaja di perpustakaan kampus mempertemukan dua insan dengan masa lalu kelam. Antara menerima atau pergi, hati harus memilih. Sebuah cerita tentang penyembuhan dan cinta yang datang perlahan seperti hujan di bulan Juni.", status: "completed", categoryId: catRomance?.id,
      genres: [allGenres[3]?.id], tags: [allTags[0]?.id, allTags[8]?.id, allTags[9]?.id],
    },
    {
      authorId: author2.id, title: "Gelap di Ujung Lorong", description: "Seorang detektif swasta menerima kasus pembunuhan berantai yang semuanya terkait dengan sebuah lorong misterius di kota tua. Semakin dalam ia menyelidiki, semakin ia menyadari bahwa sesuatu yang supernatural mengintai di balik bayang-bayang.", status: "ongoing", categoryId: catHoror?.id,
      genres: [allGenres[5]?.id, allGenres[6]?.id], tags: [allTags[11]?.id],
    },
    {
      authorId: author3.id, title: "Legenda Pedang Naga", description: "Setelah kematian gurunya, seorang pendekar muda harus melanjutkan perjalanan untuk menemukan pedang legendaris yang konon dapat membangkitkan naga purba. Namun, ada pihak lain yang juga menginginkannya.", status: "ongoing", categoryId: catAksi?.id,
      genres: [allGenres[9]?.id, allGenres[10]?.id], tags: [allTags[5]?.id, allTags[15]?.id],
    },
    {
      authorId: author4.id, title: "Resep Cinta Mbok Darmi", description: "Mbok Darmi, janda setengah baya pemilik warung makan sederhana, mendadak viral karena masakannya. Dari situ, berbagai kisah cinta dan drama keluarga menghangatkan hari-harinya. Komedi romantis dengan bumbu dapur dan cinta.", status: "ongoing", categoryId: catKomedi?.id,
      genres: [allGenres[7]?.id, allGenres[8]?.id], tags: [allTags[0]?.id, allTags[4]?.id],
    },
    {
      authorId: author1.id, title: "Sayap Terakhir", description: "Di dunia di mana manusia bisa memiliki sayap, seorang anak lahir tanpa sayap. Dikucilkan dan dibuang, ia memulai perjalanan untuk membuktikan bahwa sayap bukanlah satu-satunya cara untuk terbang.", status: "completed", categoryId: catFantasi?.id,
      genres: [allGenres[0]?.id, allGenres[2]?.id], tags: [allTags[2]?.id, allTags[6]?.id],
    },
    {
      authorId: author3.id, title: "Bintang Jatuh di Atas Pelataran", description: "Seorang pemuda miskin menemukan benda langit jatuh di halaman rumahnya. Benda itu memberinya kemampuan untuk melihat 5 detik ke masa depan. Hidupnya berubah 180 derajat, tapi tidak selalu seperti yang ia bayangkan.", status: "ongoing", categoryId: catDrama?.id,
      genres: [allGenres[12]?.id, allGenres[13]?.id, allGenres[11]?.id], tags: [allTags[13]?.id, allTags[14]?.id],
    },
  ];

  for (const nd of novelData) {
    const existingNovel = await prisma.novel.findFirst({ where: { title: nd.title } });
    if (existingNovel) continue;

    const { genres, tags, ...novelFields } = nd;
    const novel = await prisma.novel.create({
      data: {
        ...novelFields,
        genres: { create: genres.filter(Boolean).map((gid: string) => ({ genreId: gid })) },
        tags: { create: tags.filter(Boolean).map((tid: string) => ({ tagId: tid })) },
      },
    });

    const chapterCount = nd.status === "completed" ? 5 : 3;
    for (let i = 1; i <= chapterCount; i++) {
      await prisma.chapter.create({
        data: {
          novelId: novel.id,
          chapterNumber: i,
          title: `Bab ${i}: ${["Pertemuan", "Rahasia", "Konflik", "Pengkhianatan", "Akhir yang Manis"][i - 1] || `Bagian ${i}`}`,
          content: `<p>Ini adalah konten untuk bab ${i} dari novel "${nd.title}".</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
          accessType: "free",
          coinPrice: 0,
        },
      });
    }
  }

  console.log("✅ Seed berhasil!");
  console.log(`   ${await prisma.user.count()} users`);
  console.log(`   ${await prisma.novel.count()} novels`);
  console.log(`   ${await prisma.chapter.count()} chapters`);
  console.log(`   ${await prisma.genre.count()} genres`);
  console.log(`   ${await prisma.tag.count()} tags`);
  console.log(`   ${await prisma.category.count()} categories`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
