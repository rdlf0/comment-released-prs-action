import * as core from "@actions/core";
import * as github from "@actions/github";
import { components } from "@octokit/openapi-types";

export type ClientType = ReturnType<typeof github.getOctokit>;
type ResponseSchemas = components["schemas"];

// Upper bound on the commits inspected for the first-ever release (the path with no
// previous release to diff against). Each commit triggers a separate
// listPullRequestsAssociatedWithCommit request, so this caps API usage to stay well
// within the GITHUB_TOKEN rate limit. Subsequent releases use compareCommits, which
// is naturally bounded by the size of the release and not subject to this limit.
export const FIRST_RELEASE_COMMIT_LIMIT = 50;

export async function getPreviousRelease(
    client: ClientType,
    currentRelease: { id: number; created_at: string | null }
): Promise<ResponseSchemas["release"] | undefined> {
    const {
        data: releases
    } = await client.rest.repos.listReleases({
        ...github.context.repo,
        per_page: 100,
        page: 1,
    });

    // Find the most recent published (non-draft) release that precedes the current one.
    // listReleases includes drafts and may not return them in a dependable order, so we
    // filter out drafts and the current release, then pick the newest by creation date.
    // A published release always has a creation date; fall back to "now" if it's somehow
    // absent so that every prior release still qualifies as preceding it.
    const currentCreatedAt = currentRelease.created_at
        ? new Date(currentRelease.created_at).getTime()
        : Date.now();

    return releases
        .filter(release =>
            !release.draft &&
            release.id !== currentRelease.id &&
            new Date(release.created_at).getTime() < currentCreatedAt
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .at(0);
}

export async function getReleasedPRNumbers(
    client: ClientType,
    base: string | undefined,
    head: string
): Promise<Set<number>> {

    let commits: { sha: string }[];

    if (base === undefined) {
        const responseCommits = await client.rest.repos.listCommits({
            ...github.context.repo,
            sha: head,
            per_page: FIRST_RELEASE_COMMIT_LIMIT,
            page: 1,
        });

        commits = responseCommits.data;
        core.debug(`Found ${commits.length} commits when listed from head=${head} (capped at ${FIRST_RELEASE_COMMIT_LIMIT})`);
    } else {
        const responseCommits = await client.rest.repos.compareCommits({
            ...github.context.repo,
            base: base,
            head: head,
        });

        commits = responseCommits.data.commits;
        core.debug(`Found ${commits.length} commits when compared base=${base} and head=${head}`);
    }

    const prNumbers: Set<number> = new Set();
    for (const commit of commits) {
        const { data: prs } = await client.rest.repos.listPullRequestsAssociatedWithCommit({
            ...github.context.repo,
            commit_sha: commit.sha,
        });

        prs.forEach(pr => {
            prNumbers.add(pr.number);
        });
    }

    return prNumbers;
}

export async function addCommentsToPRs(
    client: ClientType,
    prNumbers: Set<number>,
    body: string
): Promise<void> {

    for (const prNumber of prNumbers) {
        const response = await client.rest.issues.createComment({
            ...github.context.repo,
            issue_number: prNumber,
            body: body,
        });

        core.debug(`Commented PR: ${prNumber}, response code: ${response.status.toString()}`);
    }
}

export async function addLabelToPRs(
    client: ClientType,
    prNumbers: Set<number>,
    label: string
): Promise<void> {

    for (const prNumber of prNumbers) {
        const response = await client.rest.issues.addLabels({
            ...github.context.repo,
            issue_number: prNumber,
            labels: [label]
        });

        core.debug(`Labeled PR: ${prNumber}, response code: ${response.status.toString()}`);
    }
}
