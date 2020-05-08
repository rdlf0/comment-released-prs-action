import { setFailed } from "@actions/core"
import { context } from "@actions/github"
import { WebhookPayloadReleaseRelease as Release } from "@octokit/webhooks"

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

        const release: Release = context.payload as Release;

        console.log(`Release ID=${release.id}, tag=${release.tag_name}`);
        console.log(release.id);
        console.log(release.author.login);
        console.log(release.tag_name);
        console.log(release.assets_url);
        console.log("Here's the whole payload:");
        console.log(release);

        // core.setOutput("pr-ids", "Some IDs will come here")
    } catch (error) {
        setFailed(error.message)
    }
}

run()
