"use client";
import { useState, useEffect } from "react";

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (!navigator.onLine) return setIsOnline(false);

            try {
                const response = await fetch("/favicon.ico", { method: "HEAD", cache: "no-store" });
                setIsOnline(response.ok);
            } catch {
                setIsOnline(false);
            }
        };

        window.addEventListener("online", checkStatus);
        window.addEventListener("offline", checkStatus);

        const interval = setInterval(checkStatus, 30000);

        return () => {
            window.removeEventListener("online", checkStatus);
            window.removeEventListener("offline", checkStatus);
            clearInterval(interval);
        };
    }, []);

    return isOnline;
}
