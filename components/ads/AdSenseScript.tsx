import Script from "next/script";
import { ADSENSE_CLIENT_ID, isAdSenseEnabled } from "@/lib/adsense";

/**
 * Loads the Google AdSense library exactly once, globally.
 *
 * Server component: it renders a single <Script> (or nothing), so it adds no
 * client-side JavaScript of its own and cannot cause hydration mismatches.
 * Rendered once in the root layout — never per page — so the script is never
 * injected more than once.
 */
export default function AdSenseScript() {
    if (!isAdSenseEnabled()) return null;

    return (
        <Script
            id="google-adsense"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        />
    );
}