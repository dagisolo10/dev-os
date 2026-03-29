"use server";

import { wrapAction } from "@/lib/helper-functions";
import { slugify } from "@/lib/helper-functions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTasks(data: { title: string; slug: string; order: number }[], projectId: string, projectParam: string) {
    return await wrapAction(async () => {
        const result = await prisma.$transaction(async (trx) => {
            const [orderAgg, existingTasks] = await Promise.all([trx.task.aggregate({ where: { projectId }, _max: { order: true } }), trx.task.findMany({ where: { projectId }, select: { slug: true } })]);

            const lastOrder = orderAgg._max.order || 0;
            const dbSlugs = new Set(existingTasks.map((task) => task.slug));

            const finalTasks = data.map((task, index) => {
                let uniqueSlug = task.slug;
                let counter = 1;
                while (dbSlugs.has(uniqueSlug)) {
                    uniqueSlug = `${task.slug}-${counter}`;
                    counter++;
                }
                dbSlugs.add(uniqueSlug);
                return { ...task, slug: uniqueSlug, projectId, order: lastOrder + (index + 1) };
            });

            return await trx.task.createMany({ data: finalTasks });
        });

        revalidatePath(`/${projectParam}`);
        return result;
    }, "createTasks");
}

export async function deleteTask(id: string) {
    return await wrapAction(async () => {
        const task = await prisma.task.delete({ where: { id }, include: { project: true } });

        revalidatePath(`/${slugify(task.project.title)}-${task.project.id}`);

        return { success: true };
    }, "deleteTask");
}

export async function toggleTaskCompletion(taskId: string, completed: boolean, slug: string, projectParam: string) {
    return await wrapAction(async () => {
        const updatedTask = await prisma.task.update({ where: { id: taskId }, data: { completed } });
        revalidatePath(`${projectParam}/${slug}-${taskId}`);
        return updatedTask;
    }, "toggleTaskCompletion");
}

export async function updateTask(id: string, taskTitle: string, projectParam: string) {
    return await wrapAction(async () => {
        return await prisma.$transaction(async (trx) => {
            const task = await trx.task.findUnique({ where: { id } });

            if (!task) throw new Error("Project not found");

            revalidatePath(`/${projectParam}/${task.slug}-${task.id}`);

            return await trx.task.update({ where: { id }, data: { title: taskTitle } });
        });
    }, "updateTask");
}

export async function getAllTasks(projectId: string) {
    return await wrapAction(async () => await prisma.task.findMany({ where: { projectId } }), "getAllTasks");
}
export async function getTaskByID(id: string) {
    return await wrapAction(async () => prisma.task.findUnique({ where: { id }, include: { notes: true } }), "getTaskByID");
}
