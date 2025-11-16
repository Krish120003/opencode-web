// "use client";
// import { useMutation } from "@tanstack/react-query";
// import { useEffect, useState } from "react";
// import { api } from "~/trpc/react";

// interface SandboxMakerProps {
//   owner: string;
//   repo: string;
// }
// function SandboxMaker({ owner, repo }: SandboxMakerProps) {
//   const createSandboxMutation = api.sandbox.create.useMutation({
//     onSuccess: (data) => {},
//   });

//   useEffect(() => {
//     // Trigger sandbox creation on mount
//     createSandboxMutation.mutate({ owner, repo });
//   }, [owner, repo]);

//   return null;
// }
