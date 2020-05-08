import { setFailed, info } from "@actions/core"
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

        info(`Release ID=${release.id}, tag=${release.tag_name}`);
        info(release.id.toString());
        info(release.author.login);
        info(release.tag_name);
        info(release.assets_url);
        info("Here's the whole payload:");
        console.log(release);

        // core.setOutput("pr-ids", "Some IDs will come here")
    } catch (error) {
        setFailed(error.message)
    }
}

run()
