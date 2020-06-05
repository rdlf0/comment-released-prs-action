import { WebhookPayloadReleaseRelease } from "@octokit/webhooks";

const DEFAULT_BODY = "\u{1F389} Hooray! The changes in this pull request went live with the release of [{{name}}]({{html_url}}) \u{1F389}"
const PLACEHOLDERS = [
    "url",
    "assets_url",
    "upload_url",
    "html_url",
    "id",
    "node_id",
    "tag_name",
    "target_commitish",
    "name",
    "author", // ?
    "created_at",
    "published_at",
    "tarball_url",
    "zipball_url",
    "body",
    "draft",
    "prerelease",
];

export class BodyProcessor {

    public static process(
        input: string,
        release: WebhookPayloadReleaseRelease,
    ): string {
        if (input == undefined || input.length == 0) {
            input = DEFAULT_BODY;
        }

        return input.replace(/{{(\w+)}}/g, (match, prop) => {
            if (!PLACEHOLDERS.includes(prop)) {
                return match;
            }

            return release[prop as keyof WebhookPayloadReleaseRelease] as string;
        });
    }

}
