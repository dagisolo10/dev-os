import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getParamID } from "@/lib/helper-functions";
import TaskList from "@/components/display/task-list";
import TaskModal from "@/components/modals/task-modal";
import BreakCrumbs from "@/components/common/bread-crumbs";
import PurgeDialog from "@/components/common/delete-dialog";
import JournalModal from "@/components/modals/journal-modal";
import ProjectModal from "@/components/modals/project-modal";
import StatusToggle from "@/components/display/project-status-toggle";
import { deleteProject, getProjectByID, toggleProjectStatus } from "@/server/project";

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
    const { project: projectParam } = await params;

    const projectId = getParamID(projectParam);
    if (!projectId) return notFound();

    const pRes = await getProjectByID(projectId);
    if (!pRes.success || !pRes.data) return notFound();

    const { data: project } = pRes;

    return (
        <div>
            <BreakCrumbs page="project" projectTitle={project.title} />

            <header className="mb-8 flex items-end justify-between">
                <div className="space-y-4">
                    <h1 className={cn("font-poppins text-5xl tracking-tight transition-all duration-500", project.completed ? "text-zinc-600 line-through decoration-zinc-800" : "text-white")}>{project.title}</h1>
                    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 transition-all", project.completed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]")}>
                        {project.completed ? <Lock className="size-3" /> : <Unlock className="size-3 animate-pulse" />}
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">{project.completed ? "Registry_Locked" : "Project_Active"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusToggle id={project.id} initialStatus={project.completed} toggleAction={toggleProjectStatus} />
                    <ProjectModal initialData={{ id: project.id, title: project.title }} />
                    <PurgeDialog id={project.id} displayTitle={project.title} entityType="project" deleteAction={deleteProject} redirectTo="/" />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">
                <div className="col-span-7">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-poppins text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Roadmap_Sequence</h2>
                        <TaskModal projectId={projectId} projectParam={projectParam} />
                    </div>

                    <TaskList tasks={project.tasks} projectParam={projectParam} />
                </div>

                <aside className="col-span-5">
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="ghost" size={"sm"} className="font-poppins text-primary border-zinc-800 text-[10px] font-bold tracking-[0.3em] uppercase">
                            <Link href={`/${projectParam}/journals`}>[ View_Registry ]</Link>
                        </Button>
                        <JournalModal projectId={projectId} projectParam={projectParam} />
                    </div>

                    <div className={cn("space-y-8 border-l border-zinc-900 pl-8 transition-all", project.journals.length === 0 && "border-none pl-0")}>
                        {project.journals.length > 0 ? (
                            project.journals.map((journal) => (
                                <div key={journal.id} className="group relative">
                                    <div className="absolute top-1/2 -left-10 size-4 -translate-y-1/2 rounded-full border-4 border-black bg-zinc-800 shadow-[0_0_10px_rgba(0,0,0,1)] transition-colors group-hover:bg-blue-600" />
                                    <time className="text-[9px] font-semibold tracking-widest text-zinc-600 uppercase">{journal.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                                    <h4 className="font-poppins mt-1 text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">{journal.title || "UNTITLED_LOG_ENTRY"}</h4>
                                    <p className="mt-2 line-clamp-2 max-w-sm text-xs leading-relaxed text-zinc-500 italic">&quot;{journal.content}&quot;</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-900 bg-zinc-950/50 px-6 py-12 text-center">
                                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-900/50">
                                    <span className="font-poppins text-2xl text-zinc-300">!</span>
                                </div>
                                <h3 className="font-poppins text-xs font-black tracking-widest text-zinc-500 uppercase">Status: System_Idle</h3>
                                <p className="text-zinc-6 00 mt-2 text-xs leading-relaxed">
                                    No engineering logs detected in the local registry. <br />
                                    Initialize first entry to track progress.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
