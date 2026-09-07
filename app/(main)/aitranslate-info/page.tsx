import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Section } from "@/components/marketing/content-page";
import InArticleAd from "@/components/ads/InArticleAd";

export const metadata: Metadata = {
    title: "Translate PDF",
    description:
        "Translate the text of a PDF into another language and download the translation as a new document.",
    alternates: { canonical: "/aitranslate-info" },
};

export default function TranslatePDFInfoPage() {
    return (
        <ContentPage
            title="Translate PDF"
            intro="Translate the text of a PDF into another language and take the translation away as a new document."
        >
            <Section heading="What it does">
                <p>
                    The translator reads the text out of a PDF and translates the whole document in
                    one pass, rather than a paragraph at a time. Because the model sees the
                    document as a whole, it keeps terminology consistent from the first page to the
                    last — the same term does not become three different words by the end.
                </p>
                <p>
                    It is built for documents you need to read or send, not for casual phrases: a
                    supplier contract in a language you do not work in, a manual for a machine that
                    arrived without English instructions, a paper you need the argument of before
                    deciding whether to cite it.
                </p>
            </Section>

            <Section heading="How to use it">
                <p>
                    Open the <Link href="/translate" className="text-[var(--primary)] hover:underline">PDF translator</Link>,
                    choose the language you want, and upload a PDF of up to 25 MB. The translation
                    appears in the page, where you can read it before deciding to keep it.
                </p>
                <p>
                    Longer documents take longer — the whole text goes to the model and comes back
                    as one piece, so a hundred pages is not the same wait as one.
                </p>
            </Section>

            {/* After the reader has had something worth reading. An ad placed
                above the content is what makes a page feel like it exists to
                carry ads. */}
            <InArticleAd slot="XXXXXXXXXX" />

            <Section heading="What you get back">
                <p>
                    You can copy the translation from the page or download it as a new PDF. Be
                    clear about what that file is: it is the translated <em>text</em>, typeset
                    cleanly on fresh pages. It is not your original document with the words
                    swapped, and it does not reproduce the columns, tables, images or page design
                    of the source.
                </p>
                <p>
                    For a letter, a report or a contract body that is usually all you need. For a
                    form, a datasheet or anything where the layout carries meaning, use the
                    translation as the text and place it back into the original yourself.
                </p>
            </Section>

            <Section heading="Plans and limits">
                <p>
                    Translation is part of the Pro and Business plans: five documents a day on Pro,
                    ten on Business. It is not included on the free plan.
                    See <Link href="/pricing" className="text-[var(--primary)] hover:underline">pricing</Link> for
                    what each plan covers.
                </p>
                <p>
                    You need an account, because the daily allowance is counted per account rather
                    than per browser.
                </p>
            </Section>

            <Section heading="Your document">
                <p>
                    The file is processed to produce your translation and is not kept afterwards,
                    not used for advertising, and not used to train our own models. The text is
                    sent to the AI provider that performs the translation, which is set out in
                    the <Link href="/privacy" className="text-[var(--primary)] hover:underline">privacy policy</Link>.
                </p>
            </Section>
        </ContentPage>
    );
}
