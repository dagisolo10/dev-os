import prisma from "@/lib/prisma";
import { MetadataRoute } from "next";

// Adjust based on your setup

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://your-domain.com";

    // Fetch all project slugs for the sitemap
    const projects = await prisma.project.findMany({ select: { slug: true, id: true, updatedAt: true } });

    const projectEntries = projects.map((p) => ({ url: `${baseUrl}/${p.slug}-${p.id}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));

    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, ...projectEntries];
}
