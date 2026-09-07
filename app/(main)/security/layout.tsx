import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Security",
    description: "How PDF AI Assistant handles and protects your documents.",
    alternates: { canonical: "/security" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}