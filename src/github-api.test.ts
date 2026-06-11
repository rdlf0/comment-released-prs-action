import { test } from "node:test";
import assert from "node:assert/strict";

// github.context.repo reads GITHUB_REPOSITORY lazily (via a getter), so setting it
// here — before any test runs — is enough for the spread `...github.context.repo`.
process.env.GITHUB_REPOSITORY = "owner/repo";

import {
    ClientType,
    FIRST_RELEASE_COMMIT_LIMIT,
    getPreviousRelease,
    getReleasedPRNumbers,
    addCommentsToPRs,
    addLabelToPRs,
} from "./github-api.js";

// Builds a fake Octokit whose `rest` tree is whatever the test supplies. Only the
// endpoints a given function touches need to be provided.
function fakeClient(rest: unknown): ClientType {
    return { rest } as unknown as ClientType;
}

function release(id: number, created_at: string, draft = false) {
    return { id, created_at, draft };
}

test("getPreviousRelease returns the newest non-draft release before the current one", async () => {
    const current = { id: 100, created_at: "2024-03-01T00:00:00Z" };
    const client = fakeClient({
        repos: {
            listReleases: async () => ({
                data: [
                    release(100, "2024-03-01T00:00:00Z"),       // the current release — excluded
                    release(97, "2024-01-01T00:00:00Z"),        // older non-draft (listed before #98)
                    release(99, "2024-02-20T00:00:00Z", true),  // draft — excluded
                    release(98, "2024-02-15T00:00:00Z"),        // newest non-draft before current
                ],
            }),
        },
    });

    const previous = await getPreviousRelease(client, current);

    // Order-independent: #98 wins on creation date even though #97 precedes it in the list.
    assert.equal(previous?.id, 98);
});

test("getPreviousRelease returns undefined when only drafts or the current release exist", async () => {
    const current = { id: 100, created_at: "2024-03-01T00:00:00Z" };
    const client = fakeClient({
        repos: {
            listReleases: async () => ({
                data: [
                    release(100, "2024-03-01T00:00:00Z"),       // current
                    release(99, "2024-02-20T00:00:00Z", true),  // draft
                    release(98, "2024-04-01T00:00:00Z"),        // non-draft but newer than current
                ],
            }),
        },
    });

    assert.equal(await getPreviousRelease(client, current), undefined);
});

test("getPreviousRelease falls back to 'now' when the current release has no created_at", async () => {
    const current = { id: 100, created_at: null };
    const client = fakeClient({
        repos: {
            listReleases: async () => ({
                data: [
                    release(98, "2024-02-15T00:00:00Z"),
                    release(99, "2024-02-20T00:00:00Z"),
                ],
            }),
        },
    });

    const previous = await getPreviousRelease(client, current);

    // With no current date, all prior non-drafts qualify; newest by date wins.
    assert.equal(previous?.id, 99);
});

test("getReleasedPRNumbers lists commits from head (capped) for a first release and dedupes PRs", async () => {
    let listCommitsArgs: any;
    let compareCalled = false;
    const prsBySha: Record<string, { number: number }[]> = {
        a: [{ number: 1 }, { number: 2 }],
        b: [{ number: 2 }],
        c: [],
    };
    const client = fakeClient({
        repos: {
            listCommits: async (args: any) => {
                listCommitsArgs = args;
                return { data: [{ sha: "a" }, { sha: "b" }, { sha: "c" }] };
            },
            compareCommits: async () => {
                compareCalled = true;
                return { data: { commits: [] } };
            },
            listPullRequestsAssociatedWithCommit: async (args: any) => ({
                data: prsBySha[args.commit_sha],
            }),
        },
    });

    const result = await getReleasedPRNumbers(client, undefined, "v1.0.0");

    assert.deepEqual([...result].sort(), [1, 2]);
    assert.equal(compareCalled, false, "should not compare when there is no base");
    assert.equal(listCommitsArgs.per_page, FIRST_RELEASE_COMMIT_LIMIT);
    assert.equal(listCommitsArgs.sha, "v1.0.0");
});

test("getReleasedPRNumbers compares commits between base and head for a subsequent release", async () => {
    let listCommitsCalled = false;
    const prsBySha: Record<string, { number: number }[]> = {
        x: [{ number: 5 }],
        y: [{ number: 5 }, { number: 6 }],
    };
    const client = fakeClient({
        repos: {
            listCommits: async () => {
                listCommitsCalled = true;
                return { data: [] };
            },
            compareCommits: async () => ({
                data: { commits: [{ sha: "x" }, { sha: "y" }] },
            }),
            listPullRequestsAssociatedWithCommit: async (args: any) => ({
                data: prsBySha[args.commit_sha],
            }),
        },
    });

    const result = await getReleasedPRNumbers(client, "v1.0.0", "v1.1.0");

    assert.deepEqual([...result].sort(), [5, 6]);
    assert.equal(listCommitsCalled, false, "should not list commits when a base is given");
});

test("getReleasedPRNumbers returns an empty set and makes no PR lookups when there are no commits", async () => {
    let prLookups = 0;
    const client = fakeClient({
        repos: {
            compareCommits: async () => ({ data: { commits: [] } }),
            listPullRequestsAssociatedWithCommit: async () => {
                prLookups++;
                return { data: [] };
            },
        },
    });

    const result = await getReleasedPRNumbers(client, "v1.0.0", "v1.1.0");

    assert.equal(result.size, 0);
    assert.equal(prLookups, 0);
});

test("addCommentsToPRs comments on every PR", async () => {
    const commented: number[] = [];
    const client = fakeClient({
        issues: {
            createComment: async (args: any) => {
                commented.push(args.issue_number);
                assert.equal(args.body, "hello");
                assert.equal(args.owner, "owner");
                assert.equal(args.repo, "repo");
                return { status: 201 };
            },
        },
    });

    await addCommentsToPRs(client, new Set([1, 2, 3]), "hello");

    assert.deepEqual(commented, [1, 2, 3]);
});

test("addCommentsToPRs propagates a failed request instead of swallowing it", async () => {
    const client = fakeClient({
        issues: {
            createComment: async (args: any) => {
                if (args.issue_number === 2) {
                    throw new Error("boom");
                }
                return { status: 201 };
            },
        },
    });

    await assert.rejects(addCommentsToPRs(client, new Set([1, 2, 3]), "hello"), /boom/);
});

test("addLabelToPRs labels every PR with the given label", async () => {
    const labeled: { pr: number; labels: string[] }[] = [];
    const client = fakeClient({
        issues: {
            addLabels: async (args: any) => {
                labeled.push({ pr: args.issue_number, labels: args.labels });
                return { status: 200 };
            },
        },
    });

    await addLabelToPRs(client, new Set([7, 8]), "release-v1");

    assert.deepEqual(labeled, [
        { pr: 7, labels: ["release-v1"] },
        { pr: 8, labels: ["release-v1"] },
    ]);
});

test("addLabelToPRs propagates a failed request instead of swallowing it", async () => {
    const client = fakeClient({
        issues: {
            addLabels: async (args: any) => {
                if (args.issue_number === 8) {
                    throw new Error("kaboom");
                }
                return { status: 200 };
            },
        },
    });

    await assert.rejects(addLabelToPRs(client, new Set([7, 8]), "release-v1"), /kaboom/);
});
