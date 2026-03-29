import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Dev OS Organizer: Engineering Ledger",
        short_name: "DevOS",
        description: "High-performance registry for tracking project sequences, documentation fragments, and engineering logs.",
        start_url: "/",
        background_color: "#000000",
        theme_color: "#000000",
        display: "standalone",
        icons: [
            { src: "/icon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        screenshots: [
            {
                src: "/icon/desktop-view.png",
                sizes: "1920x1080",
                type: "image/png",
                form_factor: "wide",
            },
        ],
    };
}
