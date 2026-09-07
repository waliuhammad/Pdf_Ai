import "server-only";
import { getRemoteConfig, type ServerTemplate } from "firebase-admin/remote-config";
import { getAdminApp, isAdminConfigured } from "@/lib/firebase/admin";
import type { PlanId } from "@/lib/plans";

/**
 * Server-side Remote Config: values changeable from the Firebase Console
 * with no redeploy. Read on the server so limits can't be tampered with
 * in the browser.
 *
 * The parameter schema follows what the client created in their project:
 * {cycle}_{plan}_plan_all = how many operations that plan allows per 24h,
 * for weekly/monthly/yearly billing cycles. Two extra parameters of ours
 * (maintenance_banner, ai_tools_enabled) fall back to safe defaults until
 * they exist in the console.
 *
 * Defaults below are the source of truth when Remote Config is unreachable
 * or a parameter doesn't exist, so the app never breaks because a console
 * value is missing.
 */

export type PlanCycle = "weekly" | "monthly" | "yearly";

/**
 * The allowances a single operation can be charged against, besides the daily
 * total. "basic" is absent on purpose: basic tools count towards the total and
 * nothing else, so they have no ceiling of their own.
 */
export type LimitedCategory = "advanced" | "ocr" | "summary" | "grammar" | "translate";

export const LIMITED_CATEGORIES: LimitedCategory[] = [
    "advanced",
    "ocr",
    "summary",
    "grammar",
    "translate",
];

const DEFAULTS = {
    maintenance_banner: "",
    ai_tools_enabled: "true",

    // The daily total, per billing cycle. These were 2/20/50 while the pricing
    // page advertised 10/50/100 — the page is the promise a customer paid
    // against, so the numbers here now match it.
    weekly_free_plan_all: "10",
    weekly_pro_plan_all: "50",
    weekly_business_plan_all: "100",
    monthly_free_plan_all: "10",
    monthly_pro_plan_all: "50",
    monthly_business_plan_all: "100",
    yearly_free_plan_all: "10",
    yearly_pro_plan_all: "50",
    yearly_business_plan_all: "100",

    // Per-category ceilings, also daily, also from the pricing page. An
    // operation in one of these categories is charged twice — once against the
    // category and once against the daily total — so whichever runs out first
    // is what stops it.
    //
    // No cycle prefix here, unlike the totals above. The three cycles have held
    // identical values since they were introduced and only `monthly` is ever
    // read, so mirroring the scheme would have meant 54 parameters to keep in
    // step in the Console instead of 18, 36 of which nothing would look at.
    //
    // Zero means the category is closed on that plan, which is how Free has no
    // advanced-tool line on the pricing page. Zero is a real value here, not
    // "unset" — see numOrZero below.
    free_plan_advanced: "0",
    pro_plan_advanced: "30",
    business_plan_advanced: "60",

    free_plan_ocr: "1",
    pro_plan_ocr: "5",
    business_plan_ocr: "10",

    free_plan_summary: "1",
    pro_plan_summary: "5",
    business_plan_summary: "10",

    free_plan_grammar: "0",
    pro_plan_grammar: "5",
    business_plan_grammar: "10",

    free_plan_translate: "0",
    pro_plan_translate: "5",
    business_plan_translate: "10",
} as const;

export interface AppConfig {
    maintenanceBanner: string;
    aiToolsEnabled: boolean;
    /** Daily operation limits: limits[cycle][plan] = ops per 24 hours. */
    limits: Record<PlanCycle, Record<PlanId, number>>;
    /** Daily per-category ceilings: categoryLimits[plan][category]. */
    categoryLimits: Record<PlanId, Record<LimitedCategory, number>>;
}

let template: ServerTemplate | null = null;
let loadedAt = 0;

// Remote Config keeps two separate templates per project and the Console
// opens on the client one, so a value edited there is invisible to
// getServerTemplate() and the app silently keeps its built-in default. The
// client template is read as a fallback for any parameter the server
// template does not supply, so a limit typed into either place takes effect.
let clientParams: Record<string, string> | null = null;
let clientLoadedAt = 0;

// One fetch per minute per server instance. This was five minutes, which is a
// long time to stare at a stale number after changing it in the Console.
const TTL_MS = 60 * 1000;

