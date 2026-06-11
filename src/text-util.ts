import { EmitterWebhookEvent } from "@octokit/webhooks";
import { RELEASE_PLACEHOLDERS, TextDefaults } from "./constants.js";

type Release = EmitterWebhookEvent<"release">["payload"]["release"];

export function formatComment(input: string, release: Release): string {
    return format(input, release, TextDefaults.CommentBody);
}

export function formatLabel(input: string, release: Release): string {
    return format(input, release, TextDefaults.LabelName);
}

function format(input: string, release: Release, defaultString: string): string {
    if (!input) {
        input = defaultString;
    }

    return input.replace(/{{\s*(\w+(?:\.\w+)*)\s*}}/g, (match, prop) => {
        if (!RELEASE_PLACEHOLDERS.includes(prop)) {
            return match;
        }

        let result: any = release;
        for (const part of prop.split(".")) {
            result = result[part];
        }

        return result;
    });
}
