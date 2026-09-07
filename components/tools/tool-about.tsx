"use client";

import { usePathname } from "next/navigation";
import { getToolContent } from "@/lib/tool-content";

export default function ToolAbout() {
    const pathname = usePathname();
    const content = pathname ? getToolContent(pathname) : undefined;

    if (!content) return null;

    return (
        <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 pb-12 pt-4">
            <div className="border-t border-card pt-8">
                <h2 className="text-lg font-semibold text-fg mb-3">{content.heading}</h2>
                <div className="space-y-4">
                    {content.paragraphs.map((paragraph, i) => (
                        <p key={i} className="text-sm leading-7 text-muted">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}