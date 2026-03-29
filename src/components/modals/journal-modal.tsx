"use client";
import { useState } from "react";
import { Plus, Loader2, BookText, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createJournal, updateJournal } from "@/server/journal";
import { toast } from "sonner";
import { Label } from "../ui/label";

interface JournalModalProps {
    projectId: string;
    projectParam: string;
    initialData?: { id: string; title: string | null; content: string };
}

export default function JournalModal({ projectId, projectParam, initialData }: JournalModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const isUpdate = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = (formData.get("title") as string).trim() || null;
        const content = (formData.get("content") as string).trim();

        if (!content) return toast.error("LOG_REJECTED: Content body required.");

        setLoading(true);

        const payload = { title, content, projectId };

        const action = isUpdate ? updateJournal(initialData.id, payload, projectParam) : createJournal(payload, projectParam);

        toast.promise(action, {
            loading: isUpdate ? "PATCHING_SYSTEM_LOG..." : "SYNCING_JOURNAL_ENTRY...",
            success: () => {
                setOpen(false);
                return isUpdate ? "LOG_REGISTRY_UPDATED" : "ENTRY_COMMITTED_TO_LEDGER";
            },
            error: (err) => `SYNC_ERROR: ${err.message}`,
            finally: () => setLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isUpdate ? (
                    <Button variant="ghost" size="icon" className="size-8 text-zinc-500 hover:text-blue-500">
                        <Edit3 className="size-4" />
                    </Button>
                ) : (
                    <Button variant="ghost" size={"sm"} className="border-zinc-800 text-[11px] font-bold tracking-widest uppercase">
                        <Plus className="mr-2 size-3.5" />
                        New_Journal_Entry
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="border-zinc-900 bg-zinc-950 sm:max-w-125">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                            <BookText className="size-5 text-blue-500" />
                        </div>
                        <DialogTitle className="font-poppins text-2xl font-black tracking-tight text-white uppercase">
                            {isUpdate ? "Patch_Journal" : "Create_Journal"}
                            <span className="text-blue-600">_</span>
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">Entry_Title (Optional)</Label>
                        <Input name="title" defaultValue={initialData?.title || ""} placeholder="Daily_Standup_01" className="border-zinc-900 bg-zinc-900/50 text-zinc-200 focus:border-blue-500/50" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">System_Log_Content</Label>
                        <Textarea name="content" defaultValue={initialData?.content} placeholder="Describe status, blockers, or architecture shifts..." className="min-h-37.5 resize-none border-zinc-900 bg-zinc-900/50 text-zinc-200 focus:border-blue-500/50" />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase hover:text-white">
                                Abort
                            </Button>
                        </DialogClose>
                        <Button disabled={loading} className="bg-blue-600 px-8 text-[11px] font-medium tracking-widest text-white uppercase hover:bg-blue-500">
                            {loading && <Loader2 className="mr-2 size-3 animate-spin" />}
                            {isUpdate ? "Update_Log" : "Commit_Log"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
