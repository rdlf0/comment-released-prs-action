import * as core from "@actions/core"
import * as github from "@actions/github"
import * as webhooks from "@octokit/webhooks"

async function run(): Promise<void> {
    try {
        // const token = process.env.GITHUB_TOKEN;
        // if (token === undefined) {
        //     core.error("Missing GitHub token");
        //     return;
        // }
        // 
        // const octokit = new github.GitHub(token);
        // const release = await octokit.repos.getRelease();
        // const {
        //     data: {
        //         id: releaseId, tag_name: releaseTag
        //     }
        // } = release;

        const release = github.context.payload as webhooks.WebhookPayloadReleaseRelease;

        console.log(`Release ID=${release.id}, tag=${release.tag_name}`);
        console.log("Here's the whole payload:");
        console.log(release);

        // core.setOutput("pr-ids", "Some IDs will come here")
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
