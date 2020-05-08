import * as core from "@actions/core"
import { GitHub, context } from "@actions/github"

async function run(): Promise<void> {
    try {
        const github = new GitHub(process.env.GITHUB_TOKEN);
        const release = await github.repos.getReleaseByTag({
            owner: context.repo.owner,
            repo: context.repo.repo,
            tag: "latest"
        });

        const {
            data: { id: releaseId, tag_name: releaseTag }
        } = release;

        console.log(`Release ID=${releaseId}, tag=${releaseTag}`);

        // core.setOutput("pr-ids", "Some IDs will come here")
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
