import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Section } from "@/components/marketing/content-page";
import InArticleAd from "@/components/ads/InArticleAd";

export const metadata: Metadata = {
    title: "AI Summary",
    description:
        "Summarise a long PDF into the points that matter, and download the summary as a document.",
    alternates: { canonical: "/aisummary-info" },
};

export default function AISummaryInfoPage() {
    return (
        <ContentPage
            title="AI Summary"
            intro="Turn a long document into the points that actually matter, in about the time it takes to read the first page."
        >
            <Section heading="What it does">
                <p>
                    The summariser reads the text of a PDF and writes back a condensed version: the
                    argument, the findings, the decisions and whatever the document is asking of
                    you. It is reading the whole file rather than skimming the opening, so a
                    conclusion buried on page forty still turns up in the summary.
                </p>
                <p>
                    The honest use for it is triage. It tells you what a document is about and
                    whether it deserves your afternoon. For anything you will rely on — a contract
                    you are signing, a paper you are citing, a report you will be held to — read
                    the passage the summary points you at rather than the summary itself.
                </p>
            </Section>

            <Section heading="How to use it">
                <p>
                    Open <Link href="/summarize-pdf" className="text-[var(--primary)] hover:underline">AI Summary</Link>,
                    upload a PDF of up to 25 MB, and run it. The summary appears in the page; you
                    can copy it or download it as a document.
                </p>
                <p>
                    If the PDF is a scan with no text layer, there is nothing to read and the
                    summary will be thin or empty. Run it through
                    the <Link href="/ocr-pdf" className="text-[var(--primary)] hover:underline">OCR scanner</Link> first
                    to turn the pictures of words into words.
                </p>
            </Section>

            {/* Below two sections of actual content, which is where an
                in-article unit belongs. */}
            <InArticleAd slot="XXXXXXXXXX" />

            <Section heading="What it is not">
                <p>
                    A summary is a compression, and compression loses things. It will not reliably
                    catch the one clause that reverses the rest of a contract, a figure that
                    contradicts the text, or a caveat in a footnote. Models can also state
                    something with more confidence than the source did.
                </p>
                <p>
                    Treat the output as a map of the document, not a replacement for it. That is
                    the difference between saving an hour and missing the sentence that mattered.
                </p>
            </Section>

            <Section heading="Plans and limits">
                <p>
                    The free plan includes one summary a day. Pro raises that to five and Business
                    to ten, alongside the other AI tools.
                    See <Link href="/pricing" className="text-[var(--primary)] hover:underline">pricing</Link> for
                    the full breakdown.
                </p>
                <p>
                    You need to be signed in, because the daily allowance belongs to the account
                    rather than the browser.
                </p>
            </Section>

            <Section heading="Your document">
                <p>
                    The file is processed to produce your summary and is not kept afterwards, not
                    used for advertising, and not used to train our own models. The text is sent to
                    the AI provider that writes the summary, which is described in
                    the <Link href="/privacy" className="text-[var(--primary)] hover:underline">privacy policy</Link>.
                </p>
            </Section>
        </ContentPage>
    );
}
