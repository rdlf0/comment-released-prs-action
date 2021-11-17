import * as core from "@actions/core";
import * as github from "@actions/github";
import { EmitterWebhookEvent } from "@octokit/webhooks";
import { components } from "@octokit/openapi-types";
import { TextUtil } from "./text-util";
import { Inputs, Outputs } from "./constants";

type ClientType = ReturnType<typeof github.getOctokit>;
type ResponseSchemas = components["schemas"];

async function run(): Promise<void> {
    try {
        const payload = github.context.payload as EmitterWebhookEvent<"release.published">["payload"];
        const event = github.context.eventName;
        const action = payload.action;

        if (event != "release" || action != "published") {
            core.error(
                `This action is meant to run only when a release is being published. Current event="${event}"; Current action="${action}"`
            );
            return;
        }

        const token = core.getInput(Inputs.RepoToken, { required: true });
        const octokit: ClientType = github.getOctokit(token);

        const currentRelease = payload.release;
        core.debug(`Current release tag=${currentRelease.tag_name}`);

        const previousRelease = await getPreviousRelease(octokit);
        if (previousRelease) {
            core.debug(`Previous release tag=${previousRelease.tag_name}`);
        } else {
            core.debug("Previous release not found.");
        }

        const prNumbers: Set<number> = await getReleasedPRNumbers(
            octokit,
            previousRelease?.tag_name,
            currentRelease.tag_name,
        );

        const commentBody = core.getInput(Inputs.CommentBody);
        const formattedComment = TextUtil.formatComment(commentBody, currentRelease);
        await addCommentsToPRs(octokit, prNumbers, formattedComment);

        const shouldAddLabel = core.getBooleanInput(Inputs.AddLabel);
        if (shouldAddLabel) {
            const labelPattern = core.getInput(Inputs.LabelPattern);
            const formattedLabel = TextUtil.formatLabel(labelPattern, currentRelease);
            await addLabelToPRs(octokit, prNumbers, formattedLabel)
        }

        core.setOutput(Outputs.PRIDs, Array.from(prNumbers));
    } catch (error: any) {
        core.error(error);
        core.setFailed(error.message);
    }
}

async function getPreviousRelease(
    client: ClientType
): Promise<ResponseSchemas["release"] | undefined> {
    const {
        data: releases
    } = await client.rest.repos.listReleases({
        ...github.context.repo,
        per_page: 2,
        page: 1,
    });

    if (releases.length < 2) {
        return undefined;
    }

    return releases[1];
}

async function getReleasedPRNumbers(
    client: ClientType,
    base: string | undefined,
    head: string
): Promise<Set<number>> {

    let commits;

    if (base == undefined) {
        const responseCommits = await client.rest.repos.listCommits({
            ...github.context.repo,
            sha: head,
            per_page: 50,
            page: 1,
        });

        commits = responseCommits.data;
        core.debug(`Found ${commits.length} commits when listed from head=${head}`);
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

async function addCommentsToPRs(
    client: ClientType,
    prNumbers: Set<number>,
    body: string
): Promise<void> {

    prNumbers.forEach(async prNumber => {
        const response = await client.rest.issues.createComment({
            ...github.context.repo,
            issue_number: prNumber,
            body: body,
        });

        core.debug(`Commented PR: ${prNumber}, resposne code: ${response.status.toString()}`);
    });
}

async function addLabelToPRs(
    client: ClientType,
    prNumbers: Set<number>,
    label: string
): Promise<void> {

    prNumbers.forEach(async prNumber => {
        const response = await client.rest.issues.addLabels({
            ...github.context.repo,
            issue_number: prNumber,
            labels: [label]
        });

        core.debug(`Labeled PR: ${prNumber}, resposne code: ${response.status.toString()}`);
    });
}

run()
