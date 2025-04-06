"use server";

import { redis } from "@/redis";
import { after } from "next/server";

export interface Stargazer {
  id: number;
  login: string;
  avatar_url: string;
}

// biome-ignore lint/suspicious/noExplicitAny: The any type is used here because the return type is JSON
async function githubRequest(url: string): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.message) {
      throw new Error(data.message);
    }

    return data;
  } catch {
    throw new Error("Error fetching GitHub API");
  }
}

export async function getStargazers() {
  let stargazers = (await redis.get("github:stargazers")) as Stargazer[];
  if (stargazers) {
    return stargazers;
  }

  const repository = "lucas-ht/42calculator";
  const repositoryInformation = await githubRequest(
    `https://api.github.com/repos/${repository}`,
  );
  const stargazers_count = repositoryInformation.stargazers_count;

  const lastPage = Math.ceil(stargazers_count / 30);
  const remainingStargazers = stargazers_count % 30;
  const extraStargazers = remainingStargazers > 0 && remainingStargazers < 30;

  stargazers = [];

  if (extraStargazers) {
    const previousPageStargazers = (await githubRequest(
      `https://api.github.com/repos/${repository}/stargazers?per_page=30&page=${lastPage - 1}`,
    )) as Stargazer[];

    stargazers = previousPageStargazers.slice(-(30 - remainingStargazers));
  }

  const lastPageStargazers = (await githubRequest(
    `https://api.github.com/repos/${repository}/stargazers?per_page=30&page=${lastPage}`,
  )) as Stargazer[];

  stargazers = [...stargazers, ...lastPageStargazers].reverse();

  after(async () => {
    await redis.set("github:stargazers", stargazers, {
      px: 2000,
    });
  });

  return stargazers;
}
