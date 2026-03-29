import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteJournal } from "@/server/journal";
import { getProjectByID } from "@/server/project";
import { getParamID } from "@/lib/helper-functions";
import BreakCrumbs from "@/components/common/bread-crumbs";
import PurgeDialog from "@/components/common/delete-dialog";
import JournalModal from "@/components/modals/journal-modal";

export default async function JournalsPage({ params }: { params: Promise<{ project: string }> }) {
    const { project: projectParam } = await params;
    const projectId = getParamID(projectParam);
    if (!projectId) return notFound();

    const pRes = await getProjectByID(projectId);
    if (!pRes.success || !pRes.data) return notFound();

    const { data: project } = pRes;
    const journals = project.journals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <div>
            <BreakCrumbs page="journal" projectTitle={project.title} projectParam={projectParam} />

            <header className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="font-poppins text-5xl tracking-tighter text-white">Archives.</h1>
                    <p className="mt-2 text-[10px] tracking-[0.2em] text-zinc-600 uppercase">Total_Logs_Processed: {journals.length}</p>
                </div>
                <JournalModal projectId={projectId} projectParam={projectParam} />
            </header>

            {journals.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {journals.map((journal, index) => (
                        <JournalCard key={journal.id} id={journal.id} title={journal.title} length={journals.length} index={index} content={journal.content} createdAt={journal.createdAt} projectParam={projectParam} projectId={projectId} />
                    ))}
                </div>
            ) : (
                <EmptyState title={project.title} projectParam={projectParam} />
            )}
        </div>
    );
}

function JournalCard({ id, title, length, index, content, createdAt, projectParam, projectId }: { id: string; title: string | null; length: number; index: number; content: string; createdAt: Date; projectParam: string; projectId: string }) {
    return (
        <div className="group flex flex-col border border-zinc-900 bg-zinc-950 p-8 transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/10">
            <div className="flex items-start justify-between">
                <div className="mb-6 flex flex-col gap-1">
                    <time className="text-[9px] font-black tracking-widest text-blue-500/60 uppercase">{createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
                    <h2 className="font-poppins text-xl font-medium text-white transition-colors group-hover:text-blue-400">{title || "Untitled_Log_Entry"}</h2>
                </div>
                <span className="font-poppins text-[10px] font-bold text-zinc-800 transition-colors group-hover:text-blue-900">REC_{length - index}</span>
            </div>

            <div className="relative flex-1">
                <div className="absolute top-0 -left-2 h-full w-px bg-zinc-800 transition-colors group-hover:bg-blue-900/40" />
                <p className="text-sm leading-relaxed font-light text-zinc-500 italic">&quot;{content}&quot;</p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4">
                <div className="flex items-center gap-2">
                    <div className="size-1 animate-pulse rounded-full bg-zinc-800 group-hover:bg-blue-500" />
                    <span className="text-[9px] font-bold text-zinc-700 uppercase">Status: Read_Only</span>
                </div>
                <div className="flex items-center gap-4">
                    <JournalModal projectId={projectId} projectParam={projectParam} initialData={{ title, content, id }} />
                    <PurgeDialog variant="icon" id={id} displayTitle={title || "Untitled_Log_Entry"} entityType="journal" deleteAction={deleteJournal} redirectTo={`/${projectParam}/journals`} />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ title, projectParam }: { title: string; projectParam: string }) {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/20 px-6 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/5 opacity-20" />
                <div className="relative flex size-16 items-center justify-center rounded-full border border-zinc-900 bg-zinc-950">
                    <span className="font-poppins text-xl text-zinc-800">00</span>
                </div>
            </div>

            <h3 className="font-poppins text-sm font-black tracking-[0.4em] text-zinc-500 uppercase">Archive_Registry_Empty</h3>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-zinc-600">
                No historical logs detected for <span className="text-zinc-400">&quot;{title}&quot;</span>. Engineering records will appear here once committed from the project dashboard.
            </p>

            <div className="mt-8">
                <Link href={`/${projectParam}`} className="text-[10px] font-bold tracking-widest text-blue-500 uppercase underline underline-offset-8 transition-all hover:text-blue-400">
                    Return_to_Dashboard
                </Link>
            </div>
        </div>
    );
}
