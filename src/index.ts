import * as core from "@actions/core";
import * as github from "@actions/github";

export interface Label {
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string;
}

async function run() {
    try {
        core.debug("Starting Enfore Active PR Labeled Action");
        const draft = getPullRequestDraftStatus();
        const labels = getPullRequestLabels();

        core.debug(`Draft: ${draft}`);
        core.debug(`Labels: ${JSON.stringify(labels)}`);

        if (!isValidPullRequest(draft, labels)) {
            core.info("Label check for Active status failed");
            core.setFailed("Active Pull Requests must have at least one Label");
            return;
        }
        core.info("Label check for Pull Request Draft status Passed");

    } catch (error) {
        core.setFailed(error.message);
    }
}

export function getPullRequestDraftStatus(): boolean {
    let pullRequest = github.context.payload.pull_request;
    if (pullRequest === undefined || pullRequest.draft === undefined) {
        throw new Error("This action should only be run with Pull Request Events");
    }
    return pullRequest.draft;
}

export function getPullRequestLabels(): Array<Label> {
    let pullRequest = github.context.payload.pull_request;
    if (pullRequest === undefined || pullRequest.labels === undefined) {
        throw new Error("This action should only be run with Pull Request Events");
    }
    return pullRequest.labels;
}

export function isValidPullRequest(draft: boolean, labels: Array<Label>) {
    if (draft) {
        return true;
    }

    return labels.length > 0;
}

run()