import { getAllProjects } from "../server/project";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Cpu, Terminal } from "lucide-react";
import { slugify } from "@/lib/helper-functions";
import ProjectModal from "@/components/modals/project-modal";

export default async function ProjectsPage() {
    const projectRes = await getAllProjects();

    if (!projectRes.success || !projectRes.data) return notFound();
    const projects = projectRes.data;

    return (
        <div>
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="font-poppins text-6xl font-black tracking-tight text-white">
                        Projects<span className="text-blue-600">.</span>
                    </h1>
                    <p className="mt-4 font-medium text-zinc-500">System status: {projects.length} active workflows.</p>
                </div>

                <ProjectModal />
            </header>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <EmptyState />
                ) : (
                    projects
                        .sort((_, b) => (b.completed ? -1 : 1))
                        .map((project) => (
                            <Link key={project.id} href={`/${slugify(project.title)}-${project.id}`} className={cn(project.completed ? "bg-blue-500/10" : "bg-zinc-950", "group relative block overflow-hidden border border-zinc-900/80 p-8 transition-all duration-500 hover:bg-zinc-900/20")}>
                                <Borders />

                                <div className="mb-4 flex items-center justify-between">
                                    <div className="relative">
                                        <div className={cn("absolute size-1.5 rounded-full", project.completed ? "" : "bg-emerald-500")} />
                                        <div className={cn("size-1.5 rounded-full", project.completed ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" : "animate-ping bg-emerald-500")} />
                                    </div>
                                    <span className={cn(project.completed ? "text-blue-500" : "text-emerald-600", "text-[10px] font-bold tracking-[0.2em] uppercase")}>{project.completed ? "Executed" : "In_Progress"}</span>
                                </div>

                                <h3 className="font-poppins text-2xl font-bold text-white transition-colors group-hover:text-blue-400">{project.title}</h3>

                                <div className="mt-6 flex gap-4">
                                    <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">{project.tasks.length} Tasks</div>
                                    <div className="h-4 w-px bg-zinc-800" />
                                    <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">{project.journals.length} Logs</div>
                                </div>
                            </Link>
                        ))
                )}
            </div>
        </div>
    );
}

function Borders() {
    const size = "size-3";
    const color = "border-blue-500/50";

    return (
        <>
            <div className={cn(size, color, "absolute top-0 left-0 border-t border-l")} />
            <div className={cn(size, color, "absolute top-0 right-0 border-t border-r")} />
            <div className={cn(size, color, "absolute bottom-0 left-0 border-b border-l")} />
            <div className={cn(size, color, "absolute right-0 bottom-0 border-r border-b")} />
        </>
    );
}

export function EmptyState() {
    return (
        <div className="relative col-span-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-900 bg-zinc-950/50 py-8 text-center">
            <Borders />

            <div className="relative mb-6">
                <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl" />
                <div className="relative flex size-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-blue-500">
                    <Cpu className="size-8" />
                </div>
            </div>

            <h2 className="font-poppins text-xl font-bold tracking-tight text-white uppercase">No_Active_Workflows</h2>

            <p className="mt-2 max-w-70 text-xs leading-relaxed font-medium tracking-wide text-zinc-500 uppercase">System memory is empty. Initialize a new project sequence to begin data tracking.</p>

            <div className="mt-4">
                <ProjectModal />
            </div>

            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
                <Terminal className="size-3" />
                Waiting for input...
            </div>
        </div>
    );
}
