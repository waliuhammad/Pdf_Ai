/**
 * The brand mark: a gradient document swept by a ribbon, with a sparkle.
 *
 * One component rather than an icon repeated in the navbar, the footer and the
 * favicon. Those three had drifted to a lucide FileText on a purple square, and
 * changing the brand meant finding every copy; now the artwork lives here and
 * everywhere else asks for a size.
 *
 * Drawn as SVG rather than pointing at a bitmap so it stays sharp from a 16px
 * favicon up to the footer, carries no network request, and inherits nothing it
 * should not — the colours are the brand's own in both light and dark.
 *
 * The gradient ids are fixed rather than generated. Two instances on one page
 * therefore declare the same ids twice, which is untidy markup but paints
 * identically whichever the browser resolves, and the alternative — useId —
 * would make a purely decorative mark a client component on every page.
 */
export function Logo({
    size = 40,
    className,
}: {
    size?: number;
    className?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="PDF AI Assistant"
            className={className}
        >
            <defs>
                {/* The gap between ribbon and page is cut out of the ribbon,
                    not painted over it. Painting it needed a colour, and the
                    only honest guess — the page background — was wrong on every
                    surface that is not exactly that colour: on the footer it
                    read as a white ring around the mark. A hole shows whatever
                    is actually behind it. */}
                <mask id="pdfai-gap">
                    <rect width="64" height="64" fill="#fff" />
                    <path
                        d="M20 8h14.2L48 21.4V44a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
                        fill="#000"
                        stroke="#000"
                        strokeWidth="5"
                        strokeLinejoin="round"
                    />
                </mask>
                <linearGradient id="pdfai-doc" x1="18" y1="12" x2="48" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB" />
                    <stop offset="1" stopColor="#4F46E5" />
                </linearGradient>
                <linearGradient id="pdfai-ribbon" x1="6" y1="46" x2="58" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1D9BF6" />
                    <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="pdfai-spark" x1="49" y1="17" x2="59" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#6D28D9" />
                </linearGradient>
            </defs>

            {/* The ribbon sweeping behind the page.
                A whole tilted ellipse rather than an open curve: the page and
                its halo cover the middle, which is what leaves a crescent on
                one side and a tail on the other. Drawing it as an arc instead
                meant hand-placing two ends that never quite met the page. */}
            <ellipse
                cx="31"
                cy="37"
                rx="27"
                ry="11.5"
                transform="rotate(-13 31 37)"
                stroke="url(#pdfai-ribbon)"
                strokeWidth="7"
                mask="url(#pdfai-gap)"
            />


            {/* The page, with its folded corner. */}
            <path
                d="M20 8h14.2L48 21.4V44a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
                fill="url(#pdfai-doc)"
            />
            <path d="M34.2 8 48 21.4H38.2a4 4 0 0 1-4-4V8Z" fill="#93C5FD" />

            {/* Three lines of text. */}
            <rect x="21" y="24" width="20" height="3.6" rx="1.8" fill="#EEF2FF" />
            <rect x="21" y="31" width="20" height="3.6" rx="1.8" fill="#EEF2FF" />
            <rect x="21" y="38" width="13" height="3.6" rx="1.8" fill="#EEF2FF" />

            {/* The sparkle. */}
            <path
                d="M54 15c.9 4.4 2.6 6.1 7 7-4.4.9-6.1 2.6-7 7-.9-4.4-2.6-6.1-7-7 4.4-.9 6.1-2.6 7-7Z"
                fill="url(#pdfai-spark)"
            />
        </svg>
    );
}
