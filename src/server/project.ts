"use server";

import { wrapAction } from "@/lib/helper-functions";
import { slugify } from "@/lib/helper-functions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Task {
    title: string;
    slug: string;
    order: number;
}

export async function createProject(data: { projectTitle: string; tasks: Task[] }) {
    return wrapAction(async () => {
        const title = data.projectTitle;
        const tasks = data.tasks;

        const project = await prisma.$transaction(async (trx) => {
            const project = await trx.project.create({ data: { title } });

            const populatedTasks = tasks.map((task) => ({ ...task, projectId: project.id }));

            await trx.task.createMany({ data: populatedTasks });

            return project;
        });

        revalidatePath("/");

        return project;
    }, "createProject");
}

export async function updateProject(id: string, title: string) {
    return wrapAction(async () => {
        return await prisma.$transaction(async (trx) => {
            const project = await trx.project.findUnique({ where: { id } });

            if (!project) throw new Error("Project not found");

            revalidatePath(`/${slugify(project.title)}-${project.id}`);

            return await trx.project.update({ where: { id }, data: { title } });
        });
    }, "updateProject");
}

export async function toggleProjectStatus(id: string, completed: boolean) {
    return wrapAction(async () => {
        const project = await prisma.project.update({ where: { id }, data: { completed } });

        revalidatePath("/");
        revalidatePath(`/${slugify(project.title)}-${id}`);

        return project;
    }, "toggleProjectStatus");
}

export async function deleteProject(id: string) {
    return wrapAction(async () => {
        const project = await prisma.project.delete({ where: { id } });

        if (!project) throw new Error("Project not found");

        revalidatePath("/");
        revalidatePath(`/${project.title}-${id}`);

        return;
    }, "deleteProject");
}

export const getAllProjects = async () => await wrapAction(async () => await prisma.project.findMany({ include: { journals: true, tasks: true } }), "getAllProjects");
export const getProjectByID = async (id: string) => await wrapAction(async () => await prisma.project.findUnique({ where: { id }, include: { journals: true, tasks: true } }), "getProjectByID");
