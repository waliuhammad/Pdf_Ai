import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Section } from "@/components/marketing/content-page";
import InArticleAd from "@/components/ads/InArticleAd";

export const metadata: Metadata = {
    title: "Grammar",
    description:
        "Check the grammar and spelling of a PDF, see every correction against the original, and download the corrected text.",
    alternates: { canonical: "/aigrammar-info" },
};

export default function GrammarInfoPage() {
    return (
        <ContentPage
            title="Grammar"
            intro="Check the grammar and spelling of a PDF, see exactly what changed, and take the corrected text away with you."
        >
            <Section heading="What it does">
                <p>
                    The grammar checker reads the text out of a PDF and passes it to an AI model
                    that corrects spelling, punctuation, agreement and awkward phrasing. What comes
                    back is not a score or a list of warnings — it is the same document, rewritten
                    correctly.
                </p>
                <p>
                    It is aimed at writing that has to be right in front of somebody else:
                    a covering letter, a dissertation chapter, a report going to a client, a
                    contract clause you drafted at midnight. The kind of document where a missing
                    negative or a wrong tense costs more than the time it took to write.
                </p>
            </Section>

            <Section heading="How to use it">
                <p>
                    Open the <Link href="/grammar" className="text-[var(--primary)] hover:underline">grammar checker</Link>,
                    drop in a PDF of up to 25 MB, and press Check Grammar. Nothing else needs
                    setting up — there are no options to get wrong.
                </p>
                <p>
                    When it finishes you get the corrected text beside a count of how many edits
                    were made, with each change marked against the original wording. That matters
                    more than it sounds: an AI that quietly rewrites a sentence you meant is easy
                    to miss, and seeing the differences means you decide what to keep.
                </p>
            </Section>

            {/* Placed after two sections of real reading, not before it: an ad
                that arrives ahead of the content is the thing that makes a page
                feel cheap, and Google reads it the same way. */}
            <InArticleAd slot="XXXXXXXXXX" />

            <Section heading="What you get back">
                <p>
                    You can copy the corrected text straight out of the page, or download it as a
                    new PDF. The download is the corrected <em>text</em>, typeset cleanly — it is
                    not your original file with the fixes patched into it, and it will not carry
                    over your headings, images, tables or page design.
                </p>
                <p>
                    That is worth knowing before you start. For a plain prose document it is
                    exactly what you want. For something heavily laid out, treat the result as the
                    corrected wording to paste back into the original rather than as a replacement
                    for it.
                </p>
            </Section>

            <Section heading="Plans and limits">
                <p>
                    Grammar checking is part of the Pro and Business plans: five documents a day on
                    Pro, ten on Business. It is not included on the free plan, which covers the
                    everyday PDF tools plus a daily OCR and AI summary.
                    See <Link href="/pricing" className="text-[var(--primary)] hover:underline">pricing</Link> for
                    the full comparison.
                </p>
                <p>
                    You need to be signed in either way, because the allowance is counted per
                    account rather than per browser.
                </p>
            </Section>

            <Section heading="Your document">
                <p>
                    The file is processed to produce your result and is not kept afterwards, not
                    used for advertising, and not used to train our own models. The text is sent to
                    the AI provider that performs the check, which is described in
                    the <Link href="/privacy" className="text-[var(--primary)] hover:underline">privacy policy</Link> along
                    with everything else that touches your files.
                </p>
            </Section>
        </ContentPage>
    );
}
