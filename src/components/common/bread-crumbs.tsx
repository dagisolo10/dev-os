import Link from "next/link";
import { Fragment } from "react/jsx-runtime";

interface BreakCrumbsProp {
    projectTitle: string;
    taskTitle?: string;
    noteTitle?: string;
    projectParam?: string;
    taskParam?: string;
    page: "project" | "task" | "note" | "journal";
}

export default function BreakCrumbs({ projectTitle, projectParam, taskParam, taskTitle, noteTitle, page }: BreakCrumbsProp) {
    const crumbs = [
        { label: "ROOT", href: "/" },
        { label: projectTitle, href: `/${projectParam}`, active: page === "project" },
        ...(taskTitle ? [{ label: taskTitle, href: `/${projectParam}/${taskParam}`, active: page === "task" }] : []),
        ...(page === "journal" ? [{ label: "ENGINEERING_LOGS", href: "#", active: true }] : []),
        ...(noteTitle ? [{ label: noteTitle, href: "#", active: true }] : []),
    ];

    return (
        <nav className="mb-4 flex items-center gap-3 text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
            {crumbs.map((crumb, i) => (
                <Fragment key={i}>
                    {crumb.active || i === crumbs.length - 1 ? (
                        <span className="font-bold text-blue-400">{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className="transition-colors hover:text-blue-500">
                            {crumb.label}
                        </Link>
                    )}

                    {i < crumbs.length - 1 && <span>/</span>}
                </Fragment>
            ))}
        </nav>
    );
}
