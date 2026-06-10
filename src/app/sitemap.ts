const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://novelnest.com";

export default async function sitemap() {
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/novels`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
  ];
}
