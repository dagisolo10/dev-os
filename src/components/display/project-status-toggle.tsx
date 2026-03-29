"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
    id: string;
    initialStatus: boolean;
    toggleAction: (id: string, status: boolean) => Promise<{ success: boolean }>;
}

export default function StatusToggle({ id, initialStatus, toggleAction }: StatusToggleProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = !initialStatus;

        const res = await toggleAction(id, newStatus);

        if (res.success) {
            toast.success(newStatus ? "PROJECT_OFFLINE" : "PROJECT_ONLINE", {
                description: newStatus ? "All sequences archived." : "Registry reopened for engineering.",
            });
        } else {
            toast.error("SYNC_ERROR: Registry update failed.");
        }
        setLoading(false);
    };

    return (
        <Button variant="outline" size="sm" disabled={loading} onClick={handleToggle} className={cn("border-zinc-800 bg-zinc-950 text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-900", initialStatus ? "border-emerald-500/20 text-emerald-500" : "text-zinc-400")}>
            {initialStatus ? (
                <>
                    <RotateCcw className="mr-2 size-3" /> Reopen_Project
                </>
            ) : (
                <>
                    <CheckCircle2 className="mr-2 size-3" /> Finalize_Sequence
                </>
            )}
        </Button>
    );
}
