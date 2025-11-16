"use client";

import { useQueryState } from "nuqs";
import { api } from "~/trpc/react";

interface SandboxPttyProps {
  url: string;
}

export function SandboxPtty(props: SandboxPttyProps) {
  // TRIGGER THIS AT MOST ONCE

  return (
    <iframe
      src={props.url}
      className="h-full w-full border-0"
      title="Terminal"
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
}
