"use client";

import { useEffect, useRef } from "react";
import {
    ADSENSE_CLIENT_ID,
    isAdSenseEnabled,
    showDevPlaceholder,
} from "@/lib/adsense";

function AdContainer({
    children,
    label,
    minHeight,
    className,
    style,
}: {
    children: React.ReactNode;
    label: boolean;
    minHeight: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div className={className} style={{ minHeight, ...style }}>
            {label && <div>Advertisement</div>}
            {children}
        </div>
    );
}

/**
 * Reusable fluid in-article ad, for dropping between sections of a long
 * content page (blog post, guide, tutorial).
 *
 * Same safety guarantees as DisplayAd: inert until configured, StrictMode-safe
 * push, and failure never breaks the page.
 */
type InArticleAdProps = {
    /** Ad unit slot ID from the AdSense dashboard. */
    slot: string;
    /** Show the "Advertisement" label. Default true. */
    label?: boolean;
    /** Reserved vertical space (px) to reduce layout shift. Default 250. */
    minHeight?: number;
    className?: string;
    style?: React.CSSProperties;
};

export default function InArticleAd({
    slot,
    label = true,
    minHeight = 250,
    className,
    style,
}: InArticleAdProps) {
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current || !isAdSenseEnabled()) return;
        try {
            const w = window as unknown as { adsbygoogle?: unknown[] };
            w.adsbygoogle = w.adsbygoogle || [];
            w.adsbygoogle.push({});
            pushed.current = true;
        } catch {
            /* never break the app if an ad fails to load */
        }
    }, []);

    if (showDevPlaceholder()) {
        return (
            <AdContainer label={label} minHeight={minHeight} className={className} style={style}>
                <div
                    style={{
                        border: "1px dashed currentColor",
                        opacity: 0.35,
                        padding: "1.5rem",
                        fontSize: "0.75rem",
                    }}
                >
                    In-article ad slot (dev) — slot {slot}
                </div>
            </AdContainer>
        );
    }

    if (!isAdSenseEnabled()) return null;

    return (
        <AdContainer label={label} minHeight={minHeight} className={className} style={style}>
            <ins
                className="adsbygoogle"
                style={{ display: "block", textAlign: "center" }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={slot}
            />
        </AdContainer>
    );
}