// A missing Server template is an expected state (it just hasn't been
// created in the Console yet), not a fault worth repeating on every
// request — warn once, run on defaults, and keep retrying quietly so
// the app picks the template up as soon as someone publishes it.
let warnedMissingTemplate = false;

async function getTemplate(): Promise<ServerTemplate | null> {
    if (!isAdminConfigured()) return null;

    const now = Date.now();
    if (template && now - loadedAt < TTL_MS) return template;

    try {
        const rc = getRemoteConfig(getAdminApp());
        // No defaultConfig on purpose. Seeding it with DEFAULTS made a missing
        // parameter evaluate to the default, which is indistinguishable from
        // the template genuinely holding that number — so the client-template
        // fallback below could never fire. Missing keys now read as 0/"" and
        // the fallback chain in getAppConfig decides.
        const next = await rc.getServerTemplate({ defaultConfig: {} });
        template = next;
        loadedAt = now;
        warnedMissingTemplate = false;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("NOT_FOUND")) {
            if (!warnedMissingTemplate) {
                console.warn(
                    "Remote Config: no Server template published yet — using built-in defaults. " +
                    "Create it in Firebase Console -> Remote Config -> (dropdown) Server."
                );
                warnedMissingTemplate = true;
            }
        } else {
            // Keep serving the previous template (or defaults) rather than fail.
            console.error("Remote Config fetch failed:", err);
        }
    }
    return template;
}

/**
 * Parameter values from the *client* template, flattened to strings.
 * Returns an empty map on any failure — this is a fallback, so a project
 * without a client template must not break the request.
 */
async function getClientParams(): Promise<Record<string, string>> {
    if (!isAdminConfigured()) return {};

    const now = Date.now();
    if (clientParams && now - clientLoadedAt < TTL_MS) return clientParams;

    try {
        const rc = getRemoteConfig(getAdminApp());
        const t = await rc.getTemplate();
        const out: Record<string, string> = {};

        for (const [key, param] of Object.entries(t.parameters ?? {})) {
            const dv = param.defaultValue;
            // The other shape is { useInAppDefault: true }, which carries no
            // value and should fall through to our own default.
            if (dv && "value" in dv && typeof dv.value === "string") {
                out[key] = dv.value;
            }
        }

        clientParams = out;
        clientLoadedAt = now;
    } catch {
        // No client template, or no permission to read it. Keep whatever was
        // cached (or nothing) and let the built-in defaults apply.
        clientParams = clientParams ?? {};
    }

    return clientParams;
}

function defaultLimits(): AppConfig["limits"] {
    const limitOf = (key: keyof typeof DEFAULTS) => Number(DEFAULTS[key]);
    return {
        weekly: {
            free: limitOf("weekly_free_plan_all"),
            pro: limitOf("weekly_pro_plan_all"),
            business: limitOf("weekly_business_plan_all"),
        },
        monthly: {
            free: limitOf("monthly_free_plan_all"),
            pro: limitOf("monthly_pro_plan_all"),
            business: limitOf("monthly_business_plan_all"),
        },
        yearly: {
            free: limitOf("yearly_free_plan_all"),
            pro: limitOf("yearly_pro_plan_all"),
            business: limitOf("yearly_business_plan_all"),
        },
    };
}

function defaultCategoryLimits(): AppConfig["categoryLimits"] {
    const at = (plan: PlanId, category: LimitedCategory) =>
        Number(DEFAULTS[`${plan}_plan_${category}` as keyof typeof DEFAULTS]);

    const build = (plan: PlanId) =>
        Object.fromEntries(LIMITED_CATEGORIES.map((c) => [c, at(plan, c)])) as Record<
            LimitedCategory,
            number
        >;

    return { free: build("free"), pro: build("pro"), business: build("business") };
}

