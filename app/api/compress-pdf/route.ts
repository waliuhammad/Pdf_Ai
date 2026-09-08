import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import { metered } from "@/lib/metered";
import { rejectBadUpload } from "@/lib/uploads";
import { compressPdf } from "@/lib/pdf/compress";

// Re-encoding several full-page photographs takes longer than the platform
// default allows. A four-page report runs in a couple of seconds; a long
// scanned document is the case this headroom is for.
export const maxDuration = 60;

export const POST = metered(async (req: NextRequest) => {
  try {
    const formData = await readFormData(req);
    if (!formData) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const targetSizeKB = parseInt((formData.get("targetSizeKB") as string) || "0", 10);
    const targetRatio = parseFloat((formData.get("targetRatio") as string) || "0.5");

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    // Size and type are checked here, before anything reads the bytes.
    const badUpload = rejectBadUpload(file, "pdf");
    if (badUpload) return badUpload;

    const input = new Uint8Array(await file.arrayBuffer());
    const result = await compressPdf(input, targetRatio);

    // The page shows what actually happened rather than the percentage the
    // level advertises. The two are not the same thing and never were: a
    // document of pure text cannot be made 75% smaller by any honest means, and
    // telling somebody it was is how the old version came to claim a reduction
    // it had not made.
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed_${targetSizeKB > 0 ? `${targetSizeKB}KB_` : ""}${file.name}"`,
        "X-Original-Size": String(result.originalSize),
        "X-Compressed-Size": String(result.compressedSize),
        "X-Images-Recoded": String(result.imagesRecoded),
        // So a browser can read the three headers above off a cross-origin
        // response; without this they are invisible to fetch().
        "Access-Control-Expose-Headers":
          "X-Original-Size, X-Compressed-Size, X-Images-Recoded",
      },
    });
  } catch (error) {
    console.error("PDF Compression Error:", error);
    return NextResponse.json(
      { error: "Failed to compress PDF" },
      { status: 500 }
    );
  }
});
