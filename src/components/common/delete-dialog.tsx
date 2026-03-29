"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ENTITY_CONFIG = {
    project: {
        actionLabel: "Decommission_System",
        warningText: "You are initiating a manual override on the entire project architecture. This will scrub all associated tasks, notes, and registry logs from the system core.",
        successMsg: "SYSTEM_DECOMMISSIONED",
    },
    task: {
        actionLabel: "Terminate_Sequence",
        warningText: "Executing a sequence termination. This will remove this task and its documentation fragments from the project roadmap.",
        successMsg: "SEQUENCE_TERMINATED",
    },
    note: {
        actionLabel: "Scrub_Fragment",
        warningText: "Deleting this documentation fragment. This will erase the specific technical data from the task memory bank.",
        successMsg: "FRAGMENT_ERASED",
    },
    journal: {
        actionLabel: "Purge_Log_Entry",
        warningText: "Clearing this entry from the engineering log. The historical timeline will be adjusted to reflect the removal of this record.",
        successMsg: "LOG_ENTRY_PURGED",
    },
};

interface PurgeDialogProps {
    id: string;
    displayTitle: string;
    entityType: "project" | "task" | "note" | "journal";
    deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
    redirectTo?: string;
    variant?: "icon" | "button";
}

export default function PurgeDialog({ id, displayTitle, entityType, deleteAction, redirectTo, variant = "button" }: PurgeDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const config = ENTITY_CONFIG[entityType];

    async function handleDelete() {
        setIsDeleting(true);

        toast.promise(deleteAction(id), {
            loading: `EXECUTING_${entityType.toUpperCase()}_PURGE...`,
            success: (res) => {
                if (!res.success) throw new Error(res.error);

                if (redirectTo) router.push(redirectTo);
                else setOpen(false);

                return {
                    message: config.successMsg,
                    description: "Registry scrubbed successfully.",
                };
            },
            error: (err) => ({ message: "PURGE_INTERRUPTED", description: err.message }),
            finally: () => setIsDeleting(false),
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {variant === "icon" ? (
                    <Button variant="ghost" size="icon" className="size-8 text-zinc-500 hover:bg-red-500/10 hover:text-red-500">
                        <Trash2 className="size-4" />
                    </Button>
                ) : (
                    <Button variant="ghost" className="group h-8 px-2 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-500">
                        <Trash2 className="size-3.5" />
                        <span className="ml-2 text-[11px] font-bold tracking-[0.2em] uppercase">{config.actionLabel}</span>
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="border-red-900/30 bg-zinc-950 sm:max-w-md">
                <AlertDialogHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="size-5 text-red-500" />
                        </div>
                        <AlertDialogTitle className="font-poppins text-xl font-bold tracking-wider text-white uppercase">
                            Purge_<span className="text-red-600">{entityType}</span>
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="leading-relaxed text-zinc-500">
                        {config.warningText}
                        <br />
                        <br />
                        Target: <span className="font-mono font-medium text-zinc-200">[{displayTitle}]</span>
                        <br />
                        Action status: <span className="font-bold text-red-500">IRREVERSIBLE</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-6 gap-3">
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" disabled={isDeleting} className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase hover:bg-zinc-900">
                            Abort_Operation
                        </Button>
                    </AlertDialogCancel>

                    <AlertDialogAction asChild>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-900/80 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 size-3 animate-spin" />
                                    Purging...
                                </>
                            ) : (
                                "Execute_Scrub"
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
