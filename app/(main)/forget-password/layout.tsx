import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset your password",
    description: "Request a password reset link for your PDF AI Assistant account.",
    // Nothing here is useful in search results.
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}