export async function getAppConfig(): Promise<AppConfig> {
    const [t, client] = await Promise.all([getTemplate(), getClientParams()]);
    const d = defaultLimits();
    const dc = defaultCategoryLimits();

    /** Client-template value for a key, when it parses as a positive number. */
    const fromClient = (key: string): number | null => {
        const raw = client[key];
        if (raw === undefined) return null;
        const value = Number(raw);
        return Number.isFinite(value) && value > 0 ? value : null;
    };

    /**
     * Like fromClient, but zero counts.
     *
     * The totals treat 0 as "unset" because a daily allowance of nothing would
     * lock every tool on the plan and is far more likely to be a typo. A
     * category limit of 0 is meaningful — it is how Free is closed out of the
     * advanced tools — so it has to survive.
     */
    const fromClientOrZero = (key: string): number | null => {
        const raw = client[key];
        if (raw === undefined) return null;
        const value = Number(raw);
        return Number.isFinite(value) && value >= 0 ? value : null;
    };

    const categoryLimits = defaultCategoryLimits();
    for (const plan of ["free", "pro", "business"] as PlanId[]) {
        for (const category of LIMITED_CATEGORIES) {
            const v = fromClientOrZero(`${plan}_plan_${category}`);
            if (v !== null) categoryLimits[plan][category] = v;
        }
    }

    if (!t) {
        const limits = defaultLimits();
        for (const cycle of ["weekly", "monthly", "yearly"] as PlanCycle[]) {
            for (const plan of ["free", "pro", "business"] as PlanId[]) {
                const v = fromClient(`${cycle}_${plan}_plan_all`);
                if (v !== null) limits[cycle][plan] = v;
            }
        }

        return {
            maintenanceBanner: client.maintenance_banner ?? DEFAULTS.maintenance_banner,
            aiToolsEnabled: (client.ai_tools_enabled ?? DEFAULTS.ai_tools_enabled) === "true",
            limits,
            categoryLimits,
        };
    }

    const config = t.evaluate();

    // Server template first, then the client template, then the built-in
    // default. Without the middle step a limit edited on the Console's default
    // (client) tab looked like it had no effect at all.
    const num = (key: string, fallback: number) => {
        const value = config.getNumber(key);
        if (Number.isFinite(value) && value > 0) return value;
        return fromClient(key) ?? fallback;
    };

    /**
     * The same chain for category ceilings, where 0 is a value rather than an
     * absence. getNumber answers 0 for a parameter that is not in the template
     * at all, so a plain `>= 0` test here would read every missing key as a
     * closed category and lock the tools — hence the explicit presence check
     * against the evaluated config before trusting a zero.
     */
    const numOrZero = (key: string, fallback: number) => {
        const raw = config.getString(key);
        if (raw !== "") {
            const value = Number(raw);
            if (Number.isFinite(value) && value >= 0) return value;
        }
        return fromClientOrZero(key) ?? fallback;
    };

    const resolvedCategories = Object.fromEntries(
        (["free", "pro", "business"] as PlanId[]).map((plan) => [
            plan,
            Object.fromEntries(
                LIMITED_CATEGORIES.map((category) => [
                    category,
                    numOrZero(`${plan}_plan_${category}`, dc[plan][category]),
                ])
            ) as Record<LimitedCategory, number>,
        ])
    ) as AppConfig["categoryLimits"];

    return {
        maintenanceBanner: config.getString("maintenance_banner") || (client.maintenance_banner ?? ""),
        // Read as a string through the same three-step chain: getBoolean cannot
        // tell "set to false" from "absent", and absent must mean enabled.
        aiToolsEnabled:
            (config.getString("ai_tools_enabled") ||
                client.ai_tools_enabled ||
                DEFAULTS.ai_tools_enabled) === "true",
        limits: {
            weekly: {
                free: num("weekly_free_plan_all", d.weekly.free),
                pro: num("weekly_pro_plan_all", d.weekly.pro),
                business: num("weekly_business_plan_all", d.weekly.business),
            },
            monthly: {
                free: num("monthly_free_plan_all", d.monthly.free),
                pro: num("monthly_pro_plan_all", d.monthly.pro),
                business: num("monthly_business_plan_all", d.monthly.business),
            },
            yearly: {
                free: num("yearly_free_plan_all", d.yearly.free),
                pro: num("yearly_pro_plan_all", d.yearly.pro),
                business: num("yearly_business_plan_all", d.yearly.business),
            },
        },
        categoryLimits: resolvedCategories,
    };
}