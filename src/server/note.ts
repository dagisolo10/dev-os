"use server";

import { wrapAction } from "@/lib/helper-functions";
import { slugify } from "@/lib/helper-functions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface NoteData {
    title: string;
    content: string;
    code?: string | null;
    taskId: string;
    projectParam: string;
    taskParam: string;
}

export async function createNote(data: NoteData) {
    return await wrapAction(async () => {
        const { projectParam, taskParam, ...rest } = data;

        const result = await prisma.$transaction(async (trx) => {
            const notes = await trx.note.aggregate({ where: { taskId: rest.taskId }, _max: { order: true } });

            return await trx.note.create({ data: { ...rest, order: (notes._max.order || 0) + 1 } });
        });

        revalidatePath(`/${projectParam}/${taskParam}`);

        return result;
    }, "createNote");
}

export async function getAllNotes(projectId: string, taskId: string) {
    return await wrapAction(async () => await prisma.note.findMany({ where: { taskId, task: { projectId } } }), "getAllNotes");
}

export async function getNoteByID(id: string) {
    return await wrapAction(async () => {
        const note = await prisma.note.findUnique({ where: { id } });
        if (!note) throw new Error("Note not found");
        return note;
    }, "getNoteByID");
}

export async function updateNote(id: string, data: { title: string; content: string; taskId: string; projectParam: string; taskParam: string }) {
    return await wrapAction(async () => {
        return await prisma.$transaction(async (trx) => {
            const note = await trx.note.findUnique({ where: { id } });

            if (!note) throw new Error("Note not found");

            revalidatePath(`/${data.projectParam}/${data.taskParam}`);
            revalidatePath(`/${data.projectParam}/${data.taskParam}/${slugify(note.title)}-${note.id}`);

            return await trx.note.update({ where: { id }, data: { title: data.title, content: data.content, taskId: data.taskId } });
        });
    }, "updateNote");
}

export async function deleteNote(id: string) {
    return await wrapAction(async () => {
        const note = await prisma.note.delete({ where: { id }, include: { task: { include: { project: true } } } });

        const taskParam = `${note.task.slug}-${note.task.id}`;
        const projectParam = `${slugify(note.task.project.title)}-${note.task.project.id}`;

        revalidatePath(`/${projectParam}/${taskParam}`);

        return { success: true };
    }, "deleteNote");
}

export async function updateNoteCode(noteId: string, code: string) {
    return await wrapAction(async () => {
        await prisma.note.update({ where: { id: noteId }, data: { code } });
    }, "updateNote");
}
