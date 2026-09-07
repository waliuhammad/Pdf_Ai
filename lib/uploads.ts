import "server-only";
import type { PlanId } from "@/lib/plans";
import { NextResponse } from "next/server";

/**
 * Limits and checks for uploaded files.
 *
 * No route checked either the size or the type of what it was sent. A tool
 * would read the whole upload into memory and hand it to pdf-lib, which threw
 * on anything that was not a PDF — so junk failed, but only after the server
 * had accepted and buffered it. A single large upload could tie up the memory
 * of a container the whole site shares, and nothing about that requires an
 * account or costs the sender anything.
 *
 * The browser already refuses the wrong file type in most tools, which is worth
 * having for the error message, but it is not a control: anyone can post
 * straight to the route.
 */

/**
 * 25 MB.
 *
 * Chosen against what the tools do rather than what a disk can hold: every
 * route reads the file into memory and several render pages to canvases, so the
 * peak is a multiple of the file. Scanned documents are the usual reason for a
 * large PDF and they compress well below this. If it proves too tight the
 * number belongs in Remote Config, not in a bigger constant here.
 */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const MAX_UPLOAD_LABEL = "25 MB";

/**
 * The upload ceiling for the AI routes, which is a per-plan question rather
 * than a per-container one: those four forward pages to Gemini and are billed
 * by the page, so the limit is a cost control.
 *
 * Every plan is on the shared 25 MB today, which is exactly what the routes
 * enforced before this existed — the mechanism is here so the ceilings can be
 * pulled apart without touching four routes, not because the numbers have been
 * decided. Set the real ones here, or move the table to Remote Config.
 *
 * Async because that is how the routes call it: whatever these become, a
 * Remote Config lookup can slot in without changing a single caller.
 */
const AI_UPLOAD_BYTES: Record<PlanId, number> = {
    free: MAX_UPLOAD_BYTES,
    pro: MAX_UPLOAD_BYTES,
    business: MAX_UPLOAD_BYTES,
};

export async function maxUploadBytesFor(plan: PlanId): Promise<number> {
    return AI_UPLOAD_BYTES[plan] ?? MAX_UPLOAD_BYTES;
}

/** What each family of tools will accept, by extension and by MIME type. */
export const ACCEPT = {
    pdf: { extensions: [".pdf"], mime: ["application/pdf"], label: "a PDF" },
    image: {
        extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg", ".avif", ".heic"],
        mime: ["image/"],
        label: "an image",
    },
    word: {
        extensions: [".doc", ".docx"],
        mime: [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        label: "a Word document",
    },
    excel: {
        extensions: [".xls", ".xlsx", ".csv"],
        mime: [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
        ],
        label: "a spreadsheet",
    },
    powerpoint: {
        extensions: [".ppt", ".pptx"],
        mime: [
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
        label: "a PowerPoint file",
    },
} as const;

export type AcceptKind = keyof typeof ACCEPT;

/**
 * Refuses a file that is too large or the wrong kind, or null to proceed.
 *
 * Both the extension and the reported MIME type are accepted, because browsers
 * disagree about what they send — Windows reports .csv as
 * application/vnd.ms-excel, and several report nothing at all. This is a cheap
 * guard against the obviously wrong file, not a content check: the parser
 * remains the thing that decides whether the bytes are really a document.
 */
export function rejectBadUpload(
    file: File,
    kind: AcceptKind,
    maxBytes: number = MAX_UPLOAD_BYTES
): NextResponse | null {
    if (file.size === 0) {
        return bad(`That file is empty. Please choose ${ACCEPT[kind].label}.`);
    }

    if (file.size > maxBytes) {
        const size = (file.size / (1024 * 1024)).toFixed(1);
        // The limit in the message is the one actually applied, not the shared
        // constant — telling somebody the limit is 25 MB while refusing at 10
        // is worse than not saying a number at all.
        const limit = maxBytes === MAX_UPLOAD_BYTES
            ? MAX_UPLOAD_LABEL
            : `${(maxBytes / (1024 * 1024)).toFixed(0)} MB`;
        return bad(
            `That file is ${size} MB. The limit is ${limit} — please compress it or split it first.`,
            413
        );
    }

    const { extensions, mime, label } = ACCEPT[kind];
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();

    const extensionOk = extensions.some((ext) => name.endsWith(ext));
    const mimeOk = type !== "" && mime.some((m) => (m.endsWith("/") ? type.startsWith(m) : type === m));

    if (!extensionOk && !mimeOk) {
        return bad(`That does not look like ${label}. Please choose a different file.`);
    }

    return null;
}

function bad(message: string, status = 400): NextResponse {
    return NextResponse.json({ success: false, error: message, message }, { status });
}

/**
 * Characters that must not reach a Content-Disposition header.
 *
 * Listed as codepoints rather than typed into a character class: writing
 * control characters literally into source makes the file binary to git and
 * grep, which is exactly how an unreadable regex ended up in lib/pdf-text.ts.
 */
const UNSAFE_IN_FILENAME = new Set<number>([
    0x22, //  "   ends the quoted string
    0x5c, //  \\   escapes inside it
    0x2f, 0x3a, //  /  :   path separators
    0x2a, 0x3f, 0x3c, 0x3e, 0x7c, //  *  ?  <  >  |
    0x7f, //  DEL
]);

function isUnsafeInFilename(code: number): boolean {
    return code < 0x20 || UNSAFE_IN_FILENAME.has(code);
}

/**
 * A Content-Disposition header that cannot be broken by the file's name.
 *
 * The name came straight from the upload and straight into the header, so a
 * quote in it ended the quoted string and everything after was read as header
 * syntax. A control character would be rejected by the runtime instead, turning
 * a download into a 500.
 *
 * The ASCII form is stripped for older clients, and the real name is repeated
 * in the RFC 5987 field so accents and non-Latin scripts survive rather than
 * being mangled.
 */
export function contentDisposition(filename: string): string {
    let cleaned = "";
    for (const character of filename) {
        if (!isUnsafeInFilename(character.charCodeAt(0))) cleaned += character;
    }

    const fallback = cleaned.replace(/\s+/g, " ").trim().slice(0, 150) || "download";

    return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
