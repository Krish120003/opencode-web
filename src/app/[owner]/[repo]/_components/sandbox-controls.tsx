"use client";

import { useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface SandboxControlsProps {
  owner: string;
  repo: string;
}

export function SandboxControls({ owner, repo }: SandboxControlsProps) {
  const [sandboxId, setSandboxId] = useQueryState("sandbox");
  const [ttydUrl, setTtydUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Check if existing sandbox is still active
  const { data: sandboxStatus } = api.sandbox.getStatus.useQuery(
    { sandboxId: sandboxId ?? "" },
    { enabled: !!sandboxId, refetchInterval: 5000 },
  );

  const createMutation = api.sandbox.create.useMutation({
    onSuccess: (data) => {
      setSandboxId(data.id);
      setTtydUrl(data.ttydUrl);
      setIsCreating(false);
    },
    onError: (error) => {
      console.error("Failed to create sandbox:", error);
      alert("Failed to create sandbox. Please try again.");
      setIsCreating(false);
    },
  });

  const stopMutation = api.sandbox.stop.useMutation({
    onSuccess: () => {
      setSandboxId(null);
      setTtydUrl(null);
    },
    onError: (error) => {
      console.error("Failed to stop sandbox:", error);
      alert("Failed to stop sandbox. Please try again.");
    },
  });

  // Update ttydUrl when sandbox status changes
  useEffect(() => {
    if (sandboxStatus?.exists && sandboxStatus.ttydUrl) {
      setTtydUrl(sandboxStatus.ttydUrl);
    } else if (sandboxStatus?.exists === false && sandboxId) {
      // Sandbox no longer exists, clear the URL param
      setSandboxId(null);
      setTtydUrl(null);
    }
  }, [sandboxStatus, sandboxId, setSandboxId]);

  const handleCreateSandbox = () => {
    setIsCreating(true);
    createMutation.mutate({ owner, repo });
  };

  const handleStopSandbox = () => {
    if (sandboxId) {
      stopMutation.mutate({ sandboxId });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sandbox Controls */}
      <div className="rounded-xl bg-white/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Development Sandbox</h2>
          {sandboxId && (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
              Active
            </span>
          )}
        </div>

        <p className="mb-4 text-sm text-gray-300">
          Open an interactive terminal environment with the repository cloned
          and ready to use.
        </p>

        <div className="flex gap-3">
          {!sandboxId ? (
            <button
              onClick={handleCreateSandbox}
              disabled={isCreating}
              className="rounded-lg bg-[hsl(280,100%,70%)] px-6 py-3 font-semibold text-white transition hover:bg-[hsl(280,100%,60%)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating Sandbox..." : "🚀 Open Sandbox"}
            </button>
          ) : (
            <button
              onClick={handleStopSandbox}
              disabled={stopMutation.isPending}
              className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stopMutation.isPending ? "Stopping..." : "⏹️ Stop Sandbox"}
            </button>
          )}
        </div>

        {isCreating && (
          <div className="mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
              <span>
                Setting up your development environment... This may take a
                minute.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Iframe */}
      {ttydUrl && sandboxId && (
        <div className="rounded-xl bg-white/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Terminal</h2>
            <span className="text-xs text-gray-400">
              Sandbox ID: {sandboxId}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-lg bg-black">
            <iframe
              src={ttydUrl}
              className="h-[600px] w-full border-0"
              title="Terminal"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>

          <p className="mt-2 text-xs text-gray-400">
            The repository has been cloned to /workspace. You can start working
            immediately!
          </p>
        </div>
      )}
    </div>
  );
}
