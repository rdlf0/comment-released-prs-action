import {
    WebhookPayloadReleaseRelease,
    WebhookPayloadReleaseReleaseAuthor,
} from "@octokit/webhooks";

const DEFAULT_BODY = "🎉 Hooray! The changes in this pull request went live with the release of [{{name}}]({{html_url}}) 🎉"
const PLACEHOLDERS = [
    "id",
    "name",
    "tag_name",
    "url",
    "html_url",
    "assets_url",
    "upload_url",
    "tarball_url",
    "zipball_url",
    "body",
    "node_id",
    "target_commitish",
    "created_at",
    "published_at",
    "draft",
    "prerelease",
    "author.avatar_url",
    "author.gravatar_id",
    "author.html_url",
    "author.id",
    "author.login",
    "author.organizations_url",
];

export class BodyProcessor {

    public static process(
        input: string,
        release: WebhookPayloadReleaseRelease,
    ): string {
        if (input == undefined || input.length == 0) {
            input = DEFAULT_BODY;
        }

        return input.replace(/{{(\w+(?:\.\w+)*)}}/g, (match, prop) => {
            if (!PLACEHOLDERS.includes(prop)) {
                return match;
            }

            const parts = prop.split(".");
            if (parts.length == 2) {
                return release["author"][parts[1] as keyof WebhookPayloadReleaseReleaseAuthor] as string;
            }

            return release[parts[0] as keyof WebhookPayloadReleaseRelease] as string;
        });
    }

}
