import { test } from "node:test";
import assert from "node:assert/strict";
import { formatComment, formatLabel } from "./text-util.js";
import { TextDefaults } from "./constants.js";

// Minimal stand-in for the release payload; only the properties referenced by the
// tests need to exist. Cast to the parameter type since building the full webhook
// payload shape is unnecessary for exercising the placeholder substitution.
const release = {
    id: 42,
    name: "v1.2.0",
    tag_name: "v1.2.0",
    html_url: "https://github.com/owner/repo/releases/tag/v1.2.0",
    draft: false,
    prerelease: true,
    author: {
        login: "octocat",
        avatar_url: "https://avatars.example/u/1",
    },
} as unknown as Parameters<typeof formatComment>[1];

test("replaces known placeholders with release values", () => {
    assert.equal(
        formatComment("Released {{name}} at {{html_url}}", release),
        "Released v1.2.0 at https://github.com/owner/repo/releases/tag/v1.2.0"
    );
});

test("resolves nested (dotted) placeholders", () => {
    assert.equal(formatLabel("by {{author.login}}", release), "by octocat");
});

test("leaves placeholders not on the allowlist untouched", () => {
    // {{unknown}} is unknown; {{author}} is not allowed on its own (only author.* is).
    assert.equal(
        formatComment("{{unknown}} and {{author}}", release),
        "{{unknown}} and {{author}}"
    );
});

test("tolerates whitespace inside the braces", () => {
    assert.equal(formatComment("{{  name  }}", release), "v1.2.0");
});

test("renders boolean release properties as strings", () => {
    assert.equal(
        formatComment("draft={{draft}} pre={{prerelease}}", release),
        "draft=false pre=true"
    );
});

test("replaces every occurrence of a repeated placeholder", () => {
    assert.equal(formatComment("{{name}}-{{name}}", release), "v1.2.0-v1.2.0");
});

test("falls back to the default comment when input is empty", () => {
    const out = formatComment("", release);
    assert.ok(!out.includes("{{"), "default comment should have its placeholders resolved");
    assert.ok(out.includes(release.name));
    assert.ok(out.includes(release.html_url));
});

test("falls back to the default label when input is empty", () => {
    // TextDefaults.LabelName is "release-{{name}}".
    assert.equal(formatLabel("", release), TextDefaults.LabelName.replace("{{name}}", "v1.2.0"));
    assert.equal(formatLabel("", release), "release-v1.2.0");
});
