"use client";
import { useQueryState } from "nuqs";

import { useEffect } from "react";
import { api } from "~/trpc/react";
import { SandboxLoading } from "./loading-animated";

interface SandboxPttyProps {
  url: string;
}

function SandboxPtty(props: SandboxPttyProps) {
  return (
    <iframe
      src={props.url}
      className="h-full w-full border-0"
      title="Terminal"
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
}

interface SandboxTerminalProps {
  owner: string;
  repo: string;
}

export function SandboxTerminal(props: SandboxTerminalProps) {
  const [sandboxId, setSandbox] = useQueryState("sandbox");
  const createMutation = api.sandbox.create.useMutation();

  const enableStatusQuery = Boolean(sandboxId);

  // Use suspense query to fetch sandbox status (returns tuple [data, queryResult])
  const { data: sandboxStatus, isLoading } = api.sandbox.getStatus.useQuery(
    {
      sandboxId: sandboxId ?? "",
    },
    {
      enabled: enableStatusQuery,
    },
  );

  // If no sandboxId, create one and redirect
  useEffect(() => {
    if (!sandboxId && !createMutation.isPending) {
      void createMutation.mutate(
        { owner: props.owner, repo: props.repo },
        {
          onSuccess: (data) => {
            void setSandbox(data.id);
          },
        },
      );
    }
  }, [sandboxId, props.owner, props.repo, createMutation, setSandbox]);

  // Show loading state while creating sandbox
  if (!enableStatusQuery || isLoading) {
    return <SandboxLoading />;
  }

  if (!sandboxStatus?.ttydUrl) {
    void setSandbox(null);

    return (
      <div className="flex h-full w-full items-center justify-center">
        Sandbox died, starting a new one...
      </div>
    );
  }

  return <SandboxPtty url={sandboxStatus.ttydUrl} />;
}
