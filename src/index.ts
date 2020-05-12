import * as core from "@actions/core"
import * as github from "@actions/github"
import { Octokit } from "@octokit/rest"
import {
    WebhookPayloadRelease,
    WebhookPayloadReleaseRelease
} from "@octokit/webhooks"

async function run(): Promise<void> {
    try {
        const token = core.getInput('repo-token', { required: true });
        const octokit = new github.GitHub(token);

        const currentRelease: WebhookPayloadReleaseRelease = getCurrentRelease();
        core.debug(`Current release tag=${currentRelease.tag_name}`);

        const previousRelease = await getPreviousRelease(octokit);
        if (previousRelease) {
            core.debug(`Previous release tag=${previousRelease.tag_name}`);
        } else {
            core.debug("Previous release not found.");
        }

        const prsById = await getReleasedPRs(
            octokit,
            previousRelease?.tag_name,
            currentRelease.tag_name
        );

        await addCommentsToPRs(octokit, prsById, currentRelease);

        core.setOutput("pr-ids", Array.from(prsById.keys()));
    } catch (error) {
        core.setFailed(error.message)
    }
}

function getCurrentRelease(): WebhookPayloadReleaseRelease {
    const payload = github.context.payload as WebhookPayloadRelease;

    return payload.release;
}

async function getPreviousRelease(
    client: github.GitHub
): Promise<Octokit.ReposListReleasesResponseItem | undefined> {

    const { data: releases } = await client.repos.listReleases({
        ...github.context.repo,
        per_page: 2,
        page: 1
    });

    if (releases.length < 2) {
        return undefined;
    }

    return releases[1];
}

async function getReleasedPRs(
    client: github.GitHub,
    base: string | undefined,
    head: string
): Promise<Map<number, Octokit.ReposListPullRequestsAssociatedWithCommitResponseItem>> {

    let commits;

    if (base == undefined) {
        const responseCommits = await client.repos.listCommits({
            ...github.context.repo,
            sha: head
        });

        commits = responseCommits.data;
    } else {
        const responseCommits = await client.repos.compareCommits({
            ...github.context.repo,
            base: base,
            head: head
        });

        commits = responseCommits.data.commits;
    }

    let prsById: Map<number, Octokit.ReposListPullRequestsAssociatedWithCommitResponseItem> = new Map();
    commits.forEach(async commit => {
        const { data: prs } = await client.repos.listPullRequestsAssociatedWithCommit({
            ...github.context.repo,
            commit_sha: commit.sha
        });

        prs.forEach(pr => {
            prsById.set(pr.number, pr);
        });
    });

    return prsById;
}

async function addCommentsToPRs(
    client: github.GitHub,
    prs: Map<number, Octokit.ReposListPullRequestsAssociatedWithCommitResponseItem>,
    release: WebhookPayloadReleaseRelease
) {

    prs.forEach(async pr => {
        const responseComment = await client.issues.createComment({
            ...github.context.repo,
            issue_number: pr.number,
            body: `\u{1F389} This pull request has been released in [${release.name}](${release.html_url}) \u{1F389}`
        });

        core.debug(`Commented PR: ${pr.number}, resposne code: ${responseComment.status.toString()}`);
    });
}

run()
