import prisma from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://dev-os-org.vercel.app";

    const projects = await prisma.project.findMany({ select: { slug: true, id: true, updatedAt: true } });

    const projectEntries = projects.map((p) => ({ url: `${baseUrl}/${p.slug}-${p.id}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));

    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, ...projectEntries];
}
