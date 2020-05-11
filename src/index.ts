import * as core from "@actions/core"
import * as github from "@actions/github"
import {
    WebhookPayloadRelease as PayloadRelease,
    WebhookPayloadReleaseRelease as Release,
} from "@octokit/webhooks"

async function run(): Promise<void> {
    try {
        const token = core.getInput('repo-token', { required: true });
        const octokit = new github.GitHub(token);

        const currentRelease: Release = getCurrentRelease();
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
            core.setOutput("pr-ids", prs.map(pr => pr.number));
        } else {
            core.setOutput("pr-ids", []);
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

function getCurrentRelease(): Release {
    const payload: PayloadRelease = github.context.payload as PayloadRelease;

    return payload.release;
}

async function getPreviousRelease(client: github.GitHub) {
    const responseReleases = await client.repos.listReleases({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        per_page: 2,
        page: 1
    });

    const releases = responseReleases.data;

    if (releases.length < 2) {
        return undefined;
    }

    return releases[1];
}

async function getReleasedPRs(client: github.GitHub, base: string | undefined, head: string) {
    let commits;

    if (base == undefined) {
        const responseCommits = await client.repos.listCommits({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            sha: head
        });

        commits = responseCommits.data;
    } else {
        const responseCommits = await client.repos.compareCommits({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            base: base,
            head: head
        });

        commits = responseCommits.data.commits;
    }

    let prs: any[] = [];
    for (const commit of commits) {
        const responsePRs = await client.repos.listPullRequestsAssociatedWithCommit({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            commit_sha: commit.sha
        });

        prs = prs.concat(responsePRs.data);
    }

    return prs;
}

run()
