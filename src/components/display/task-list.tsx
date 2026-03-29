"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Task } from "@prisma/client";
import { toggleTaskCompletion } from "@/server/task";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Database, Terminal } from "lucide-react";

export default function TaskList({ tasks, projectParam }: { tasks: Task[]; projectParam: string }) {
    const [taskList, setTaskList] = useState(tasks);

    const handleToggle = async (taskId: string, checked: boolean, slug: string) => {
        setTaskList((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: checked } : task)));

        try {
            await toggleTaskCompletion(taskId, checked, slug, projectParam);
            toast.success(checked ? "TASK_COMPLETED" : "TASK_REOPENED", { description: `Status updated in system registry.` });
        } catch {
            setTaskList((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !checked } : task)));
            toast.error("SYNC_ERROR: Could not update status.");
        }
    };

    useEffect(() => {
        setTaskList(tasks);
    }, [tasks]);

    if (taskList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/50 py-16 transition-all">
                <div className="relative mb-4 flex size-16 items-center justify-center rounded-full bg-zinc-900/50">
                    <Database className="size-6 text-zinc-700" />
                    <div className="absolute top-1 right-1 size-3 animate-pulse rounded-full border border-blue-500/50 bg-blue-600/70" />
                </div>
                <div className="space-y-1 text-center">
                    <h3 className="font-poppins text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">Sequence_Not_Initialized</h3>
                    <p className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-700 uppercase">
                        <Terminal className="size-3" /> No operational tasks found in registry.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {taskList
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                    <div
                        key={task.id}
                        className={cn(
                            "group flex items-center justify-between rounded-xl border p-4 transition-all duration-300",
                            task.completed ? "border-zinc-900 bg-zinc-950/40 opacity-70" : "border-zinc-800/50 bg-zinc-950 hover:border-blue-500/30 hover:shadow-[0_0_20px_-12px_rgba(59,130,246,0.5)]",
                        )}
                    >
                        <div className="flex items-center gap-5">
                            <span className="font-poppins text-xs font-bold text-zinc-700 transition-colors group-hover:text-blue-900">{task.order.toString().padStart(2, "0")}</span>

                            <button
                                onClick={() => handleToggle(task.id, !task.completed, task.slug)}
                                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                className={cn(
                                    "relative flex size-2.5 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90",
                                    task.completed ? "border-blue-600 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "border-zinc-800 bg-transparent hover:border-zinc-600",
                                )}
                            />

                            <span className={cn("text-sm font-medium transition-all", task.completed ? "text-zinc-600 line-through decoration-zinc-500/40" : "")}>{task.title}</span>
                        </div>

                        <Link href={`/${projectParam}/${task.slug}-${task.id}`} className="flex items-center gap-2 rounded-lg bg-zinc-900/0 px-3 py-2 transition-all hover:bg-zinc-900 hover:text-blue-500">
                            <span className="text-[9px] font-black tracking-widest text-zinc-700 uppercase opacity-0 transition-all duration-300 group-hover:opacity-100">View_Details</span>
                            <ChevronRight className="size-4 text-zinc-600 group-hover:text-blue-500" />
                        </Link>
                    </div>
                ))}
        </div>
    );
}
