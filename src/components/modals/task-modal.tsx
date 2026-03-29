"use client";
import { SubmitEvent, useRef, useState } from "react";
import { Plus, X, ListPlus, Loader2, Workflow, Edit3 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { slugify } from "@/lib/helper-functions";
import { createTasks, updateTask } from "@/server/task";
import { toast } from "sonner";

interface TaskModalProps {
    projectId: string;
    projectParam: string;
    initialData?: { id: string; title: string; slug: string };
}

export default function TaskModal({ projectId, projectParam, initialData }: TaskModalProps) {
    const [openState, setOpenState] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<{ title: string; slug: string; order: number }[]>([]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const isUpdate = !!initialData;

    const setOpen = (isOpen: boolean) => {
        setOpenState(isOpen);
        if (isOpen && !isUpdate) setTasks([]);
    };

    const addTask = () =>
        setTasks((prev) => {
            const newTasks = [...prev, { title: "", slug: "", order: prev.length + 1 }];
            setTimeout(() => inputRefs.current[newTasks.length - 1]?.focus(), 0);
            return newTasks;
        });

    const updateTaskLocal = (index: number, value: string) => {
        setTasks((prevTasks) => {
            if (!value.trim()) return prevTasks.map((task, i) => (i === index ? { ...task, title: "", slug: "", order: i + 1 } : task));
            const baseSlug = slugify(value);
            let finalSlug = baseSlug;
            let counter = 1;
            const otherSlugs = prevTasks.filter((_, i) => i !== index).map((t) => t.slug);
            while (otherSlugs.includes(finalSlug)) {
                finalSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            return prevTasks.map((task, i) => (i === index ? { ...task, title: value, slug: finalSlug } : task));
        });
    };

    const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index).map((task, idx) => ({ ...task, order: idx + 1 })));

    const handleExecution = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const taskTitle = String(formData.get("taskTitle")).trim();

        if (isUpdate && !taskTitle) {
            setLoading(false);
            return toast.error("VALIDATION_ERROR: Title cannot be empty.");
        }

        if (!isUpdate && tasks.length === 0) {
            setLoading(false);
            return toast.error("EXECUTION_REJECTED: Task queue is empty.");
        }

        const action = async () =>
            isUpdate
                ? updateTask(initialData.id, taskTitle, projectParam)
                : createTasks(
                      tasks.filter((task) => task.title !== ""),
                      projectId,
                      projectParam,
                  );

        toast.promise(action(), {
            loading: isUpdate ? "PATCHING_TASK_METADATA..." : "INJECTING_SEQUENCE_TO_DATABASE...",
            success: () => {
                setOpen(false);
                return isUpdate ? "TASK_UPDATED" : "SEQUENCE_COMMITTED";
            },
            error: (err) => `ACTION_FAILED: ${err.message || "System error"}`,
            finally: () => setLoading(false),
        });
    };

    return (
        <Dialog open={openState} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isUpdate ? (
                    <Button variant="ghost" size="icon" className="size-8 text-zinc-500 hover:text-blue-500">
                        <Edit3 className="size-4" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" className="border-zinc-800 text-[11px] font-bold tracking-widest uppercase">
                        <Plus className="mr-2 size-3" /> Add_Task_Sequence
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="border-zinc-900 bg-zinc-950 sm:max-w-125">
                <form onSubmit={handleExecution}>
                    <DialogHeader>
                        <DialogTitle className="font-poppins text-2xl font-black tracking-tight text-white uppercase">
                            {isUpdate ? "Patch_Task" : "Inject_Sequence"}
                            <span className="text-blue-600">_</span>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">{isUpdate ? "Modify this specific operational step." : "Append new operational steps to the roadmap."}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        {isUpdate ? (
                            /* UPDATE MODE: Single Field */
                            <div className="space-y-2">
                                <Label htmlFor="taskTitle" className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                                    Task_Title
                                </Label>
                                <Input id="taskTitle" name="taskTitle" defaultValue={initialData.title} className="border-zinc-900 bg-zinc-900/20 text-zinc-300 focus:border-blue-500/50" />
                            </div>
                        ) : (
                            /* INJECT MODE: Multi-task list */
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                                        <Workflow className="size-3 text-blue-500" /> Roadmap_Steps
                                    </Label>
                                    <Button type="button" variant="ghost" onClick={addTask} className="h-7 px-2 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10">
                                        <Plus className="size-3" /> APPEND_LINE
                                    </Button>
                                </div>

                                <div className="scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-800 max-h-64 space-y-2 overflow-y-auto pr-2">
                                    {tasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-900 py-12 text-zinc-800 transition-colors hover:border-zinc-800">
                                            <ListPlus className="mb-2 size-5 opacity-20" />
                                            <p className="text-[10px] font-black tracking-tighter uppercase">Queue_is_empty</p>
                                        </div>
                                    ) : (
                                        tasks.map((task, index) => (
                                            <div key={index} className="group flex items-center gap-3">
                                                <div className="w-5 text-[9px] font-black text-zinc-700">{(index + 1).toString().padStart(2, "0")}</div>
                                                <Input
                                                    ref={(el) => {
                                                        inputRefs.current[index] = el;
                                                    }}
                                                    value={task.title}
                                                    onChange={(e) => updateTaskLocal(index, e.target.value)}
                                                    placeholder={`Define operation ${index + 1}...`}
                                                    className="border-zinc-900 bg-zinc-900/20 text-sm text-zinc-300 focus:border-blue-500/50"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTask(index)} className="size-9 text-zinc-700 hover:text-red-500">
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 border-t border-zinc-900/50 pt-6">
                        <DialogClose asChild>
                            <Button variant="ghost" type="button" className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase hover:text-white">
                                Abort_Process
                            </Button>
                        </DialogClose>

                        <Button disabled={loading || (!isUpdate && tasks.length === 0)} className="hover:bg-primary/80 text-[11px] font-semibold tracking-widest text-white uppercase disabled:opacity-20">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : isUpdate ? "Patch_Step" : "Commit_Sequence"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
