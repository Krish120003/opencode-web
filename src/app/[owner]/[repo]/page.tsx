import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { api, HydrateClient } from "~/trpc/server";
import { SandboxTerminal } from "./_components/sandbox-terminal-client";
import { loadSandboxSearchParams } from "~/lib";
import { SandboxStatus } from "./_components/sandbox-status";

interface PageProps {
  searchParams: Promise<{
    sandbox?: string;
  }>;
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

interface SandboxHeaderProps {
  owner: string;
  repo: string;
  avatarUrl: string;
}

async function SandboxHeader(props: SandboxHeaderProps) {
  return (
    <div className="flex h-full w-full items-center justify-between bg-black px-4 font-mono">
      <a
        className="flex items-center gap-2"
        href={`https://github.com/${props.owner}/${props.repo}`}
      >
        <img
          src={props.avatarUrl}
          alt={`${props.owner} avatar`}
          className="size-6 rounded-full"
        />
        {props.owner} / {props.repo}
      </a>
      <div>
        <SandboxStatus />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} - OpenCode Web`,
    description: `Explore and run ${owner}/${repo} in your browser`,
  };
}

export default async function RepoPage({ params, searchParams }: PageProps) {
  const { owner, repo } = await params;
  loadSandboxSearchParams(await searchParams);

  // Fetch sandbox status and repo metadata in parallel
  const [repoData] = await Promise.all([
    api.repo.getRepoMetadata({ owner, repo }).catch(() => null),
  ]);

  if (!repoData) {
    return notFound();
  }

  return (
    <HydrateClient>
      <main className="flex h-screen max-h-screen flex-col overscroll-none bg-neutral-900 text-white">
        <div className="h-10 w-full">
          <SandboxHeader
            owner={owner}
            repo={repo}
            avatarUrl={repoData.owner.avatarUrl}
          />
        </div>
        <div></div>
        {/* <SandboxControls owner={owner} repo={repo} /> */}
        <div className="h-[calc(100%-var(--spacing)*10)] w-full bg-transparent">
          <SandboxTerminal owner={owner} repo={repo} />
        </div>
      </main>
    </HydrateClient>
  );
}
