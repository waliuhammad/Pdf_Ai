"use client";

import { useEffect, useRef } from "react";
import {
    ADSENSE_CLIENT_ID,
    isAdSenseEnabled,
    showDevPlaceholder,
} from "@/lib/adsense";

type AdContainerProps = {
    children: React.ReactNode;
    label: boolean;
    minHeight: number;
    className?: string;
    style?: React.CSSProperties;
};

function AdContainer({
    children,
    label,
    minHeight,
    className,
    style,
}: AdContainerProps) {
    return (
        <div className={className} style={{ minHeight, ...style }}>
            {label && <div>Advertisement</div>}
            {children}
        </div>
    );
}

/**
 * Reusable responsive display ad (banner / sidebar).
 *
 * - Renders nothing in production until the client's real publisher ID is set,
 *   so it is completely inert until configured.
 * - The adsbygoogle push is guarded against React StrictMode double-invocation
 *   and wrapped in try/catch, so a failed or blocked ad can never break a page.
 */
type DisplayAdProps = {
    /** Ad unit slot ID from the AdSense dashboard. */
    slot: string;
    /** "auto" (default), "horizontal", "rectangle", "vertical", etc. */
    format?: string;
    /** Full-width responsive behavior. Default true. */
    responsive?: boolean;
    /** Show the "Advertisement" label. Default true. */
    label?: boolean;
    /** Reserved vertical space (px) to reduce layout shift. Default 90. */
    minHeight?: number;
    className?: string;
    style?: React.CSSProperties;
};

export default function DisplayAd({
    slot,
    format = "auto",
    responsive = true,
    label = true,
    minHeight = 90,
    className,
    style,
}: DisplayAdProps) {
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
                    Ad slot (dev) — slot {slot}
                </div>
            </AdContainer>
        );
    }

    if (!isAdSenseEnabled()) return null;

    return (
        <AdContainer label={label} minHeight={minHeight} className={className} style={style}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </AdContainer>
    );
}