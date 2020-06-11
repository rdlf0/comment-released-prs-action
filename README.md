# GitHub Action - Adds release comments to PRs v2
This action iterates through all PRs that are part of a release and adds a comment to each of them. It runs only when triggered by a `release` event and a `published` action.

# What's new
- Added a new input parameter for specifying custom body text for the posted comment
- Improved documentation

Refer [here](https://github.com/rdlf0/comment-released-prs-action/blob/v1/README.md) for previous versions.

# Usage
## Inputs
### `repo-token`
**Required** The `GITHUB_TOKEN` secret.

### `comment-body`
Place to set your own custom text for the posted comment. If omitted, the default message shown in the [image below](#posted-comment) will be used. Supports markdown syntax and emojis (see [example](#example-workflow)). The text can contain properties of the release in the form of `{{propertyName}}`. Full list of available properties can be found in the [table below](#available-release-properties).

## Outputs
### `pr-ids`
List of the IDs of the commented PRs

## Available release properties
Here is a list of the release properties which can be used in the custom comment body text via placeholders:
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
| `created_at` | Timestamp in `ISO 8601` format. For example: `2020-05-08T21:25:54Z` |
| `published_at` | Timestamp in `ISO 8601` format. For example: `2020-05-08T21:25:54Z` |
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
        uses: rdlf0/comment-released-prs-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          comment-body: "🙌 This is some sample custom message. 🤣 It supports markdown and emojis! 🎈 You can show information about the release that triggered the action - [{{name}}]({{html_url}}) 💩\r\nOr you can show off with a list:\r\n- Which includes some nonsense\r\n- Or other useless info\r\n- And so on...\r\n\r\nInfo about the author of the release is also available:\r\n![{{author.login}}]({{author.avatar_url}})"
```

## Posted comment
The default comment (if `comment-body` parameter is not set) posted to the PRs will look like this:  
![comment-preview](https://github.com/rdlf0/comment-released-prs-action/blob/master/assets/comment-preview.png)

# License
The scripts and documentation in this project are released under the [MIT License](https://github.com/rdlf0/comment-released-prs-action/blob/master/LICENSE)
