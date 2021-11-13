import { EmitterWebhookEvent } from "@octokit/webhooks";
import { RELEASE_PLACEHOLDERS, TextDefaults } from "./constants";

export class TextUtil {

    public static formatComment(
        input: string,
        release: EmitterWebhookEvent<"release">["payload"]["release"]
    ): string {
        return this.format(input, release, TextDefaults.CommentBody);
    }

    public static formatLabel(
        input: string,
        release: EmitterWebhookEvent<"release">["payload"]["release"]
    ): string {
        return this.format(input, release, TextDefaults.LabelName);
    }

    private static format(
        input: string,
        release: EmitterWebhookEvent<"release">["payload"]["release"],
        defaultString: string
    ): string {
        if (input == undefined || input.length == 0) {
            input = defaultString;
        }

        return input.replace(/{{\s*(\w+(?:\.\w+)*)\s*}}/g, (match, prop) => {
            if (!RELEASE_PLACEHOLDERS.includes(prop)) {
                return match;
            }

            const parts = prop.split(".");
            let result: any = release;
            for (const part of parts) {
                result = result[part];
            }

            return result;
        });
    }

}
