import prisma from "@/lib/prisma";
import { MetadataRoute } from "next";
import { slugify } from "@/lib/helper-functions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://dev-os-org.vercel.app";

    const projects = await prisma.project.findMany({ select: { title: true, id: true, updatedAt: true } });

    const projectEntries = projects.map((p) => ({ url: `${baseUrl}/${slugify(p.title)}-${p.id}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));

    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, ...projectEntries];
}
