import { ADSENSE_CLIENT_ID, isAdSenseConfigured } from "@/lib/adsense";

/**
 * ads.txt, generated from the configured publisher ID rather than checked in.
 *
 * It used to be a static file in public/ carrying the placeholder from the
 * setup notes: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, ...`. That is worse
 * than having no ads.txt at all. Google's crawler reads it and reports
 * "Earnings at risk — one or more of your ads.txt files doesn't contain your
 * AdSense publisher ID", and buyers reading a file that lists someone else's id
 * conclude this site is not authorised to sell its own inventory.
 *
 * Absent means "no restriction", which is the honest state before a publisher
 * ID exists — so when AdSense is not configured this 404s rather than serving a
 * line that names nobody.
 *
 * The id here is the same one the ad units are tagged with, so the file cannot
 * drift from the markup: both come from ADSENSE_CLIENT_ID.
 */

// Built once, like robots.txt and sitemap.xml. The publisher id comes from a
// NEXT_PUBLIC_ env var, which is fixed at build time anyway.
export const dynamic = "force-static";

/** Google's certification authority id, fixed for all AdSense publishers. */
const GOOGLE_CERTIFICATION_AUTHORITY_ID = "f08c47fec0942fa0";

export function GET(): Response {
    if (!isAdSenseConfigured()) {
        return new Response("Not found", {
            status: 404,
            headers: { "content-type": "text/plain; charset=utf-8" },
        });
    }

    // ads.txt names the seller account without the "ca-" prefix that the ad
    // tags use: ca-pub-123... in the markup is pub-123... here.
    const sellerId = ADSENSE_CLIENT_ID.replace(/^ca-/, "");

    return new Response(
        `google.com, ${sellerId}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`,
        { headers: { "content-type": "text/plain; charset=utf-8" } }
    );
}
