// Central AdSense configuration.
//
// Ads only turn on when BOTH of these are true:
//   1. NEXT_PUBLIC_ADSENSE_ENABLED === "true"
//   2. NEXT_PUBLIC_ADSENSE_CLIENT_ID is a real, well-formed publisher ID.
//
// The placeholder ID (ca-pub-XXXXXXXXXXXXXXXX) never enables ads, so the site
// behaves exactly as before until the client's real ID is configured.

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";

/** True only for a real, well-formed publisher ID (ca-pub- followed by 16 digits). */
export function isAdSenseConfigured(): boolean {
    return /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT_ID);
}

/** Master switch. Both the enable flag and a valid ID are required. */
export function isAdSenseEnabled(): boolean {
    return (
        process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && isAdSenseConfigured()
    );
}

/**
 * In local development, when ads are not enabled, show a neutral dashed box so
 * you can see the reserved space and check layout. Never renders in production.
 */
export function showDevPlaceholder(): boolean {
    return process.env.NODE_ENV !== "production" && !isAdSenseEnabled();
}