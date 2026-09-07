import type { Metadata } from "next";

// The page itself is a client component and so cannot export metadata.
export const metadata: Metadata = {
    title: "Unlock PDF",
    description: "Remove password protection. Part of PDF AI Assistant, usable without an account.",
    alternates: { canonical: "/unlock-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}