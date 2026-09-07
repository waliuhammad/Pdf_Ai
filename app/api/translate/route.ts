import { getAppConfig } from "@/lib/remote-config";
import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import { metered, type MeteredContext } from "@/lib/metered";
import { maxUploadBytesFor, rejectBadUpload } from "@/lib/uploads";
import { relayToAiService } from "@/lib/ai-service";

// Gemini translates the whole document — measured about 8s,
// so the platform default is not enough.
export const maxDuration = 60;


export const POST = metered(async (req: NextRequest, ctx: MeteredContext) => {
  try {
    // Remote Config kill-switch: lets the AI features be disabled from the
    // Firebase Console (parameter: ai_tools_enabled) without a redeploy.
    const { aiToolsEnabled } = await getAppConfig();
    if (!aiToolsEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "AI features are temporarily disabled. Please try again later.",
        },
        { status: 503 }
      );
    }

    const formData = await readFormData(req);
    if (!formData) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Checked here rather than relayed unseen: this route forwards the
    // whole form to the AI service, so an oversized or wrong-typed
    // upload would otherwise become that service's problem too.
    const upload = formData.get("file");
    if (!(upload instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Sized against the plan, not the container: these four forward pages to
    // Gemini and are billed per page, so the ceiling is a cost control rather
    // than a memory one.
    const badUpload = rejectBadUpload(upload, "pdf", await maxUploadBytesFor(ctx.plan));
    if (badUpload) return badUpload;

    // Every failure mode is separated inside relayToAiService: an unreachable
    // service, a service that answered with something other than JSON, and a
    // real error from the service itself all used to arrive here as the same
    // "Unable to connect" message.
    return await relayToAiService("/api/translate", formData, "translate");
  } catch (err) {
    console.error("[translate] failed before the AI service was called", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}, { signInMessage: "Please sign in to use AI features.", category: "translate" });