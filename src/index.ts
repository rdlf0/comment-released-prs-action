import { setFailed } from "@actions/core"
import { context } from "@actions/github"
// import { WebhookPayloadReleaseRelease as Release } from "@octokit/webhooks"
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

        console.log("HELLLO!");
        console.log(context.payload);

        // const release: Release = context.payload as Release;
        const release: webhooks.WebhookPayloadRelease = context.payload as webhooks.WebhookPayloadRelease;

        console.log(`Release ID=${release.release.id}, tag=${release.release.tag_name}`);
        // console.log(release.id.toString());
        // console.log(release.author.login);
        // console.log(release.tag_name);
        // console.log(release.assets_url);
        // console.log("Here's the whole payload:");
        // console.log(release);

        // core.setOutput("pr-ids", "Some IDs will come here")
    } catch (error) {
        setFailed(error.message)
    }
}

run()
