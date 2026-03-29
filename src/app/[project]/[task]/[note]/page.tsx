import { notFound } from "next/navigation";
import { getNoteByID } from "@/server/note";
import { getTaskByID } from "@/server/task";
import { getProjectByID } from "@/server/project";
import { getParamID } from "@/lib/helper-functions";
import NoteModal from "@/components/modals/note-modal";
import BreakCrumbs from "@/components/common/bread-crumbs";
import CodeDisplay from "@/components/display/code-editor";

export default async function NotePage({ params }: { params: Promise<{ project: string; task: string; note: string }> }) {
    const { project: projectParam, task: taskParam, note: noteParam } = await params;
    const projectId = getParamID(projectParam);
    const taskId = getParamID(taskParam);
    const noteId = getParamID(noteParam);
    if (!projectId || !taskId || !noteId) return notFound();

    const [pRes, tRes, nRes] = await Promise.all([getProjectByID(projectId), getTaskByID(taskId), getNoteByID(noteId)]);
    if (!pRes.success || !tRes.success || !nRes.success || !pRes.data || !tRes.data) return notFound();

    const { data: project } = pRes;
    const { data: task } = tRes;
    const { data: note } = nRes;

    return (
        <div>
            <BreakCrumbs page="note" projectTitle={project.title} projectParam={projectParam} taskTitle={task.title} taskParam={taskParam} noteTitle={note.title} />
            <article>
                <div className="flex items-center justify-between gap-4">
                    <h1 className="font-poppins mb-2 text-3xl font-medium text-white">{note.title}</h1>
                    <NoteModal taskId={taskId} projectParam={projectParam} taskParam={taskParam} initialData={{ id: note.id, title: note.title, content: note.content }} />
                </div>
                <p className="leading-relaxed font-light text-zinc-400">{note.content}</p>
            </article>
            <CodeDisplay code={note.code || ""} noteId={noteId} />
        </div>
    );
}
