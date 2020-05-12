import * as core from "@actions/core"
import * as github from "@actions/github"
import {
    WebhookPayloadRelease,
    WebhookPayloadReleaseRelease
} from "@octokit/webhooks"

async function run(): Promise<void> {
    try {
        const token = core.getInput('repo-token', { required: true });
        const octokit = new github.GitHub(token);

        const currentRelease: WebhookPayloadReleaseRelease = getCurrentRelease();
        const head = currentRelease.tag_name;
        console.log(`Current release tag=${currentRelease.tag_name}`);

        const previousRelease = await getPreviousRelease(octokit);
        let base;
        if (previousRelease) {
            base = previousRelease.tag_name;
            console.log(`Previous release tag=${previousRelease.tag_name}`);
        } else {
            console.log("Previous release not found.");
        }

        const prs = await getReleasedPRs(octokit, base, head);

        if (prs) {
            addCommentsToPRs(octokit, prs, currentRelease);

            const prIds = prs.map(pr => pr.number);
            console.log(prIds);
            core.setOutput("pr-ids", prIds);
        } else {
            core.setOutput("pr-ids", []);
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

function getCurrentRelease(): WebhookPayloadReleaseRelease {
    const payload: WebhookPayloadRelease = github.context.payload as WebhookPayloadRelease;

    return payload.release;
}

async function getPreviousRelease(client: github.GitHub) {
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

async function getReleasedPRs(client: github.GitHub, base: string | undefined, head: string) {
    // let commits;

    // if (base == undefined) {
    //     const responseCommits = await client.repos.listCommits({
    //         ...github.context.repo,
    //         sha: head
    //     });

    //     commits = responseCommits.data;
    // } else {
    //     const responseCommits = await client.repos.compareCommits({
    //         ...github.context.repo,
    //         base: base,
    //         head: head
    //     });

    //     commits = responseCommits.data.commits;
    // }

    let prs: any[] = [];
    // for (const commit of commits) {
    //     const responsePRs = await client.repos.listPullRequestsAssociatedWithCommit({
    //         ...github.context.repo,
    //         commit_sha: commit.sha
    //     });

    //     prs = prs.concat(responsePRs.data);
    // }

    const responsePR = await client.pulls.get({
        owner: "rdlf0",
        repo: "minesweeper",
        pull_number: 20
    });

    prs.push(responsePR.data);

    return prs;
}

async function addCommentsToPRs(client: github.GitHub, prs: any[], release: any) {
    for (let pr of prs) {
        const responseComment = await client.issues.createComment({
            owner: "rdlf0",
            repo: "minesweeper",
            issue_number: pr.number,
            body: `\u{1F389} This pull request has been released in [${release.name}](${release.html_url}) \u{1F389}`
        });

        core.debug(`Resposne code: ${responseComment.status.toString()}`);
        core.debug(`PR number: ${pr.number}`);
    }
}

run()
