"use client";
import { SubmitEvent, useRef, useState } from "react";
import { Plus, X, ListPlus, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { slugify } from "@/lib/helper-functions";
import { createProject, updateProject } from "@/server/project";
import { toast } from "sonner";

interface ProjectModalProps {
    initialData?: { id: string; title: string };
}

export default function ProjectModal({ initialData }: ProjectModalProps) {
    const [open, setOpenState] = useState<boolean>(false);
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

    const updateTask = (index: number, value: string) => {
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

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const projectTitle = String(formData.get("projectTitle")).trim();

        if (!projectTitle) {
            setLoading(false);
            return toast.error("Missing field", { description: "Please provide project title" });
        }

        const action = isUpdate ? updateProject(initialData.id, projectTitle) : createProject({ projectTitle, tasks: tasks.filter((task) => task.title !== "") });

        toast.promise(action, {
            loading: isUpdate ? "SYNCHRONIZING_CHANGES..." : "PROVISIONING_SYSTEM_WORKSPACE...",
            success: (res) => {
                if (!res.success) throw new Error(res.error);
                setOpen(false);
                return { message: isUpdate ? "PARAMETERS_UPDATED" : "WORKSPACE_INITIALIZED", description: `${res.data.title} sequence modified.` };
            },
            error: (err) => ({ message: "TRANSACTION_FAILED", description: err.message }),
            finally: () => setLoading(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isUpdate ? (
                    <Button variant="ghost" className="group h-8 border text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase transition-all hover:bg-red-500/10">
                        Edit_Project
                    </Button>
                ) : (
                    <Button>Create a new project</Button>
                )}
            </DialogTrigger>

            <DialogContent className="border-zinc-900 bg-zinc-950 sm:max-w-125">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-poppins text-2xl font-black tracking-tight text-white uppercase">
                            {isUpdate ? "Patch_Parameters" : "Init_Project"}
                            <span className="text-blue-600">{isUpdate ? "_" : "."}</span>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">{isUpdate ? "Modify existing system metadata." : "Define the system parameters and roadmap sequence."}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <Field>
                            <Label htmlFor="title" className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                                Project_Title
                            </Label>
                            <Input id="title" name="projectTitle" defaultValue={isUpdate ? initialData.title : ""} placeholder="e.g. Universal Notification Parser" className="border-zinc-800 bg-zinc-900/50 text-white focus:border-blue-500" />
                        </Field>

                        {!isUpdate && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Roadmap_Sequence (Optional)</Label>
                                    <Button type="button" variant="ghost" onClick={addTask} className="h-7 px-2 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10">
                                        <Plus className="size-3" /> ADD_STEP
                                    </Button>
                                </div>

                                <div className="scrollbar-thin scrollbar-track-zinc-500 scrollbar-thumb-zinc-800 max-h-50 space-y-2 overflow-y-auto pr-2">
                                    {tasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-900 py-8 text-zinc-700">
                                            <ListPlus className="mb-2 size-5" />
                                            <p className="text-[10px] font-bold uppercase">No tasks queued</p>
                                        </div>
                                    ) : (
                                        tasks.map((task, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-4 text-[10px] font-bold text-zinc-600">{(index + 1).toString().padStart(2, "0")}</div>
                                                <Input
                                                    ref={(el) => {
                                                        inputRefs.current[index] = el;
                                                    }}
                                                    value={task.title}
                                                    onChange={(e) => updateTask(index, e.target.value)}
                                                    placeholder={`Task ${index + 1}...`}
                                                    className="border-zinc-900 bg-zinc-900/30 text-sm"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTask(index)} className="size-9 text-zinc-600 hover:text-red-500">
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="ghost" type="button" className="text-zinc-500 hover:bg-zinc-900 hover:text-white">
                                Abort_Process
                            </Button>
                        </DialogClose>

                        <Button disabled={loading} className="bg-blue-600 text-[11px] font-semibold tracking-widest text-white uppercase hover:bg-blue-500">
                            {loading && <Loader2 className="size-4 animate-spin" />}
                            {isUpdate ? "Patch_Registry" : "Execute_Creation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
