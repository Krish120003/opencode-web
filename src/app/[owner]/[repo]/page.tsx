import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { SandboxControls } from "./_components/sandbox-controls";
import { SandboxPtty } from "./_components/sandbox-ptty";
import { Suspense } from "react";
import { loadSandboxSearchParams } from "~/lib";

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
      <div>TOOD Sandbox Status</div>
    </div>
  );
}

export default async function RepoPage({ params, searchParams }: PageProps) {
  const { owner, repo } = await params;
  const { sandbox: sandboxId } = loadSandboxSearchParams(await searchParams);

  // Fetch sandbox status and repo metadata in parallel
  let [sandboxUrl, repoData] = await Promise.all([
    sandboxId
      ? (await api.sandbox.getStatus({ sandboxId })).ttydUrl
      : Promise.resolve(null),
    api.repo.getRepoMetadata({ owner, repo }).catch(() => null),
  ]);

  if (!repoData) {
    return notFound();
  }

  if (!sandboxUrl) {
    const sandboxData = await api.sandbox.create({ owner, repo });
    // redirect to include sandbox ID in URL
    return redirect(
      `/${owner}/${repo}?sandbox=${encodeURIComponent(sandboxData.id)}`,
    );
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
          <Suspense fallback={<div>Loading Sandbox...</div>}>
            <SandboxPtty url={sandboxUrl} />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  );
}
