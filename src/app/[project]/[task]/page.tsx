import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getProjectByID } from "@/server/project";
import NoteModal from "@/components/modals/note-modal";
import TaskModal from "@/components/modals/task-modal";
import { deleteTask, getTaskByID } from "@/server/task";
import BreakCrumbs from "@/components/common/bread-crumbs";
import PurgeDialog from "@/components/common/delete-dialog";
import { getParamID, slugify } from "@/lib/helper-functions";
import { CheckCircle2, ChevronRight, Circle } from "lucide-react";

export default async function TaskPage({ params }: { params: Promise<{ project: string; task: string }> }) {
    const { project: projectParam, task: taskParam } = await params;

    const projectId = getParamID(projectParam);
    const taskId = getParamID(taskParam);
    if (!projectId || !taskId) return notFound();

    const [pRes, tRes] = await Promise.all([getProjectByID(projectId), getTaskByID(taskId)]);
    if (!pRes.success || !tRes.success || !pRes.data || !tRes.data) return notFound();

    const { data: project } = pRes;
    const { data: task } = tRes;

    return (
        <div>
            <BreakCrumbs page="task" projectTitle={project.title} projectParam={projectParam} taskTitle={task.title} />

            <header className="mb-8">
                <div className="flex items-end justify-between">
                    <div className="space-y-3">
                        <h1 className={cn("font-poppins text-5xl leading-[1.1] tracking-tight transition-all", task.completed ? "text-zinc-500 line-through decoration-zinc-800" : "text-white")}>{task.title}</h1>
                        <div className={cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 transition-all", task.completed ? "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]" : "border-zinc-800 bg-zinc-900/50 text-zinc-500")}>
                            {task.completed ? <CheckCircle2 className="size-3" /> : <Circle className="size-3 animate-pulse" />}
                            <span className="text-[10px] font-black tracking-widest uppercase">{task.completed ? "Status: _TERMINATED" : "Status: _EXECUTING"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <TaskModal projectId={projectId} projectParam={projectParam} initialData={{ title: task.title, id: task.id, slug: task.slug }} />
                        <NoteModal taskId={taskId} projectParam={projectParam} taskParam={taskParam} />
                        <PurgeDialog id={task.id} displayTitle={task.title} entityType="task" variant="icon" deleteAction={deleteTask} redirectTo={`/${projectParam}`} />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-blue-500 uppercase">Implementation_Task</h2>
                    <span className="text-xs tracking-widest text-zinc-500 uppercase">{task.notes.length} Fragments</span>
                </div>
            </header>

            <div className="flex flex-col gap-3">
                {task.notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/20 py-12 transition-all">
                        <div className="relative mb-6 flex size-16 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <div className="absolute -inset-1 animate-pulse rounded-xl bg-blue-500/5 blur-sm" />
                            <div className="flex flex-col gap-1">
                                <div className="h-1 w-6 rounded-full bg-zinc-800" />
                                <div className="h-1 w-4 rounded-full bg-zinc-700" />
                                <div className="h-1 w-5 rounded-full bg-zinc-800" />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="font-poppins text-[11px] font-black tracking-[0.4em] text-zinc-500 uppercase">Void_Fragment_Detected</h3>
                            <p className="max-w-50 text-[10px] leading-relaxed font-bold text-zinc-700 uppercase">No documentation fragments associated with this task registry.</p>
                            <div className="pt-4">
                                <NoteModal taskId={taskId} projectParam={projectParam} taskParam={taskParam} />
                            </div>
                        </div>
                    </div>
                ) : (
                    task.notes.map((note) => {
                        const path = `/${projectParam}/${taskParam}/${slugify(note.title)}-${note.id}`;

                        return (
                            <Link key={note.id} href={path} className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-4 transition-all hover:border-blue-500/40 hover:bg-zinc-900/10">
                                <div className="flex flex-1 items-center gap-6">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black tracking-tighter text-zinc-800 uppercase group-hover:text-blue-900">Note</span>
                                        <span className="font-poppins text-lg font-black text-zinc-700 transition-colors group-hover:text-blue-600">{note.order.toString().padStart(2, "0")}</span>
                                    </div>

                                    <div className="h-8 w-px bg-zinc-900 group-hover:bg-blue-900/30" />

                                    <div className="flex min-w-0 flex-col gap-1">
                                        <h3 className="font-poppins truncate text-lg font-bold text-white transition-colors group-hover:text-blue-400">
                                            {note.title}
                                            <span className="text-blue-600 opacity-0 group-hover:opacity-100">_</span>
                                        </h3>
                                        <p className="max-w-2xl truncate text-xs font-medium text-zinc-600 group-hover:text-zinc-400">{note.content}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {note.code && (
                                        <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1">
                                            <div className="size-1.5 animate-pulse rounded-full bg-blue-500" />
                                            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Code_Attached</span>
                                        </div>
                                    )}

                                    <div className="flex size-8 items-center justify-center rounded-full border border-zinc-900 transition-all group-hover:border-blue-500/50 group-hover:bg-blue-500/10">
                                        <ChevronRight className="size-4 text-zinc-700 transition-colors group-hover:text-blue-500" />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 h-px w-0 bg-linear-to-r from-transparent via-blue-600 to-transparent transition-all duration-500 group-hover:w-full" />
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
