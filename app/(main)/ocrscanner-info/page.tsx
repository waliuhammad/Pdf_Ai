import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Section } from "@/components/marketing/content-page";
import InArticleAd from "@/components/ads/InArticleAd";

export const metadata: Metadata = {
    title: "OCR Scanner",
    description:
        "Pull the text out of a scanned PDF so it can be searched, copied and edited.",
    alternates: { canonical: "/ocrscanner-info" },
};

export default function OCRScannerInfoPage() {
    return (
        <ContentPage
            title="OCR Scanner"
            intro="Pull the text out of a scanned PDF, so a page that was only ever a picture becomes something you can search and copy."
        >
            <Section heading="What it does">
                <p>
                    A scanned PDF looks like a document but is really a stack of photographs. You
                    cannot search it, you cannot select a sentence, and copying a paragraph means
                    typing it out. Optical character recognition reads the shapes on those images
                    and gives you back the words.
                </p>
                <p>
                    The usual reasons are ordinary ones: a contract that came back from the
                    solicitor as a scan, receipts for an expenses claim, a certificate you need one
                    line from, a filing cabinet somebody photographed years ago and never indexed.
                </p>
            </Section>

            <Section heading="How to use it">
                <p>
                    Open the <Link href="/ocr-pdf" className="text-[var(--primary)] hover:underline">OCR scanner</Link>,
                    upload a scanned PDF of up to 25 MB, and run the extraction. The recognised
                    text appears in the page, ready to copy or download.
                </p>
                <p>
                    Accuracy follows the scan. A clean, straight, well-lit page at a sensible
                    resolution comes back close to perfect; a creased photocopy shot at an angle in
                    poor light will not. If you have any say over how the original is captured,
                    that is where the quality is won.
                </p>
            </Section>

            {/* Two sections in, after the page has earned it. */}
            <InArticleAd slot="XXXXXXXXXX" />

            <Section heading="What you get back">
                <p>
                    The result is the text itself — what the page said, not a rebuilt copy of how
                    it looked. Columns, tables and headings are not reconstructed, and handwriting
                    is not the job this is built for.
                </p>
                <p>
                    Once you have the text you can do the rest here too:
                    run it through <Link href="/aisummary-info" className="text-[var(--primary)] hover:underline">AI Summary</Link> if
                    the document is long, or
                    the <Link href="/aitranslate-info" className="text-[var(--primary)] hover:underline">translator</Link> if
                    it is in a language you do not read.
                </p>
            </Section>

            <Section heading="Plans and limits">
                <p>
                    The free plan includes one OCR extraction a day. Pro raises that to five and
                    Business to ten.
                    See <Link href="/pricing" className="text-[var(--primary)] hover:underline">pricing</Link> for
                    what else each plan includes.
                </p>
                <p>
                    An account is needed, because the allowance is counted per account rather than
                    per browser.
                </p>
            </Section>

            <Section heading="Your document">
                <p>
                    Scans are often the most sensitive files people have — identity documents,
                    medical letters, anything that came from a solicitor. The file is processed to
                    produce your text and is not kept afterwards, not used for advertising, and not
                    used to train our own models. What happens to it is set out in
                    the <Link href="/privacy" className="text-[var(--primary)] hover:underline">privacy policy</Link>.
                </p>
            </Section>
        </ContentPage>
    );
}
