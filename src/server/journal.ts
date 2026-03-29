"use server";

import { wrapAction } from "@/lib/helper-functions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJournal(data: { title?: string | null; content: string; projectId: string }, projectParam: string) {
    return await wrapAction(async () => {
        const journal = await prisma.journal.create({ data });
        revalidatePath(`/${projectParam}`);
        return journal;
    }, "createJournal");
}

export async function getAllJournals(projectId: string) {
    return await wrapAction(async () => await prisma.journal.findMany({ where: { projectId } }), "getAllJournals");
}

export async function updateJournal(id: string, data: { title?: string | null; content: string; projectId: string }, projectParam: string) {
    return await wrapAction(async () => {
        return await prisma.$transaction(async (trx) => {
            const journal = await trx.journal.findUnique({ where: { id } });

            if (!journal) throw new Error("Journal not found");

            revalidatePath(`/${projectParam}/journals`);

            return await trx.journal.update({ where: { id }, data });
        });
    }, "updateJournal");
}

export async function deleteJournal(id: string) {
    return await wrapAction(async () => {
        const journal = await prisma.journal.delete({ where: { id }, include: { project: true } });

        if (!journal) throw new Error("Journal not found");

        revalidatePath(`/${journal.project.title}-${id}/journals`);

        return;
    }, "deleteJournal");
}
