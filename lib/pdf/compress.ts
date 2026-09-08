import "server-only";
import {
    PDFArray,
    PDFDict,
    PDFDocument,
    PDFName,
    PDFRawStream,
    PDFRef,
} from "pdf-lib";
import sharp from "sharp";

/**
 * Making a PDF smaller, by making the pictures inside it smaller.
 *
 * What was here before copied every page into a fresh document and saved it
 * with object streams. That rewrites the file's scaffolding, which on a real
 * document is a rounding error: measured on a four-page report with a
 * photograph on each page, all six levels came back at 0.0% — and "Extreme"
 * came back very slightly larger, because scaling a page adds a transform to
 * its content stream without touching the image it draws.
 *
 * Nearly all of a large PDF is its images, usually at several times the
 * resolution anything will display them at. A 1600px-wide photograph placed in
 * a 535pt-wide box is carrying about three times the pixels it can show. So
 * the work is: find the images, re-encode them smaller, put them back, and
 * leave the text and vectors exactly as they are — text is sharp at any zoom
 * and costs almost nothing to store.
 */

/** What a level actually asks for, once the marketing percentage is set aside. */
export interface CompressionProfile {
    /** Longest edge in pixels an image is allowed to keep. */
    maxEdge: number;
    /** JPEG quality for re-encoded images. */
    quality: number;
}

/**
 * The UI offers ratios from 0.95 (minimal) down to 0.25 (extreme). They are a
 * request, not a promise: how much a file actually shrinks depends on what is
 * in it, and a PDF of pure text will barely move whatever is asked for.
 *
 * The mapping is deliberately gentle at the top. "Minimal" should be safe to
 * run on anything — a document you are about to send a client — so it only
 * trims genuinely excessive resolution and re-encodes at a quality where the
 * difference is hard to see.
 */
export function profileFor(ratio: number): CompressionProfile {
    if (ratio <= 0.3) return { maxEdge: 1000, quality: 45 };
    if (ratio <= 0.45) return { maxEdge: 1240, quality: 55 };
    if (ratio <= 0.6) return { maxEdge: 1500, quality: 65 };
    if (ratio <= 0.75) return { maxEdge: 1800, quality: 72 };
    if (ratio <= 0.9) return { maxEdge: 2200, quality: 82 };
    return { maxEdge: 2600, quality: 88 };
}

export interface CompressionResult {
    bytes: Uint8Array;
    /** Images actually replaced with a smaller version. */
    imagesRecoded: number;
    /** Images looked at but left alone. */
    imagesSkipped: number;
    originalSize: number;
    compressedSize: number;
}

/**
 * A PDF name without its slash.
 *
 * pdf-lib renders names as they appear in the file, so /Image comes back as
 * "/Image". Comparing that against "Image" quietly matches nothing, which is
 * how the first version of this skipped every image in the document and
 * reported a nought per cent reduction.
 */
