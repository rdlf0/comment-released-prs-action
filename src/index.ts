import * as core from "@actions/core"

async function run(): Promise<void> {
    try {
        const releaseId: string = core.getInput("release-id")
        core.debug(`Got release id: ${releaseId}`)
        core.debug(new Date().toTimeString())

        core.setOutput("pr-ids", "Some IDs will come here")
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
