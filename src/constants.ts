export enum Inputs {
    RepoToken = "repo-token",
    CommentBody = "comment-body",
    AddLabel = "add-label",
    LabelPattern = "label-pattern",
}

export enum Outputs {
    PRIDs = 'pr-ids',
}

export enum TextDefaults {
    CommentBody = "🎉 Hooray! The changes in this pull request went live with the release of [{{name}}]({{html_url}}) 🎉",
    LabelName = "release-{{name}}",
}

export const RELEASE_PLACEHOLDERS = [
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
