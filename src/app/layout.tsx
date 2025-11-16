import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PostHogProvider } from "~/providers/PostHogProvider";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "OpenCode Web",
  description: "Run and explore GitHub repositories in your browser",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="overscroll-contain bg-black">
        <PostHogProvider>
          <NuqsAdapter>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </NuqsAdapter>
        </PostHogProvider>
      </body>
    </html>
  );
}
