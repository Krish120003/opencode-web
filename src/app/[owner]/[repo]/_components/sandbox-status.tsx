"use client";

import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";

export function SandboxStatus() {
  const [sandboxId] = useQueryState("sandbox");
  const enableStatusQuery = Boolean(sandboxId);

  const timerSpanRef = useRef<HTMLSpanElement>(null);

  const { data: sandboxStatus, isLoading } = api.sandbox.getStatus.useQuery(
    {
      sandboxId: sandboxId ?? "",
    },
    {
      enabled: enableStatusQuery,
    },
  );

  const utils = api.useUtils();

  // TODO: Rewrite nicely
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      sandboxStatus?.status === "running" &&
      sandboxStatus.duration &&
      sandboxStatus.startedAt !== null &&
      timerSpanRef.current
    ) {
      timer = setInterval(() => {
        if (
          timerSpanRef.current &&
          sandboxStatus.startedAt &&
          sandboxStatus.duration
        ) {
          // how long as it been since the creation time?
          const elaposed = Date.now() - sandboxStatus.startedAt.getTime();
          const duration = sandboxStatus.duration;
          const remaining = Math.max(duration - elaposed, 0);
          timerSpanRef.current.textContent = Math.floor(remaining / 1000) + "s";
          if (remaining <= 0) {
            // invalidate query to refetch status
            void utils.sandbox.getStatus.invalidate({ sandboxId: sandboxId! });
          }
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sandboxStatus, sandboxId, utils.sandbox.getStatus]);

  if (!sandboxId) {
    return <div>Creating new sandbox...</div>;
  }

  if (isLoading || !sandboxStatus?.startedAt || !sandboxStatus.duration) {
    return <div>Loading...</div>;
  }

  if (
    sandboxStatus.status === "pending" ||
    sandboxStatus.status === "running"
  ) {
    const elaposed = Date.now() - sandboxStatus.startedAt.getTime();
    const duration = sandboxStatus.duration;
    const remaining = Math.max(duration - elaposed, 0);

    return (
      <div className="flex items-center justify-center gap-4">
        <div className="size-2 animate-pulse bg-green-500"></div>
        Running | Dies in <span ref={timerSpanRef}>{remaining / 1000}s</span>
      </div>
    );
  }

  return <div></div>;
}
