export type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };

export async function wrapAction<T>(action: () => Promise<T>, actionName: string): Promise<ActionResponse<T>> {
    try {
        return { success: true, data: await action() };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Error in ${actionName}]:`, message);
        return { success: false, error: message };
    }
}

export const slugify = (text: string) => {
    return text
        .toLowerCase()
        .replace(/\./g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "")
        .trim();
};

export const getParamID = (param: string) => {
    const parts = param.split("-");
    return parts.slice(parts.length - 5).join("-");
};
