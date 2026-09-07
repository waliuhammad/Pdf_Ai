import { isAdSenseEnabled } from "@/lib/adsense";

/**
 * Sets Google Consent Mode v2 defaults to "denied" BEFORE AdSense loads, so no
 * personalized-ad signals fire until a certified CMP records a choice. Only use
 * this with a third-party certified CMP (Cookiebot, Osano, Didomi, ...). If you
 * use Google's own CMP (AdSense → Privacy & messaging), you do NOT need this.
 *
 * A plain <script>, not next/script. The snippet's whole job is to run before
 * the AdSense tag, and next/script only honours `beforeInteractive` inside the
 * root layout — anywhere else the strategy is dropped, which would leave this
 * component silently doing nothing at the one moment it has to work. A bare
 * inline script has no such rule: it executes as the HTML is parsed, which is
 * ahead of the AdSense library either way, and it is what Google's own Consent
 * Mode documentation shows.
 *
 * Rendered by nothing at present. Mount it in app/layout.tsx above
 * <AdSenseScript /> if you go with a third-party CMP.
 */
export default function ConsentDefaults() {
    if (!isAdSenseEnabled()) return null;

    return (
        <script
            id="consent-defaults"
            dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
`.trim(),
            }}
        />
    );
}
