import * as core from "@actions/core";
import * as github from "@actions/github";
import { EmitterWebhookEvent } from "@octokit/webhooks";
import { formatComment, formatLabel } from "./text-util.js";
import { Inputs, Outputs } from "./constants.js";
import {
    ClientType,
    getPreviousRelease,
    getReleasedPRNumbers,
    addCommentsToPRs,
    addLabelToPRs,
} from "./github-api.js";

async function run(): Promise<void> {
    try {
        const { eventName, payload } = github.context;

        if (eventName !== "release" || payload.action !== "published") {
            core.error(
                `This action is meant to run only when a release is being published. Current event="${eventName}"; Current action="${payload.action}"`
            );
            return;
        }

        // The guard above verified the event, so this assertion now reflects a checked fact.
        const { release: currentRelease } = payload as EmitterWebhookEvent<"release.published">["payload"];

        const token = core.getInput(Inputs.RepoToken, { required: true });
        const octokit: ClientType = github.getOctokit(token);

        core.debug(`Current release tag=${currentRelease.tag_name}`);

        const previousRelease = await getPreviousRelease(octokit, currentRelease);
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
        const formattedComment = formatComment(commentBody, currentRelease);
        await addCommentsToPRs(octokit, prNumbers, formattedComment);

        const shouldAddLabel = core.getBooleanInput(Inputs.AddLabel);
        if (shouldAddLabel) {
            const labelPattern = core.getInput(Inputs.LabelPattern);
            const formattedLabel = formatLabel(labelPattern, currentRelease);
            await addLabelToPRs(octokit, prNumbers, formattedLabel);
        }

        core.setOutput(Outputs.PRIDs, Array.from(prNumbers));
    } catch (error: unknown) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

run()
