"use client";
import { useState } from "react";
import { Code2, FileText, Loader2, Sparkles, Terminal, Edit3 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Field } from "../ui/field";

import Editor from "@monaco-editor/react";
import prettier from "prettier/standalone";
import parserEstree from "prettier/plugins/estree";
import parserTypescript from "prettier/plugins/typescript";
import { toast } from "sonner";
import { createNote, updateNote } from "@/server/note";
import { cn } from "@/lib/utils";

interface NoteModalProps {
    taskId: string;
    projectParam: string;
    taskParam: string;
    initialData?: { id: string; title: string; content: string };
}

export default function NoteModal({ taskId, taskParam, projectParam, initialData }: NoteModalProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");

    const isUpdate = !!initialData;

    const formatCode = async () => {
        if (!code) return;
        try {
            const formatted = await prettier.format(code, { parser: "typescript", plugins: [parserTypescript, parserEstree] });
            setCode(formatted);
        } catch (err) {
            toast.error("Format error: " + err);
        }
    };

    async function handleExecute(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const title = String(formData.get("title")).trim();
        const content = String(formData.get("content")).trim();

        if (!title || !content) {
            setLoading(false);
            return toast.error("Missing Fields", { description: "Please provide header and context." });
        }

        const payload = { title, content, code: code !== "" ? code : null, taskId, projectParam, taskParam };

        const action = isUpdate ? updateNote(initialData.id, payload) : createNote(payload);

        toast.promise(action, {
            loading: isUpdate ? "SYNCHRONIZING_CHANGES..." : "INITIALIZING_NOTE...",
            success: (res) => {
                if (!res.success) throw new Error(res.error);
                setOpen(false);
                return { message: isUpdate ? "NOTE_PATCHED" : "NOTE_INITIALIZED", description: `${res.data.title} sequence updated.` };
            },
            error: (err) => ({ message: "TRANSACTION_FAILED", description: err.message }),
            finally: () => setLoading(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isUpdate ? (
                    <Button variant="ghost" size="icon" className="size-8 text-zinc-500 hover:text-blue-500">
                        <Edit3 className="size-4" />
                    </Button>
                ) : (
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-xs font-bold tracking-widest text-zinc-400 hover:text-blue-500">
                        <FileText className="mr-2 size-3" /> ADD_NOTE
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="min-w-2xl overflow-hidden border-zinc-900 bg-zinc-950 p-0">
                <form onSubmit={handleExecute} className={cn(isUpdate ? "" : "h-[85vh]", "flex flex-col px-6")}>
                    <DialogHeader className="border-b border-zinc-900 py-4">
                        <DialogTitle className="font-poppins text-xl font-black tracking-wide text-white uppercase">
                            {isUpdate ? "Patch_Note" : "Create_Note"}
                            <span className="text-blue-600">{isUpdate ? "_" : "."}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="scrollbar-none flex-1 space-y-6 overflow-y-auto py-4">
                        <Field className="gap-2">
                            <Label className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Note_Header</Label>
                            <Input placeholder="e.g., Implementation Logic" name="title" defaultValue={initialData?.title} className="border-zinc-800 bg-zinc-900/30 text-white focus:border-blue-500" />
                        </Field>

                        <Field className="gap-2">
                            <Label className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Context_Description</Label>
                            <Textarea placeholder="Describe the engineering details..." name="content" defaultValue={initialData?.content} className="min-h-30 border-zinc-800 bg-zinc-900/30 text-white focus:border-blue-500" />
                        </Field>

                        {!isUpdate && (
                            <Field className="gap-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                                        <Code2 className="size-3 text-blue-500" /> Code_Snippet
                                    </Label>
                                    <Button type="button" onClick={formatCode} variant="ghost" className="h-6 px-2 text-[10px] font-semibold tracking-wider text-blue-500 hover:bg-blue-500/10">
                                        <Sparkles className="mr-1 size-3" /> FORMAT_AUTO
                                    </Button>
                                </div>

                                <div className="group relative rounded-lg border border-zinc-800 bg-[#1e1e1e] p-2 transition-all focus-within:border-blue-500/50">
                                    <Editor
                                        height="220px"
                                        defaultLanguage="typescript"
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(val) => setCode(val || "")}
                                        options={{
                                            fontSize: 12,
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            wordWrap: "on",
                                            lineNumbers: "on",
                                        }}
                                    />

                                    <div className="mt-2 flex items-center justify-between border-t border-zinc-800 px-1 pt-2">
                                        <div className="flex items-center gap-3 text-[9px] font-bold tracking-[0.15em] text-zinc-600 uppercase">
                                            <span className="flex items-center gap-1">
                                                <Terminal className="size-2.5" /> TS_ENGINE_ACTIVE
                                            </span>
                                            <span>UTF-8</span>
                                        </div>
                                        <div className="text-[8px] font-black tracking-widest text-blue-900 uppercase opacity-0 transition-opacity group-focus-within:opacity-100">IDE_MODE_ENABLED</div>
                                    </div>
                                </div>
                            </Field>
                        )}
                    </div>

                    <DialogFooter className="border-t border-zinc-900 bg-zinc-900/10 py-4">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                                Abort_Process
                            </Button>
                        </DialogClose>

                        <Button disabled={loading} className="bg-blue-600 text-[10px] font-semibold tracking-widest text-white uppercase hover:bg-blue-500">
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isUpdate ? "Patch_Note_Registry" : "Commit_Note"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
