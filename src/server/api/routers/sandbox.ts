import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Sandbox } from "@vercel/sandbox";
import ms from "ms";
import { sandboxes } from "~/server/db/schema";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { eq } from "drizzle-orm";

export const sandboxRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
          timeout: ms("5m"),
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

        await ctx.db.insert(sandboxes).values({
          id: sandboxId,
          owner: input.owner,
          repo: input.repo,
          url: ttydUrl,
        });

        return {
          id: sandboxId,
          ttydUrl,
        };
      } catch (error: unknown) {
        console.error("[Sandbox] Failed to create sandbox:", error);
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unknown error";
        const stack =
          error && typeof error === "object" && "stack" in error
            ? String(error.stack)
            : undefined;
        const response =
          error && typeof error === "object" && "response" in error
            ? error.response
            : undefined;
        console.error("[Sandbox] Error details:", {
          message,
          stack,
          response,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create sandbox: ${message}`,
        });
      }
    }),

  getStatus: publicProcedure
    .input(
      z.object({
        sandboxId: z.string(),
      }),
    )
    .output(
      z.object({
        status: z.enum(["pending", "running", "stopped"]),
        ttydUrl: z.string().nullable(),
        duration: z.number().nullable(),
        startedAt: z.date().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // fetch from db
      const sandboxRecord = await ctx.db.query.sandboxes.findFirst({
        where: (sandboxes, { eq }) => eq(sandboxes.id, input.sandboxId),
      });

      if (!sandboxRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sandbox record not found in database",
        });
      }

      if (sandboxRecord.diedAt !== null) {
        return {
          status: "stopped",
          ttydUrl: null,
          duration: null,
          startedAt: null,
        };
      }

      const sandboxInfo = await Sandbox.get({ sandboxId: input.sandboxId });

      if (!sandboxInfo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sandbox not found",
        });
      }

      if (
        sandboxInfo.status === "stopped" ||
        sandboxInfo.status === "failed" ||
        sandboxInfo.status === "stopping"
      ) {
        // update db to mark as dead
        await ctx.db
          .update(sandboxes)
          .set({ diedAt: new Date() })
          .where(eq(sandboxes.id, input.sandboxId));

        return {
          status: "stopped",
          ttydUrl: null,
          duration: null,
          startedAt: null,
        };
      }

      return {
        status: sandboxInfo.status,
        ttydUrl: sandboxInfo.domain(7681),
        duration: ms("5m"),
        startedAt: sandboxRecord.createdAt,
      };
    }),
});
