"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_BODY = "🎉 Hooray! The changes in this pull request went live with the release of [{{name}}]({{html_url}}) 🎉";
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
class BodyProcessor {
    static process(input, release) {
        if (input == undefined || input.length == 0) {
            input = DEFAULT_BODY;
        }
        return input.replace(/{{(\w+(?:\.\w+)*)}}/g, (match, prop) => {
            if (!PLACEHOLDERS.includes(prop)) {
                return match;
            }
            const parts = prop.split(".");
            let base = release;
            for (let i = 0; i < parts.length - 1; i++) {
                base = base[parts[i]];
            }
            return base[parts[parts.length - 1]];
        });
    }
}
exports.BodyProcessor = BodyProcessor;
