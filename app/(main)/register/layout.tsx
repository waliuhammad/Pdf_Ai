import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create an account",
    description: "Create a PDF AI Assistant account to save your documents.",
    // Nothing here is useful in search results.
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}