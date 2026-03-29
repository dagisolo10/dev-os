"use client";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff, ShieldAlert } from "lucide-react";

export default function OfflineIndicator() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 duration-500">
            <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-black/90 px-4 py-2.5 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] backdrop-blur-md">
                <div className="relative">
                    <WifiOff className="size-4 text-red-500" />
                    <div className="absolute -top-1 -right-1">
                        <div className="relative">
                            <div className="absolute size-1.5 rounded-full bg-red-500" />
                            <div className="size-1.5 animate-ping rounded-full bg-red-500" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">Link_Severed</span>
                    <span className="text-[9px] font-bold tracking-tight text-zinc-500 uppercase">Local_Cache_Active</span>
                </div>

                <div className="ml-2 h-6 w-px bg-red-900/30" />

                <ShieldAlert className="size-3 text-zinc-700" />
            </div>
        </div>
    );
}
