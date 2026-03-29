import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Manrope, Playfair_Display, Poppins } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: "300" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: { default: "Dev OS Organizer | Journal", template: "%s | Dev OS" },
    description: "The Dojo: A high-fidelity engineering registry for sequence tracking and technical documentation.",
    applicationName: "Dev OS Organizer",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Dev OS" },
    formatDetection: { telephone: false },
};

// const projects = await prisma.project.findMany({ include: { tasks: true } });
// const allRoutes = projects.flatMap((project) => [`/${slugify(project.title)}-${project.id}`, ...project.tasks.map((t) => `/${project.title}-${project.id}/${t.slug}-${t.id}`)]);

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="dark">
            <body className={`${manrope.variable} ${playfair.variable} ${poppins.variable} antialiased`}>
                <main className="min-h-screen p-12 font-sans text-zinc-400">{children}</main>
                {/* <OfflineIndicator />
                <UpdateNotification />
                <ServiceRegister />
                <CacheWarmer routes={allRoutes} /> */}
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
