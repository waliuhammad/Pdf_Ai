import React from "react";

/**
 * Neutral wrapper around an ad unit. Provides:
 *  - consistent vertical spacing,
 *  - a small policy-friendly "Advertisement" label,
 *  - reserved height to minimize layout shift (CLS),
 *  - overflow:hidden so a wide ad can never cause horizontal scroll.
 *
 * Uses inline styles that inherit the surrounding text color (currentColor) and
 * opacity, so it reads correctly in both light and dark themes WITHOUT touching
 * the existing design system, Tailwind classes, or CSS variables.
 */
type AdContainerProps = {
    children: React.ReactNode;
    /** Show the small "Advertisement" label. Default true. */
    label?: boolean;
    /** Reserve vertical space (px) to minimize layout shift. */
    minHeight?: number;
    className?: string;
    style?: React.CSSProperties;
};

export default function AdContainer({
    children,
    label = true,
    minHeight,
    className,
    style,
}: AdContainerProps) {
    return (
        <div
            className={className}
            style={{ width: "100%", margin: "1.5rem 0", textAlign: "center", ...style }}
        >
            {label && (
                <div
                    style={{
                        fontSize: "0.6875rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        opacity: 0.5,
                        marginBottom: "0.25rem",
                    }}
                >
                    Advertisement
                </div>
            )}
            <div
                style={{
                    minHeight: minHeight ? `${minHeight}px` : undefined,
                    overflow: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
}