import { TOOL_PATHS } from "@/lib/tool-paths";
import {
    FileStack,
    Scissors,
    Minimize2,
    FileText,
    RotateCw,
    Droplets,
    Lock,
    Unlock,
    FileImage,
    FileSpreadsheet,
    FileSignature,
    Edit3,
    Sparkles,
    ScanText,
    FileSearch,
    Presentation,
    ImagePlus,
    type LucideIcon,
} from "lucide-react";

export interface Tool {
    name: string;
    description: string;
    icon: LucideIcon;
    href: string;
    category: string;
    badge?: string;
    /** Small corner tag for tools open on every plan, incl. Free, with no per-tool cap. */
    tier?: "basic";
    /** No page exists yet — rendered as a non-clickable card instead of a dead link. */
    comingSoon?: boolean;
}

export const tools: Tool[] = [
    {
        name: "Merge PDF",
        description: "Combine multiple PDF files into one.",
        icon: FileStack,
        href: "/merge-pdf",
        category: "Organize",
        badge: "Popular",
        tier: "basic",
    },
    {
        name: "Split PDF",
        description: "Extract pages from any PDF.",
        icon: Scissors,
        href: "/split-pdf",
        category: "Organize",
        tier: "basic",
    },
    {
        name: "Compress PDF",
        description: "Reduce PDF file size quickly.",
        icon: Minimize2,
        href: "/compress-pdf",
        category: "Edit",
        tier: "basic",
    },
    {
        name: "Rotate PDF",
        description: "Rotate pages to the correct orientation.",
        icon: RotateCw,
        href: "/rotate-pdf",
        category: "Organize",
        tier: "basic",
    },
    {
        name: "PDF to Word",
        description: "Convert PDF into editable Word files.",
        icon: FileText,
        href: "/pdf-to-word",
        category: "Convert",

    },
    {
        name: "Word to PDF",
        description: "Convert Word documents into PDF.",
        icon: FileText,
        href: "/word-to-pdf",
        category: "Convert",
    },
    {
        name: "PDF to Image",
        description: "Convert PDF pages into images.",
        icon: FileImage,
        href: "/pdf-to-image",
        category: "Convert",
        tier: "basic",
    },
    {
        name: "Image to PDF",
        description: "Convert images into a PDF file.",
        icon: ImagePlus,
        href: "/image-to-pdf",
        category: "Convert",
        tier: "basic",
    },
    {
        name: "PDF to Excel",
        description: "Convert PDF tables into spreadsheets.",
        icon: FileSpreadsheet,
        href: "/pdf-to-excel",
        category: "Convert",
    },
    {
        name: "Excel to PDF",
        description: "Convert spreadsheets into PDFs.",
        icon: FileSpreadsheet,
        href: "/excel-to-pdf",
        category: "Convert",
    },
    {
        name: "PDF to PPT",
        description: "Convert PDF into editable slides.",
        icon: Presentation,
        href: "/pdf-to-ppt",
        category: "Convert",
    },
    {
        name: "PPT to PDF",
        description: "Convert presentations into PDF.",
        icon: Presentation,
        href: "/ppt-to-pdf",
        category: "Convert",
    },
    {
        name: "Watermark PDF",
        description: "Add text or image watermarks.",
        icon: Droplets,
        href: "/watermark-pdf",
        category: "Edit",
    },
    {
        name: "Sign PDF",
        description: "Add digital signatures instantly.",
        icon: FileSignature,
        href: "/sign-pdf",
        category: "Edit",
    },
    {
        name: "Edit PDF",
        description: "Edit text and images inside PDFs.",
        icon: Edit3,
        href: "/edit-pdf",
        category: "Edit",
    },
    {
        name: "Protect PDF",
        description: "Encrypt PDF files with passwords.",
        icon: Lock,
        href: "/protect-pdf",
        category: "Security",
    },
    {
        name: "Unlock PDF",
        description: "Remove password protection.",
        icon: Unlock,
        href: "/unlock-pdf",
        category: "Security",
    },
    {
        name: "OCR PDF",
        description: "Extract text from scanned PDFs.",
        icon: ScanText,
        href: "/ocr-pdf", // matches your folder name
        category: "AI Tools",
        badge: "New",
    },
    {
        name: "AI Summary",
        description: "Generate document summaries instantly.",
        icon: Sparkles,
        href: "/summarize-pdf",
        category: "AI Tools",
        badge: "AI",
    },
    {
        name: "Translate PDF",
        description: "Translate your documents.",
        icon: FileSearch,
        href: "/translate",
        category: "AI Tools",
        badge: "AI",
    },
    {
        name: "Grammar Checker",
        description: "Check grammar and spelling of your documents.",
        icon: FileSearch,
        href: "/grammar", // Updated to just "grammar"
        category: "AI Tools",
        badge: "New",
    },
];
/**
 * lib/tool-paths.ts holds the same routes without the icons, so the navbar can
 * ask "is this a tool page" without pulling twenty icon components into every
 * marketing page. Drift between the two would leave a tool's page with no
 * highlighted nav link and nothing to explain why, so it is caught here.
 *
 * Development only: this is a wiring mistake, not a condition to check on every
 * production request.
 */
if (process.env.NODE_ENV !== "production") {
    const known = new Set(TOOL_PATHS);
    const missing = tools.map((t) => t.href).filter((href) => !known.has(href));

    if (missing.length) {
        console.error(
            `lib/tool-paths.ts is missing ${missing.join(", ")} — add them, or the ` +
            "navbar will not highlight Tools on those pages."
        );
    }
}