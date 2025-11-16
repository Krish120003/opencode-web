import Link from "next/link";
import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { SandboxControls } from "./_components/sandbox-controls";

interface PageProps {
  params: {
    owner: string;
    repo: string;
  };
}

export default async function RepoPage({ params }: PageProps) {
  const { owner, repo } = params;

  let repoData;
  try {
    repoData = await api.repo.getRepoMetadata({ owner, repo });
  } catch (error) {
    notFound();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col gap-8 px-4 py-16">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to Home
          </Link>

          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <img
                src={repoData.owner.avatarUrl}
                alt={repoData.owner.login}
                className="h-16 w-16 rounded-full"
              />
              <div className="flex-1">
                <h1 className="text-4xl font-bold">{repoData.fullName}</h1>
                {repoData.description && (
                  <p className="mt-2 text-lg text-gray-300">
                    {repoData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="rounded-lg bg-white/10 px-4 py-2">
                <div className="text-2xl font-bold">
                  ⭐ {repoData.stargazersCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Stars</div>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-2">
                <div className="text-2xl font-bold">
                  🍴 {repoData.forksCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Forks</div>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-2">
                <div className="text-2xl font-bold">
                  👁️ {repoData.watchersCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Watchers</div>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-2">
                <div className="text-2xl font-bold">
                  🐛 {repoData.openIssuesCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Open Issues</div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-6">
                <h2 className="mb-4 text-xl font-semibold">Repository Info</h2>
                <dl className="space-y-2">
                  {repoData.language && (
                    <div className="flex justify-between">
                      <dt className="text-gray-300">Language:</dt>
                      <dd className="font-semibold">{repoData.language}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-300">Default Branch:</dt>
                    <dd className="font-semibold">{repoData.defaultBranch}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-300">Visibility:</dt>
                    <dd className="font-semibold capitalize">
                      {repoData.visibility}
                    </dd>
                  </div>
                  {repoData.license && (
                    <div className="flex justify-between">
                      <dt className="text-gray-300">License:</dt>
                      <dd className="font-semibold">{repoData.license.name}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-300">Size:</dt>
                    <dd className="font-semibold">
                      {(repoData.size / 1024).toFixed(2)} MB
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl bg-white/10 p-6">
                <h2 className="mb-4 text-xl font-semibold">Timestamps</h2>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-300">Created:</dt>
                    <dd className="font-semibold">
                      {new Date(repoData.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-300">Updated:</dt>
                    <dd className="font-semibold">
                      {new Date(repoData.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-300">Last Push:</dt>
                    <dd className="font-semibold">
                      {new Date(repoData.pushedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-300">
                    Flags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {repoData.isFork && (
                      <span className="rounded bg-blue-500/20 px-2 py-1 text-xs">
                        Fork
                      </span>
                    )}
                    {repoData.isArchived && (
                      <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs">
                        Archived
                      </span>
                    )}
                    {repoData.isPrivate && (
                      <span className="rounded bg-red-500/20 px-2 py-1 text-xs">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Topics */}
            {repoData.topics && repoData.topics.length > 0 && (
              <div className="rounded-xl bg-white/10 p-6">
                <h2 className="mb-4 text-xl font-semibold">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {repoData.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-[hsl(280,100%,70%)]/20 px-3 py-1 text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-4">
              <a
                href={repoData.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[hsl(280,100%,70%)] px-6 py-3 font-semibold text-white transition hover:bg-[hsl(280,100%,60%)]"
              >
                View on GitHub →
              </a>
              {repoData.homepage && (
                <a
                  href={repoData.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/20"
                >
                  Visit Homepage →
                </a>
              )}
            </div>

            {/* Sandbox Controls */}
            <SandboxControls owner={owner} repo={repo} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
