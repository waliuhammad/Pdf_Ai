"use client";

import { useEffect, useRef } from "react";
import {
    ADSENSE_CLIENT_ID,
    isAdSenseEnabled,
    isAdSenseTestMode,
    isValidAdSlot,
    showDevPlaceholder,
} from "@/lib/adsense";
import AdContainer from "./AdContainer";

/**
 * Reusable fluid in-article ad, for dropping between sections of a long
 * content page (blog post, guide, tutorial).
 *
 * Same safety guarantees as DisplayAd: inert until configured, StrictMode-safe
 * push, and failure never breaks the page. When test mode is on,
 * data-adtest="on" makes Google serve test ads with no impressions counted.
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
        // No push for a unit that will not render: a push with no matching
        // <ins> is what produces "All ins elements already have ads in them".
        if (pushed.current || !isAdSenseEnabled() || !isValidAdSlot(slot)) return;
        try {
            const w = window as unknown as { adsbygoogle?: unknown[] };
            w.adsbygoogle = w.adsbygoogle || [];
            w.adsbygoogle.push({});
            pushed.current = true;
        } catch {
            /* never break the app if an ad fails to load */
        }
    }, [slot]);

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
                    In-article ad slot (dev) — {isValidAdSlot(slot) ? `slot ${slot}` : "slot id not set yet"}
                </div>
            </AdContainer>
        );
    }

    if (!isAdSenseEnabled() || !isValidAdSlot(slot)) return null;

    return (
        <AdContainer label={label} minHeight={minHeight} className={className} style={style}>
            <ins
                className="adsbygoogle"
                style={{ display: "block", textAlign: "center" }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={slot}
                {...(isAdSenseTestMode() ? { "data-adtest": "on" } : {})}
            />
        </AdContainer>
    );
}