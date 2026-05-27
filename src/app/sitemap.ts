import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://novelnest.com";

  const novels = await prisma.novel.findMany({
    select: { id: true, updatedAt: true },
  });

  const novelEntries = novels.map((novel) => ({
    url: `${baseUrl}/novels/${novel.id}`,
    lastModified: novel.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/novels`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ...novelEntries,
  ];
}
