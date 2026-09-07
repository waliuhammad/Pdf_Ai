/**
 * Long-form, per-tool copy shown beneath each tool's working area. Purely
 * informational — it exists to explain each tool and to give the page real,
 * indexable content. Keyed by pathname (the tool's route). A route with no
 * entry here simply renders nothing extra, so non-tool pages (the tools list,
 * dashboard, settings, checkout) are unaffected.
 *
 * To adjust copy for a tool, edit its `paragraphs` below. To cover a new tool,
 * add an entry keyed by its route.
 */

export type ToolContent = {
    /** Section heading, e.g. "About Merge PDF". */
    heading: string;
    /** Body paragraphs: what it does, when to use it, limits, and privacy. */
    paragraphs: string[];
};

export const toolContent: Record<string, ToolContent> = {
    "/merge-pdf": {
        heading: "About Merge PDF",
        paragraphs: [
            "Merge PDF combines several separate PDF files into a single document, in the order you choose. It is the tool to reach for when a report arrives in pieces — a cover letter, a body, and an appendix as three files — and you need one clean document to send, print, or archive. You can reorder files before merging, so the final page sequence matches exactly what you intend.",
            "Because the tool works at the page level, it handles mixed sources without fuss: pages exported from Word, scans, and pages from other PDFs can all sit in the same output. Each file can be up to 25 MB, and very large batches of high-resolution scans naturally take longer to assemble than a handful of text pages. If the order looks wrong after merging, simply rearrange the files and merge again — the originals are untouched.",
            "Your files are processed privately, only to produce the merged document, and nothing about them is kept afterwards. Merging needs a free account, because each run counts against a daily allowance that belongs to the account rather than the browser.",
        ],
    },
    "/split-pdf": {
        heading: "About Split PDF",
        paragraphs: [
            "Split PDF extracts pages from a document so you can keep only what you need. Use it when a single file holds several things at once — a scanned bundle where pages 1 to 3 are a contract and 4 to 10 are receipts — and you want each part as its own file. It is also the quickest way to pull one page out of a long document to share on its own.",
            "You choose the pages or ranges to extract, and the tool produces a new PDF from your selection while leaving the original file exactly as it was. This makes it safe to experiment: if you extract the wrong range, nothing is lost, and you can try again. Splitting is fast for ordinary documents; the main thing that slows it down is a very high page count with heavy images on every page.",
            "Files are processed privately and only to carry out the split you requested, and nothing is kept afterwards. You will need a free account: each split counts against a daily allowance held against the account.",
        ],
    },
    "/compress-pdf": {
        heading: "About Compress PDF",
        paragraphs: [
            "Compress PDF reduces a file's size so it fits inside an email attachment limit or uploads faster to a portal. Most of a PDF's weight comes from images rather than text, so this tool focuses on those: it downsamples and re-encodes images sensibly for on-screen reading while keeping your text crisp. A file that is mostly text will shrink only a little, because there is little to remove; an image-heavy or scanned file can often become dramatically smaller.",
            "Reach for it whenever a document is rejected for being too large, or simply to keep a shared file quick to open. A good habit is to compress once from the original rather than repeatedly, since each pass discards a little more detail. After compressing, view the result at full zoom to confirm small text and fine lines still look sharp before you send it.",
            "Your file is processed privately, only to produce the smaller version, and nothing about the document is used beyond generating your download. A free account is needed, since each compression counts against a daily allowance.",
        ],
    },
    "/rotate-pdf": {
        heading: "About Rotate PDF",
        paragraphs: [
            "Rotate PDF fixes pages that are sideways or upside down. Scanners and phone cameras often capture pages in the wrong orientation, and a rotated page is awkward to read and looks unprofessional when printed. This tool turns pages to the correct upright position and saves the corrected orientation into the file, so it stays right everywhere the document is opened.",
            "It is most useful after scanning a stack of paper where some sheets went in the wrong way, or when a converted document came out landscape instead of portrait. You can rotate individual pages or the whole document, in ninety-degree steps, until everything reads the right way up. The change is applied to the saved file rather than being a temporary view setting, which is the difference that makes it stick when you email or print the result.",
            "Files are processed privately and only to apply the rotation you asked for, and nothing is kept afterwards. A free account is needed, because each run counts against a daily allowance.",
        ],
    },
    "/watermark-pdf": {
        heading: "About Watermark PDF",
        paragraphs: [
            "Watermark PDF stamps text across the pages of a document — words like Draft, Confidential, or a company name — so the file's status or ownership is clear at a glance. A watermark is useful when you circulate a version that should not be mistaken for final, or when you want light discouragement against a document being passed off as someone else's.",
            "The watermark is applied across the pages so it is visible without obscuring the underlying content, and it becomes part of the saved file rather than a preview overlay. Use it before sharing drafts for review, distributing internal copies, or sending samples. Keep in mind that a visible watermark marks a document but does not lock it; if you need to prevent opening or editing outright, pair it with the Protect PDF tool, which adds password security.",
            "Your file is processed privately and only to add the watermark you specified, and nothing is kept afterwards. A free account is needed, because each run counts against a daily allowance.",
        ],
    },
    "/protect-pdf": {
        heading: "About Protect PDF",
        paragraphs: [
            "Protect PDF adds a password to a document so that only people with that password can open it. It is the right tool when you are sending something sensitive — a contract, a payslip, medical or financial paperwork — over email or a channel you do not fully control. Once protected, the file is encrypted, so its contents cannot be read without the password even if the file itself is intercepted or forwarded.",
            "Choose a strong password and share it through a separate channel from the document itself; sending the file and its password in the same email defeats the purpose. Remember the password, because a protected PDF genuinely cannot be opened without it — there is no back door, which is exactly what makes the protection meaningful. If you later need to remove protection from a file you can already open, the Unlock PDF tool does the reverse.",
            "Your file is processed privately, only to apply the encryption, and nothing is kept afterwards. The password you set is used to secure the document and is not needed for anything else. A free account is required, because each run counts against a daily allowance.",
        ],
    },
    "/unlock-pdf": {
        heading: "About Unlock PDF",
        paragraphs: [
            "Unlock PDF removes a password from a document you can already open, producing a copy that no longer prompts for one. It is convenient when a file arrives protected but you will be working with it repeatedly and do not want to type the password every time, or when you need to run it through another tool that expects an unprotected file.",
            "This tool is for documents you are entitled to access: you supply the password the file already has, and it produces an unlocked version. It is not a way to break into a document you do not have the password for — that is by design, because the encryption that Protect PDF applies is meant to be genuinely secure. Once unlocked, treat the resulting file with the same care as any sensitive document, since it will open freely for anyone.",
            "Your file is processed privately and only to produce the unlocked copy, and nothing is kept afterwards. The password you enter is used solely to remove the protection you already hold. A free account is required, because each run counts against a daily allowance.",
        ],
    },
    "/edit-pdf": {
        heading: "About Edit PDF",
        paragraphs: [
            "Edit PDF lets you make changes directly to a document — adding text, marking it up, or adjusting content — without converting it to another format first and back again. It suits the small, practical fixes that come up constantly: filling in a detail, adding a note, or correcting something on a page when you do not have the original source file the PDF was made from.",
            "It is the tool for quick, targeted changes rather than rebuilding a document from scratch. For a light edit on a page or two it saves the round trip of exporting to Word, editing, and re-exporting. If you find yourself needing to rewrite large sections or restructure a document heavily, converting to Word with the PDF to Word tool and editing there may be the smoother path, then converting back.",
            "Your file is processed privately, only to apply your edits, and nothing is kept afterwards. A free account is needed, because each save counts against a daily allowance.",
        ],
    },
    "/sign-pdf": {
        heading: "About Sign PDF",
        paragraphs: [
            "Sign PDF adds a signature to a document, so you can complete forms and agreements without printing, signing by hand, and scanning back. It is the tool for the everyday paperwork that asks for a signature — a form, a letter of consent, a simple agreement — where the friction of paper is the only thing standing between you and sending it back.",
            "You place your signature where it belongs on the page, and it becomes part of the saved file. This removes the print-sign-scan cycle entirely and keeps the document clean and legible rather than degraded by a scanner. For routine documents this is exactly what is needed; where a transaction requires a formally certified or legally witnessed electronic signature, check whether the recipient mandates a specific certified e-signature service for that particular purpose.",
            "Your file is processed privately and only to add your signature, and nothing is kept afterwards. A free account is needed, because each signed document counts against a daily allowance.",
        ],
    },
    "/image-to-pdf": {
        heading: "About Image to PDF",
        paragraphs: [
            "Image to PDF turns photos and image files into a single PDF document. It is the simplest way to make a stack of pictures presentable and shareable — snapshots of receipts, photographed pages of a document, or a set of scanned images that should travel together as one file rather than a dozen separate attachments.",
            "You add your images, order them as you want them to appear, and the tool assembles them into a PDF with one image per page. This is far tidier than emailing loose photos, and the resulting file opens the same way on any device. For the sharpest result, start from clear, well-lit images; the PDF preserves what the source image contains, so a blurry photo produces a blurry page.",
            "This tool runs entirely in your browser, which means your images never leave your device — nothing is uploaded to a server. That makes it a safe choice for photographing personal documents. You will still need a free account, because the conversion counts against a daily allowance even though the images stay on your machine.",
        ],
    },
    "/pdf-to-image": {
        heading: "About PDF to Image",
        paragraphs: [
            "PDF to Image converts the pages of a PDF into standalone image files, one per page. It is useful when you need a page as a picture rather than a document — to drop into a slide, post online, embed in another app, or preview a page somewhere that cannot display PDFs. Turning a page into an image also flattens it, which is handy when you want to share how a page looks without the underlying selectable text.",
            "You convert the whole document or specific pages, and each becomes its own image file ready to use. Because an image is a snapshot, remember that text in the output is no longer selectable or searchable; if you need editable text from a scanned page instead, the OCR PDF tool is the right one. For everyday sharing and embedding, images are the more universally accepted format.",
            "This tool runs entirely in your browser, so your PDF never leaves your device and nothing is uploaded. You will still need a free account, because the conversion counts against a daily allowance even though the file stays on your machine.",
        ],
    },
    "/excel-to-pdf": {
        heading: "About Excel to PDF",
        paragraphs: [
            "Excel to PDF converts a spreadsheet into a fixed PDF document, so the layout you see is exactly what the recipient sees. Spreadsheets shift depending on the software, screen size, and settings used to open them; turning one into a PDF freezes the presentation, which matters when you are sending an invoice, a report, or a schedule that must look the same for everyone.",
            "Use it whenever a spreadsheet is meant to be read rather than edited — sharing figures with a client, attaching a summary to an email, or printing a clean copy. Since a PDF is a fixed page, it is worth setting up your print area and column widths in the spreadsheet first so nothing important is cut off at the page edge. The result is a portable document anyone can open without spreadsheet software.",
            "This tool runs entirely in your browser, which means your spreadsheet never leaves your device and nothing is uploaded to a server. You will still need a free account, because the conversion counts against a daily allowance.",
        ],
    },
    "/pdf-to-excel": {
        heading: "About PDF to Excel",
        paragraphs: [
            "PDF to Excel extracts tables from a PDF into an editable spreadsheet, so you can sort, total, and work with figures that were previously locked inside a document. It saves the tedious, error-prone job of retyping rows of numbers from a statement, report, or invoice by hand.",
            "Reach for it whenever data you need to analyse is trapped in a PDF. The tool works best on genuine, well-structured tables with clear rows and columns; the cleaner the original layout, the cleaner the spreadsheet. Very complex or irregular tables — merged cells, multi-level headers, or figures scattered across a page rather than gridded — may need a little tidying after conversion, so it is always worth a quick check of the numbers against the source before relying on them.",
            "Your file is processed privately and only to produce the spreadsheet, and the document is used solely to generate your download. A free account is required, because each extraction counts against a daily allowance.",
        ],
    },
    "/pdf-to-ppt": {
        heading: "About PDF to PowerPoint",
        paragraphs: [
            "PDF to PowerPoint turns a PDF into an editable slide deck, with each page becoming a slide you can adjust. It is the tool for when a presentation only exists as a PDF — an old deck whose source file is lost, or slides someone shared as a PDF — and you need to update or reuse them rather than rebuild from scratch.",
            "Use it to recover editable slides, refresh a deck for a new audience, or lift a few slides into another presentation. How much you can edit afterwards depends on the original: cleanly laid-out pages convert into slides that are straightforward to tweak, while pages that were flattened images give you the visual back but less separated, editable structure. It is a large head start on remaking a deck, not always a pixel-perfect reconstruction.",
            "Your file is processed privately, only to produce the presentation, and nothing is kept afterwards. A free account is required, because each conversion counts against a daily allowance.",
        ],
    },
    "/ppt-to-pdf": {
        heading: "About PowerPoint to PDF",
        paragraphs: [
            "PowerPoint to PDF converts a presentation into a fixed PDF, so your slides look identical for everyone regardless of the software or fonts on their machine. Presentations are notorious for shifting when opened elsewhere — fonts substitute, layouts move, animations misbehave — and a PDF removes all of that uncertainty for anyone who only needs to read the slides.",
            "It is ideal for sharing a deck as a handout, attaching it to an email, or printing it, where you want a clean, stable copy rather than an editable file. Each slide becomes a page, producing a document that opens anywhere without presentation software. Bear in mind that a PDF is static, so anything that depended on motion — builds, transitions, embedded video — becomes a still representation of the slide.",
            "Your file is processed privately and only to create the PDF, and nothing is kept afterwards. A free account is needed, because each conversion counts against a daily allowance.",
        ],
    },
    "/pdf-to-word": {
        heading: "About PDF to Word",
        paragraphs: [
            "PDF to Word converts a PDF into an editable Word document, so you can rework text that would otherwise be locked in place. It is one of the most common needs in document work: you have a PDF but not the original file, and you need to update a clause, correct a detail, or reuse the wording somewhere else.",
            "Use it whenever you need to edit rather than merely read a PDF. Text-based documents convert well and give you editable paragraphs to work with; the more complex the original layout — multiple columns, boxes, heavy formatting — the more the result may need light cleanup once it is in Word. Scanned PDFs are a special case, because their pages are images of text rather than text itself; for those, run OCR PDF first so there is real text to convert. After editing in Word, you can convert back with Word to PDF.",
            "Your file is processed privately, only to produce the Word document, and nothing is kept afterwards. A free account is needed, because each conversion counts against a daily allowance.",
        ],
    },
    "/word-to-pdf": {
        heading: "About Word to PDF",
        paragraphs: [
            "Word to PDF converts a document into a fixed PDF that looks the same for every reader. A Word file can reflow when opened on a different device or with different fonts installed, which is a problem when you are sending something where the exact layout matters — a CV, a formal letter, a contract, or anything headed for print.",
            "It is the standard final step before sharing a finished document: convert to PDF and you have a portable, tamper-evident copy that opens cleanly anywhere without Word. Fonts and formatting are baked in, so what you approve is what the recipient sees. For the best result, finish your formatting in Word first, since the PDF captures the document as it stands at the moment of conversion.",
            "Your file is processed privately and only to create the PDF, and nothing is kept afterwards. A free account is needed, because each conversion counts against a daily allowance.",
        ],
    },
    "/ocr-pdf": {
        heading: "About OCR PDF",
        paragraphs: [
            "OCR PDF reads the text inside scanned pages and images, turning a picture of a document into text you can select, copy, and search. A scanned PDF looks like a document but behaves like a photograph — you cannot highlight a word or find a phrase in it — and OCR (optical character recognition) is what bridges that gap, recognising the letters and adding a real text layer.",
            "Use it to make an archive of scans searchable, to pull quotes or figures out of a scanned report, or as a first step before converting a scanned file to Word or Excel, both of which need real text to work from. Accuracy depends heavily on the source: a clean, straight, high-resolution scan reads very well, while faint, skewed, or low-resolution pages produce more mistakes, so it is worth checking important passages against the original.",
            "Your file is processed privately and only to produce the searchable text, and nothing is kept afterwards. You will need an account: the free plan includes one extraction a day, Pro five and Business ten.",
        ],
    },
    "/grammar": {
        heading: "About Grammar Check",
        paragraphs: [
            "Grammar Check reviews a document for spelling mistakes, grammatical slips, and awkward phrasing, so your writing reads cleanly and professionally. It is the second pair of eyes that catches the typo you have read past five times, the missing word, or the sentence that came out tangled — the small errors that quietly undermine an otherwise good document.",
            "Reach for it before sending anything that represents you: an application, a report, a proposal, or an important email. It is an aid to your own judgement rather than a replacement for it — suggestions are worth reviewing rather than accepting blindly, since tone and intent are yours to decide. For high-stakes documents, a careful human read after the check is still the best final step.",
            "Your document is processed privately and only to produce the writing suggestions, used solely to generate your result. You will need an account, and grammar checking is part of the Pro and Business plans: five documents a day on Pro, ten on Business.",
        ],
    },
    "/summarize-pdf": {
        heading: "About Summarize PDF",
        paragraphs: [
            "Summarize PDF reads a long document and produces a concise overview of its key points, so you can grasp the substance without reading every page. It is built for the documents that are too long to read end to end when you only need the gist — a lengthy report, a dense contract, a research paper, or a policy you must understand quickly.",
            "Use it to triage what deserves a full read, to refresh your memory on a document you have seen before, or to brief someone else fast. Treat the summary as a guide to the document rather than a substitute for it: for anything you will act on or be held to — legal, financial, or contractual detail — read the relevant sections in full, since a summary necessarily leaves things out. It points you to what matters; it does not replace the source.",
            "Your document is processed privately, only to generate the summary, and nothing is kept afterwards. You will need an account: the free plan includes one summary a day, Pro five and Business ten.",
        ],
    },
    "/translate": {
        heading: "About Translate PDF",
        paragraphs: [
            "Translate PDF renders a document into another language while keeping it readable, so you can understand material written in a language you do not read, or share your own document with an audience that does not read yours. It removes the barrier of copying text out into a separate translator and losing the document's shape in the process.",
            "It is well suited to understanding the content of a foreign-language document and to producing a working translation for everyday communication. As with any automatic translation, accuracy varies with how complex or specialised the text is; straightforward prose translates more reliably than legal, technical, or idiomatic writing. For anything official, contractual, or high-stakes, have the result reviewed by a fluent human before relying on it.",
            "Your document is processed privately and only to produce the translation, used solely to generate your result. You will need an account, and translation is part of the Pro and Business plans: five documents a day on Pro, ten on Business.",
        ],
    },
};

export function getToolContent(pathname: string): ToolContent | undefined {
    return toolContent[pathname];
}
