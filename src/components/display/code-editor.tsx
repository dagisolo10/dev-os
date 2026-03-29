"use client";
import { Editor } from "@monaco-editor/react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { toast } from "sonner";

import prettier from "prettier/standalone";
import parserEstree from "prettier/plugins/estree";
import parserTypescript from "prettier/plugins/typescript";
import { Copy, Save, Sparkles } from "lucide-react";
import { updateNoteCode } from "@/server/note";

export default function CodeDisplay({ code, noteId }: { code: string; noteId: string }) {
    const [currentCode, setCurrentCode] = useState(code);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleCodeChange = (value: string | undefined) => {
        const newVal = value || "";
        setCurrentCode(newVal);
        setHasChanges(newVal !== code);
    };

    const formatCode = async () => {
        try {
            const formatted = await prettier.format(currentCode, { parser: "typescript", plugins: [parserTypescript, parserEstree], semi: true, singleQuote: false, tabWidth: 4, printWidth: 300 });
            setCurrentCode(formatted);
            setHasChanges(formatted !== code);
            toast.success("SYNTAX_STABILIZED");
        } catch {
            toast.error("Format error: Check syntax.");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        toast.promise(updateNoteCode(noteId, currentCode), {
            loading: "COMMITTING_CHANGES...",
            success: () => {
                setHasChanges(false);
                setIsSaving(false);
                return "DATABASE_SYNC_COMPLETE";
            },
            error: (err) => `SYNC_FAILED: ${err.message}`,
            finally: () => setIsSaving(false),
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentCode);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-blue-600" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">Source_Code</span>
                </div>

                <div className="flex items-center gap-4">
                    {hasChanges && (
                        <Button onClick={handleSave} variant={"outline"} disabled={isSaving} className="h-6 px-2 text-[10px] font-semibold tracking-wider hover:bg-blue-500/10">
                            <Save className="mr-1 size-3" /> COMMIT_CHANGES
                        </Button>
                    )}

                    <Button type="button" onClick={formatCode} variant="ghost" className="text-primary h-6 px-2 text-[10px] font-semibold tracking-wider hover:bg-blue-500/10">
                        <Sparkles className="mr-1 size-3" /> FORMAT_CODE
                    </Button>

                    <Button type="button" variant={"outline"} onClick={handleCopy} className="h-6 px-2 text-[10px] font-semibold tracking-wider hover:bg-blue-500/10">
                        <Copy className="mr-1 size-2.5" /> COPY
                    </Button>
                </div>
            </div>

            <Separator className="my-6" />

            <Editor height="500px" defaultLanguage="typescript" theme="vs-dark" value={currentCode} onChange={handleCodeChange} options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: "on", lineNumbers: "on", padding: { top: 12, bottom: 12 } }} />
        </div>
    );
}
