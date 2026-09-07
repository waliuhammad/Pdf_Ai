"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { hasSessionHint } from "@/lib/session-hint";

/** The hint cookie only changes on a sign-in or sign-out, both of which navigate. */
const subscribeToNothing = () => () => { };

/**
 * Whether this visitor should be shown ads at all.
 *
 * Pro and Business both list "Ad-free experience" on the pricing page, and
 * nothing was enforcing it — the ad units rendered for everyone. Switching
 * AdSense on would have put ads in front of the people who paid not to see
 * them, which is a refund and a complaint rather than a policy problem.
 *
 * Signed-out visitors have not bought anything, so they see ads. A signed-in
 * visitor's plan comes from the same /api/usage the rest of the app reads.
 *
 * Nothing renders until the answer is known. The alternative — assume ads are
 * fine and withdraw them once the plan arrives — flashes an ad at a paying
 * customer, which is the exact thing being prevented, and a slot that appears
 * and vanishes shifts the layout as well. Ads waiting a tick costs nobody
 * anything.
 */
export function useAdsAllowed(): boolean {
    // The cookie is browser state, so it is read as an external store rather
    // than copied into state by an effect. The server snapshot says "signed
    // in" — the pessimistic answer — so a paying customer's HTML never arrives
    // with an ad in it that has to be taken away again a moment later.
    const signedIn = useSyncExternalStore(
        subscribeToNothing,
        () => hasSessionHint(),
        () => true
    );

    const [planAllowsAds, setPlanAllowsAds] = useState<boolean | null>(null);

    useEffect(() => {
        if (!signedIn) return;

        const controller = new AbortController();

        fetch("/api/usage", { signal: controller.signal, cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data?.success) return;
                // Anything other than a paid plan sees ads. Written this way
                // round on purpose: a plan added later shows ads until someone
                // decides it should not, rather than silently going ad-free and
                // costing revenue nobody notices.
                setPlanAllowsAds(data.plan !== "pro" && data.plan !== "business");
            })
            .catch(() => {
                // The hint cookie says somebody is signed in and we could not
                // find out what they are paying for. Not showing an ad is the
                // cheaper mistake, and leaving this null is what does that.
            });

        return () => controller.abort();
    }, [signedIn]);

    return signedIn ? planAllowsAds === true : true;
}
