# GitHub Action - Adds release comments and labels to PRs v3
This action iterates through all PRs that are part of a release and adds a comment and a label to each of them. It runs only when triggered by a `release` event and a `published` action.

# What's new
- Support for adding a label to the released PRs
- Improved documentation

Refer [here](https://github.com/rdlf0/comment-released-prs-action/blob/v2/README.md) for previous versions.

# Usage
## Inputs
### `repo-token`
**Required** The `GITHUB_TOKEN` secret.

### `comment-body`
A place to set your own custom text for the posted comment. If omitted, the default message shown in the [image below](#posted-comment) will be used. Supports markdown syntax and emojis (see [the example](#example-workflow)). The text can contain placeholders that reference properties of the release in the form of `{{property_name}}`. Full list of the available properties can be found in the [table below](#available-release-properties).

### `add-label`
A boolean parameter specifying if a label should also be added to the PR. The default value is `false`.

### `label-pattern`
A place to set your own label name. This parameter is ignored if `add-label` is set to `false`. It supports the same placeholder syntax as `comment-body` and emojis. If ommited, the default value will be used, which is `release-{{name}}`.

## Outputs
### `pr-ids`
List of the IDs of the processed PRs.

## Available release properties
Here is a list of the release properties which can be used in the custom comment body text and the label name pattern via placeholders:
| Property | Note |
| -------- | ---- |
| `id` |  |
| `name` |  |
| `tag_name` |  |
| `url` |  |
| `html_url` |  |
| `assets_url` |  |
| `upload_url` |  |
| `tarball_url` |  |
| `zipball_url` |  |
| `body` |  |
| `node_id` |  |
| `target_commitish` |  |
| `created_at` | Timestamp in `ISO 8601` format.<br />For example: `2020-05-08T21:25:54Z` |
| `published_at` | Timestamp in `ISO 8601` format.<br />For example: `2020-05-08T21:25:54Z` |
| `draft` | boolean value; prints `true` or `false` |
| `prerelease` | boolean value; prints `true` or `false` |
| `author.id` |  |
| `author.login` | author's username |
| `author.avatar_url` |  |
| `author.gravatar_id` |  |
| `author.html_url` |  |
| `author.organizations_url` |  |

## Example workflow
```yml
name: Comment on released PRs

on:
  release:
    types:
      - published

jobs:
  comment:
    name: Comment on released PRs
    runs-on: ubuntu-latest
    steps:
      - name: Comment on released PRs
        uses: rdlf0/comment-released-prs-action@v3
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          comment-body: |-
            🙌 This is some sample custom message. 🤣 It supports markdown and emojis! 🎈 You can show information about the release that triggered the action - [{{name}}]({{html_url}}) 💩
            Or you can show off with a list:
            - Which includes some nonsense
            - Or other useless info
            - And so on...

            Info about the author of the release is also available:
            ![{{author.login}}]({{author.avatar_url}})
          add-label: true
          label-pattern: "{{tag_name}} ✨"
```

## Posted comment
The default comment (if `comment-body` parameter is not set) posted to the PRs will look like this:  
![comment-preview](https://github.com/rdlf0/comment-released-prs-action/blob/master/assets/comment-preview.png)

# License
The scripts and documentation in this project are released under the [MIT License](https://github.com/rdlf0/comment-released-prs-action/blob/master/LICENSE)
