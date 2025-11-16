import { z } from "zod";
import { Octokit } from "@octokit/rest";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Optional: Add GitHub token for higher rate limits
});

export const repoRouter = createTRPCRouter({
  getRepoMetadata: publicProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { data } = await octokit.repos.get({
          owner: input.owner,
          repo: input.repo,
        });

        return {
          name: data.name,
          fullName: data.full_name,
          description: data.description,
          owner: {
            login: data.owner.login,
            avatarUrl: data.owner.avatar_url,
            type: data.owner.type,
          },
          htmlUrl: data.html_url,
          homepage: data.homepage,
          language: data.language,
          stargazersCount: data.stargazers_count,
          watchersCount: data.watchers_count,
          forksCount: data.forks_count,
          openIssuesCount: data.open_issues_count,
          defaultBranch: data.default_branch,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          pushedAt: data.pushed_at,
          size: data.size,
          license: data.license
            ? {
                name: data.license.name,
                spdxId: data.license.spdx_id,
              }
            : null,
          topics: data.topics,
          visibility: data.visibility,
          isPrivate: data.private,
          isFork: data.fork,
          isArchived: data.archived,
        };
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          error.status === 404
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Repository not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch repository metadata",
        });
      }
    }),
});
