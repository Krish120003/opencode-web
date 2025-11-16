import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Sandbox } from "@vercel/sandbox";
import ms from "ms";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

// Store active sandboxes in memory (in production, use a database)
const activeSandboxes = new Map<
  string,
  { id: string; ttydUrl: string; createdAt: Date }
>();

export const sandboxRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log(
          "[Sandbox] Creating sandbox for",
          `${input.owner}/${input.repo}`,
        );

        // Create a new sandbox with proper configuration
        const sbx = await Sandbox.create({
          source: {
            type: "git",
            url: `https://github.com/${input.owner}/${input.repo}.git`,
          },
          resources: { vcpus: 2 },
          timeout: ms("30m"),
          ports: [7681],
          runtime: "node22",
        });

        const sandboxId = sbx.sandboxId;
        console.log("[Sandbox] Created sandbox with ID:", sandboxId);

        // Download ttyd binary using curl
        console.log("[Sandbox] Downloading ttyd...");
        await sbx.runCommand({
          cmd: "curl",
          args: [
            "-L",
            "https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64",
            "-o",
            "ttyd.x86_64",
          ],
        });

        // Make ttyd executable
        await sbx.runCommand({
          cmd: "chmod",
          args: ["+x", "ttyd.x86_64"],
          sudo: true,
        });

        // Start ttyd in detached mode with opencode-ai
        console.log("[Sandbox] Starting ttyd with opencode...");
        await sbx.runCommand({
          cmd: "./ttyd.x86_64",
          args: [
            "-p",
            "7681",
            "-W",
            "-w",
            "/vercel/sandbox",
            "bash",
            "-lc",
            "npx -y opencode-ai",
          ],
          detached: true,
        });

        // Get the ttyd URL from the sandbox domain
        const ttydUrl = sbx.domain(7681);
        console.log("[Sandbox] ttyd available at:", ttydUrl);

        // Store the sandbox info
        activeSandboxes.set(sandboxId, {
          id: sandboxId,
          ttydUrl,
          createdAt: new Date(),
        });

        return {
          id: sandboxId,
          ttydUrl,
        };
      } catch (error: any) {
        console.error("[Sandbox] Failed to create sandbox:", error);
        console.error("[Sandbox] Error details:", {
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create sandbox: ${error.message || "Unknown error"}`,
        });
      }
    }),

  stop: publicProcedure
    .input(
      z.object({
        sandboxId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const sandboxInfo = activeSandboxes.get(input.sandboxId);
        if (!sandboxInfo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sandbox not found",
          });
        }

        // Stop the sandbox using Sandbox.get() then .stop()
        const sbx = await Sandbox.get({ sandboxId: input.sandboxId });
        await sbx.stop();

        // Remove from active sandboxes
        activeSandboxes.delete(input.sandboxId);

        return { success: true };
      } catch (error: any) {
        console.error("Failed to stop sandbox:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to stop sandbox",
        });
      }
    }),

  getStatus: publicProcedure
    .input(
      z.object({
        sandboxId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const sandboxInfo = activeSandboxes.get(input.sandboxId);
      if (!sandboxInfo) {
        return { exists: false, ttydUrl: null };
      }

      return {
        exists: true,
        ttydUrl: sandboxInfo.ttydUrl,
        createdAt: sandboxInfo.createdAt,
      };
    }),
});
