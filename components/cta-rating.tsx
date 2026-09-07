"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/star-rating";

/**
 * The real average rating, on the landing page.
 *
 * Its own client component so the CTA around it stays a server component and
 * the page stays prerendered. Fetching this on the server would make the whole
 * marketing page dynamic — a request to Firestore before anything renders — to
 * show one line that nobody is waiting on.
 *
 * Renders nothing until it knows, and nothing at all when there are no ratings.
 * A brand new site says nothing rather than "0.0/5 from 0 users", and there is
 * no placeholder to fall back on: the whole point of this component is that the
 * number is real or absent.
 */
export function CtaRating() {
    const [stats, setStats] = useState<{ avgRating: number; totalCount: number } | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/rating")
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (typeof data?.avgRating === "number" && typeof data?.totalCount === "number") {
                    setStats({ avgRating: data.avgRating, totalCount: data.totalCount });
                }
            })
            // A rating nobody can fetch is simply not shown. It is decoration on
            // a call to action, not something worth an error message.
            .catch(() => { });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!stats || stats.totalCount < 1) return null;

    return (
        <div className="mt-5 flex items-center gap-3 text-xs md:text-sm text-muted">
            <StarRating value={stats.avgRating} readOnly size={16} label="Average rating" />
            <span>
                {Number.isInteger(stats.avgRating) ? stats.avgRating : stats.avgRating.toFixed(1)}/5 from{" "}
                {stats.totalCount.toLocaleString()}{" "}
                {stats.totalCount === 1 ? "user" : "users"}
            </span>
        </div>
    );
}