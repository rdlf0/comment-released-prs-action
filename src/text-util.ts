import { EmitterWebhookEvent } from "@octokit/webhooks";

const DEFAULT_COMMENT_BODY = "🎉 Hooray! The changes in this pull request went live with the release of [{{name}}]({{html_url}}) 🎉";
const DEFAULT_LABEL_NAME = "release-{{name}}";
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

export class TextUtil {

    public static formatComment(
        input: string,
        release: EmitterWebhookEvent<"release">["payload"]["release"]
    ): string {
        return this.format(input, release, DEFAULT_COMMENT_BODY);
    }

    public static formatLabel(
        input: string,
        release: EmitterWebhookEvent<"release">["payload"]["release"]
    ): string {
        return this.format(input, release, DEFAULT_LABEL_NAME);
    }

    private static format(
        input: string,
        release: EmitterWebhookEvent<"release">["payload"]["release"],
        defaultString: string
    ): string {
        if (input == undefined || input.length == 0) {
            input = defaultString;
        }

        return input.replace(/{{(\w+(?:\.\w+)*)}}/g, (match, prop) => {
            if (!PLACEHOLDERS.includes(prop)) {
                return match;
            }

            const parts = prop.split(".");
            let base: any = release;
            for (let i = 0; i < parts.length - 1; i++) {
                base = base[parts[i]];
            }

            return base[parts[parts.length - 1]];
        });
    }

}
