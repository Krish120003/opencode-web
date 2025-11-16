import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenCode Web - Run GitHub Repos in Your Browser",
  description:
    "Explore and run popular GitHub repositories directly in your browser. Try TypeScript, Python, Rust projects and more.",
};

const popularRepos = [
  {
    owner: "colinhacks",
    repo: "zod",
    description: "TypeScript-first schema validation",
    language: "TypeScript",
  },
  {
    owner: "trpc",
    repo: "trpc",
    description: "End-to-end typesafe APIs",
    language: "TypeScript",
  },
  {
    owner: "sst",
    repo: "opencode",
    description: "The AI coding agent built for the terminal.",
    language: "TypeScript",
  },
  {
    owner: "krish120003",
    repo: "zercel",
    description: "A Vercel clone built on GCP",
    language: "TypeScript",
  },
  {
    owner: "vercel",
    repo: "ms",
    description: "Tiny millisecond conversion utility",
    language: "TypeScript",
  },
  {
    owner: "numpy",
    repo: "numpy",
    description:
      "The fundamental package for scientific computing with Python.",
    language: "Python",
  },
  {
    owner: "rust-lang",
    repo: "rust",
    description: "Empowering everyone to build reliable and efficient software",
    language: "Rust",
  },
  {
    owner: "tauri-apps",
    repo: "tauri",
    description: "Build smaller, faster, and more secure desktop applications",
    language: "Rust",
  },
];

const asciiArtTitle = `                                                  _____ 
 _____                       _        _ _ _     _|___  |
|     |___ ___ ___ ___ ___ _| |___   | | | |___| |_|  _|
|  |  | . | -_|   |  _| . | . | -_|  | | | | -_| . |_|  
|_____|  _|___|_|_|___|___|___|___|  |_____|___|___|_|  
      |_|                                               `;

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section - Instructions */}
      <div className="container mx-auto flex w-full items-center justify-center px-4 pt-8 text-[0.5em] md:justify-start md:pt-16 md:text-base">
        <pre className="">{asciiArtTitle}</pre>
      </div>

      <div className="container mx-auto px-4 py-16 font-mono">
        {/* Try It Out Section */}
        <div>
          <h2 className="mb-2 text-left text-3xl font-bold">Try It Out</h2>
          <p className="mb-2 text-left text-gray-300">
            Click any repository below to get started
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {popularRepos.map((repo) => (
              <Link
                key={`${repo.owner}/${repo.repo}`}
                href={`/${repo.owner}/${repo.repo}`}
                prefetch={false}
                className="group border border-white/20 p-2 hover:bg-white"
              >
                <h3 className="font-mono text-lg font-bold group-hover:text-black">
                  {repo.owner}/{repo.repo}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-800">
                  {repo.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto pb-16 text-center font-mono">
        Made by{" "}
        <a
          href="https://x.com/dotkrish"
          className="underline hover:underline-offset-2"
        >
          @dotkrish
        </a>{" "}
        {"//"}{" "}
        <a
          href="https://krish.gg"
          className="underline hover:underline-offset-2"
        >
          krish.gg
        </a>
      </div>
    </main>
  );
}
