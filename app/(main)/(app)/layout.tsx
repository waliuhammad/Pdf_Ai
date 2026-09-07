import { AppChrome } from "@/components/app-chrome";
import { RatingPrompt } from "@/components/rating-prompt";
import ToolAbout from "@/components/tools/tool-about";

/**
 * Chrome for the signed-in app area. The PDF tools live here and stay usable
 * without an account — only the routes under (protected) require sign-in,
 * which is why AppChrome picks the frame from the session rather than this
 * layout assuming everyone here is signed in.
 *
 * RatingPrompt sits here rather than in any one tool: this is the layout all
 * twenty-one of them share, so mounting it once means a tool added tomorrow can
 * ask for a rating without being told to. It renders nothing until someone has
 * finished several files and is in a position to have an opinion.
 */
export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AppChrome>
                {children}
                <ToolAbout />
            </AppChrome>
            <RatingPrompt />
        </>
    );
}
