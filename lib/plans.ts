/**
 * The single source of truth for plans.
 *
 * Pricing cards, the billing tab in settings, plan gating and the checkout
 * endpoint all read from here. Prices are display strings, not numbers,
 * because the real charge amounts live with the payment provider — the
 * website only ever shows them.
 *
 * Yearly shows the per-month equivalent of the yearly charge, so the two
 * columns compare like for like: Pro bills $119.88/year = $9.99/month.
 */

export type PlanId = "free" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
    id: PlanId;
    name: string;
    monthly: string;
    yearly: string;
    /**
     * The same amounts as numbers, for anything that has to charge rather than
     * display. Billing must not parse "$12.99" back into a number: a display
     * string that gains a currency symbol, a comma or a locale format silently
     * becomes NaN, and NaN is an invoice for nothing.
     *
     * yearlyPrice is the per-month equivalent, matching the yearly column, so
     * a one-time yearly invoice is twelve times this.
     */
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    popular?: boolean;
    features: string[];
}

/**
 * What a plan should cost, in cents, for the whole billing period.
 *
 * Cents because money in floats is a bug waiting for a decimal: 12.99 * 100 is
 * 1298.9999999999998. And the whole period, not per month, because that is the
 * figure the payment provider charges and therefore the only one worth
 * comparing against.
 */
export function priceCentsFor(planId: PlanId, cycle: BillingCycle): number | null {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return null;

    // yearlyPrice is the per-month equivalent shown in the yearly column, so a
    // year's invoice is twelve of them.
    const dollars = cycle === "yearly" ? plan.yearlyPrice * 12 : plan.monthlyPrice;
    return Math.round(dollars * 100);
}

export const PLANS: Plan[] = [
    {
        id: "free",
        name: "Free",
        monthly: "$0",
        yearly: "$0",
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: "Perfect for trying basic PDF tools.",
        features: [
            "10 operations per day",
            "Basic PDF tools",
            "1 OCR operation per day",
            "1 AI summary operation per day",
            "Fast and easy processing",
            "Community support",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        monthly: "$12.99",
        yearly: "$9.99",
        monthlyPrice: 12.99,
        yearlyPrice: 9.99,
        description: "Advanced tools for professionals.",
        popular: true,
        features: [
            "50 operations per day",
            "30 Advanced PDF operations per day",
            "5 OCR operations per day",
            "5 AI summary operations per day",
            "5 AI grammar & writing operations per day",
            "5 AI translation operations per day",
            "Faster processing",
            "Ad-free experience",
            "Priority support",
        ],
    },
    {
        id: "business",
        name: "Business",
        monthly: "$38.99",
        yearly: "$30.99",
        monthlyPrice: 38.99,
        yearlyPrice: 30.99,
        description: "Powerful PDF workflow for teams.",
        features: [
            "100 operations per day",
            "60 Advanced PDF operations per day",
            "10 OCR operations per day",
            "10 AI summary operations per day",
            "10 AI grammar & writing operations per day",
            "10 AI translation operations per day",
            "Team collaboration",
            "Up to 5 team members",
            "Priority processing",
            "Advanced security",
            "Ad-free experience",
            "Priority support",
        ],
    },
];

export function getPlan(id: PlanId): Plan {
    // PLANS covers every PlanId, so the fallback only guards bad data
    // arriving from outside (e.g. an old Firestore document).
    return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/**
 * Plan hierarchy. A feature requiring "pro" is open to anyone whose rank
 * is at least pro's — so Business users are never locked out of Pro
 * features just because the strings differ.
 */
const PLAN_RANK: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    business: 2,
};

export function planSatisfies(current: PlanId, required: PlanId): boolean {
    return PLAN_RANK[current] >= PLAN_RANK[required];
}