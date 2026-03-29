"use client";
import { useEffect } from "react";

export function CacheWarmer({ routes }: { routes: string[] }) {
    useEffect(() => {
        if ("serviceWorker" in navigator && navigator.onLine) {
            const timer = setTimeout(() => routes.forEach((route) => fetch(route, { priority: "low" }).catch(() => console.log(`Pre-fetch failed for: ${route}`))), 2000);
            return () => clearTimeout(timer);
        }
    }, [routes]);

    return null;
}
