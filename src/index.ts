import * as core from "@actions/core";
import * as github from "@actions/github";
import { EmitterWebhookEvent } from "@octokit/webhooks";
import { TextUtil } from "./text-util.js";
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

run()
