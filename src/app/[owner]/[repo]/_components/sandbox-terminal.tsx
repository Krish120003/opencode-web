import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

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
  sandboxId: string | null;
}

async function getSandboxUrl(
  owner: string,
  repo: string,
  sandboxId: string | null,
) {
  if (!sandboxId) {
    // create
    const sandboxData = await api.sandbox.create({ owner, repo });
    return redirect(
      `/${owner}/${repo}?sandbox=${encodeURIComponent(sandboxData.id)}`,
    );
  } else {
    // fetch
    const res = await api.sandbox.getStatus({
      sandboxId: sandboxId,
    });
    return res.ttydUrl;
  }
}

export async function SandboxTerminal(props: SandboxTerminalProps) {
  await new Promise((resolve) => setTimeout(resolve, 1000000)); // Simulate delay

  const sandboxUrl = await getSandboxUrl(
    props.owner,
    props.repo,
    props.sandboxId,
  );

  console.log("Sandbox URL:", sandboxUrl);

  if (!sandboxUrl) {
    return <div>ERROR.</div>;
  }

  return <SandboxPtty url={sandboxUrl} />;
}
