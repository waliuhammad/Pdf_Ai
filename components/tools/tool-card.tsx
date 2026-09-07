"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { useToolText } from "@/hooks/useToolText";

interface ToolCardProps {
    name: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color?: string;
    badge?: string;
    tier?: "basic";
    comingSoon?: boolean;
}

export default function ToolCard({
    name,
    description,
    icon: Icon,
    href,
    color = "bg-primary/10",
    badge,
    tier,
    comingSoon = false,
}: ToolCardProps) {
    const { toolName, toolDescription, badgeLabel } = useToolText();
    const shownName = toolName(href, name);
    const shownDescription = toolDescription(href, description);
    // The lift on hover was a framer-motion whileHover. This card is on screen
    // twenty-two times on /tools, and the profile put framer among the most
    // expensive scripts there — for a translate and a scale, which CSS does free.
    //
    // Two layouts, one component. Three of these share a row on a phone, so at
    // roughly 110px wide the content is centred and the type is small: icon
    // above a short title above a clamped description. From sm it is the
    // original left-aligned card, min-h-[165px] included, so a grid row stays
    // even.
    const card = (
        <div
            className={`
                group
                relative
                flex
                h-full
                w-full
                flex-col
                items-center
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-card
                p-3
                text-center
                transition-all
                duration-200
                hover:border-primary/40
                hover:shadow-xl
                sm:min-h-[165px]
                sm:items-stretch
                sm:p-5
                sm:text-left
                ${comingSoon ? "" : "hover:-translate-y-[5px] hover:scale-[1.02]"}
            `}
        >
            {/* "B" tag: free-to-use basic tools, no per-tool cap on any plan.
                Shown at every width, unlike the badge pill below which only
                appears from lg — this is a plan-relevant fact, not decoration. */}
           {/* "B" tag: free-to-use basic tools, no per-tool cap on any plan.
    Shown at every width, unlike the badge pill below which only
    appears from lg — this is a plan-relevant fact, not decoration. */}
{tier === "basic" && (
    <span
        className="
            absolute
            right-1.5
            top-1.5
            z-10
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            bg-primary
            text-[8px]
            font-bold
            text-primary-foreground
            shadow-sm
            sm:right-2.5
            sm:top-2.5
            sm:h-5
            sm:w-5
            sm:text-[10px]
        "
        title="Basic tool — free on every plan"
        aria-label="Basic tool, free on every plan"
    >
        B
    </span>
)}

            {/* Icon */}
            <div
                className={`
                    mb-2
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    sm:mb-4
                    sm:h-12
                    sm:w-12
                    ${color}
                `}
            >
                <Icon
                    size={18}
                    className="text-primary transition-transform duration-300 group-hover:scale-110 sm:size-[22px]"
                />
            </div>

            {/* min-w-0 lets a long name like "PDF to PowerPoint" wrap inside the
                column instead of forcing the card wider than its grid track. */}
            <div className="w-full min-w-0">
                <h3 className="text-[11px] font-semibold leading-tight text-fg transition-colors duration-300 [overflow-wrap:anywhere] group-hover:text-primary sm:text-base sm:leading-snug">
                    {shownName}
                </h3>

                <p className="mt-1 text-[10px] leading-tight text-muted line-clamp-3 sm:mt-2 sm:text-sm sm:leading-6 sm:line-clamp-2 sm:block hidden">
                    {shownDescription}
                </p>
            </div>

            {/* Badge. Sits under the description on a phone, where a corner chip
                would cover the title in a 110px-wide card; the original absolute
                top-right corner from sm. */}
            {(comingSoon || badge) && (
                <span
                    className={`
                        hidden
                        mt-2
                        shrink-0
                        rounded-full
                        bg-primary/10
                        px-2
                        py-0.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-primary
                        lg:inline-flex
                        lg:absolute
                        ${tier === "basic" ? "lg:right-9" : "lg:right-4"}
                        lg:top-4
                        lg:mt-0
                        lg:px-2.5
                        lg:py-1
                        lg:text-[10px]
                    `}
                >
                    {comingSoon ? badgeLabel("Soon") : badgeLabel(badge!)}
                </span>
            )}

            {/* Hover Glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-primary/5
                    via-transparent
                    to-primary/5
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                "
            />
        </div>
    );

    // Tools without a page yet render as a plain container so they can't 404.
    return comingSoon ? (
        <div className="block h-full cursor-not-allowed opacity-60">{card}</div>
    ) : (
        // Twenty-two of these sit on /tools, and Next prefetches every link in
        // view: 112 requests for a page where one card gets clicked, several of
        // them fetched repeatedly as the grid re-renders on search. Hover is
        // early enough to prefetch.
        <Link href={href} prefetch={false} className="block h-full">
            {card}
        </Link>
    );
}