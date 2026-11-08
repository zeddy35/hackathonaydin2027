import "server-only";

export type RepoCheck = "public" | "not_found" | "unknown";

/** github.com/owner/repo only. */
export function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  const m = /^https:\/\/github\.com\/([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?$/.exec(url.trim());
  return m ? { owner: m[1], repo: m[2] } : null;
}

/**
 * Asks the GitHub API whether the repository is public. Unauthenticated calls are
 * rate limited (60/hour per IP); on rate limit, timeout or any other problem the
 * result is "unknown" and the submission is still saved.
 */
export async function checkRepoPublic(url: string): Promise<RepoCheck> {
  const r = parseGithubRepo(url);
  if (!r) return "unknown";
  try {
    const res = await fetch(`https://api.github.com/repos/${r.owner}/${r.repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "hackathonaydin-submission-check" },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.status === 404) return "not_found";
    if (!res.ok) return "unknown";
    const body = (await res.json()) as { private?: boolean };
    return body.private === false ? "public" : "unknown";
  } catch {
    return "unknown";
  }
}