function nameOf(value: unknown): string {
    return value instanceof PDFName ? value.asString().replace(/^\//, "") : "";
}

/** Every filter named on a stream, whether it carries one or a chain of them. */
function filtersOf(dict: PDFDict): string[] {
    const filter = dict.lookup(PDFName.of("Filter"));
    if (filter instanceof PDFName) return [nameOf(filter)];
    if (filter instanceof PDFArray) return filter.asArray().map(nameOf);
    return [];
}

function numberOf(dict: PDFDict, key: string): number | null {
    const value = dict.lookup(PDFName.of(key));
    // PDFNumber, but lookup gives back the base class.
    const n = (value as { asNumber?: () => number })?.asNumber?.();
    return typeof n === "number" ? n : null;
}

/**
 * Re-encodes one image, or returns null to leave it alone.
 *
 * Returning null is the common and correct outcome for anything unusual. A PDF
 * can hold JPEG 2000, CCITT fax groups, indexed palettes, separation inks and
 * 1-bit masks, and each has its own rules about what the bytes mean. Guessing
 * at one and getting it wrong produces a file that opens to a black page, which
 * is far worse than a file that did not get smaller.
 */
async function shrinkImage(
    stream: PDFRawStream,
    profile: CompressionProfile
): Promise<{ data: Buffer; width: number; height: number; channels: number } | null> {
    const dict = stream.dict;
    const filters = filtersOf(dict);

    // Only baseline JPEG. It is what cameras, scanners and every "export to
    // PDF" produces, so it is the overwhelming majority of the bytes in the
    // files people bring to a compressor.
    if (!filters.includes("DCTDecode") || filters.length !== 1) return null;

    // An image with its own decode table or colour-key masking has meaning
    // beyond its pixels; re-encoding drops that.
    if (dict.has(PDFName.of("Decode")) || dict.has(PDFName.of("Mask"))) return null;

    const width = numberOf(dict, "Width");
    const height = numberOf(dict, "Height");
    if (!width || !height) return null;

    const source = Buffer.from(stream.getContents());

    let meta;
    try {
        meta = await sharp(source).metadata();
    } catch {
        return null;
    }

    // CMYK and anything with an embedded profile changes colour when converted;
    // a print-ready document quietly shifting hue is not a trade worth making.
    if (meta.space === "cmyk" || meta.hasProfile) return null;

    const longest = Math.max(meta.width ?? width, meta.height ?? height);
    const scale = longest > profile.maxEdge ? profile.maxEdge / longest : 1;

    try {
        const pipeline = sharp(source);
        if (scale < 1) {
            pipeline.resize({
                width: Math.max(1, Math.round((meta.width ?? width) * scale)),
                withoutEnlargement: true,
            });
        }

        const { data, info } = await pipeline
            // mozjpeg buys roughly a further ten per cent at the same quality,
            // for time nobody notices on an image this size.
            .jpeg({ quality: profile.quality, mozjpeg: true })
            .toBuffer({ resolveWithObject: true });

        // Greyscale in, greyscale out — the colour space written into the
        // dictionary has to match the bytes, or the page renders as noise.
        if (info.channels !== 1 && info.channels !== 3) return null;

        // Never make a picture bigger. An already-optimised image re-encoded
        // at a lower quality can still come out larger, and swapping it in
        // would mean the "compressed" file grew.
        if (data.length >= source.length) return null;

        return { data, width: info.width, height: info.height, channels: info.channels };
    } catch {
        return null;
    }
}

/**
 * Compresses a PDF by re-encoding the images inside it.
 *
 * The document is edited in place rather than rebuilt page by page, so
 * bookmarks, links, form fields and anything else hanging off the object graph
 * survive — copying pages into a new document silently drops most of that.
 */
export async function compressPdf(
    input: Uint8Array,
    ratio: number
): Promise<CompressionResult> {
    const profile = profileFor(ratio);
    const doc = await PDFDocument.load(input, { ignoreEncryption: true });

    let imagesRecoded = 0;
    let imagesSkipped = 0;

    const entries: Array<[PDFRef, PDFRawStream]> = [];
    for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
        if (!(obj instanceof PDFRawStream)) continue;
        if (nameOf(obj.dict.lookup(PDFName.of("Subtype"))) === "Image") {
            entries.push([ref, obj]);
        }
    }

    for (const [ref, stream] of entries) {
        const shrunk = await shrinkImage(stream, profile);
        if (!shrunk) {
            imagesSkipped++;
            continue;
        }

        // A fresh dictionary rather than an edited one: the old entries for
        // length, size and colour space all describe the bytes being replaced,
        // and leaving any of them behind describes the wrong image.
        const dict = doc.context.obj({
            Type: "XObject",
            Subtype: "Image",
            Width: shrunk.width,
            Height: shrunk.height,
            ColorSpace: shrunk.channels === 1 ? "DeviceGray" : "DeviceRGB",
            BitsPerComponent: 8,
            Filter: "DCTDecode",
            Length: shrunk.data.length,
        });

        // Soft masks are a separate image holding the transparency. It is
        // carried across untouched — losing it turns a cut-out logo into a
        // white box.
        const smask = stream.dict.get(PDFName.of("SMask"));
        if (smask) dict.set(PDFName.of("SMask"), smask);

        doc.context.assign(ref, PDFRawStream.of(dict, shrunk.data));
        imagesRecoded++;
    }

    // Whatever the document said about itself is not worth carrying, and on a
    // scanned file the producer string can name the machine it came off.
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");

    const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });

    // If the work did not pay off — a text-only document, or one whose images
    // are already smaller than we would make them — hand back the original.
    // Returning something larger and calling it compressed is worse than
    // saying it could not be improved.
    if (bytes.length >= input.length) {
        return {
            bytes: input,
            imagesRecoded: 0,
            imagesSkipped: imagesRecoded + imagesSkipped,
            originalSize: input.length,
            compressedSize: input.length,
        };
    }

    return {
        bytes,
        imagesRecoded,
        imagesSkipped,
        originalSize: input.length,
        compressedSize: bytes.length,
    };
}
