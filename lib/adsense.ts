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

/**
 * True for a real ad unit slot: AdSense issues these as a run of digits.
 *
 * The pages were wired up with slot="XXXXXXXXXX", the placeholder from the
 * setup notes. An <ins> carrying that reaches Google as a request for an ad
 * unit that does not exist, and the adsbygoogle script answers with a TagError
 * in the console of every visitor on that page. Treating a placeholder slot the
 * same way a placeholder publisher ID is already treated - as "not configured
 * yet" - keeps those units inert until the real ids are pasted in.
 */
export function isValidAdSlot(slot: string): boolean {
    return /^\d{6,}$/.test(slot.trim());
}

/** Master switch. Both the enable flag and a valid ID are required. */
export function isAdSenseEnabled(): boolean {
    return (
        process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && isAdSenseConfigured()
    );
}

/**
 * Google's official ad test mode. When on, enabled ad units render with
 * data-adtest="on", so Google returns test ads and counts NO impressions or
 * revenue. Safe for staging/verification. Must be off in production.
 */
export function isAdSenseTestMode(): boolean {
    return process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true";
}

/**
 * In local development, when ads are not enabled, show a neutral dashed box so
 * you can see the reserved space and check layout. Never renders in production.
 */
export function showDevPlaceholder(): boolean {
    return process.env.NODE_ENV !== "production" && !isAdSenseEnabled();
}