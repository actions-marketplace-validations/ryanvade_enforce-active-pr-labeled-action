import * as github from "@actions/github";
import { readFileSync } from "fs";
import { getPullRequestDraftStatus, getPullRequestLabels, isValidPullRequest } from "../src/index";

describe("index", () => {
    describe("getPullRequestDraftStatus", () => {
        it("returns true if a pull request is in draft", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/draft-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            const draft = getPullRequestDraftStatus();
            expect(draft).toBe(true);
        });

        it("returns false if a pull request is not a draft", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/active-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            const draft = getPullRequestDraftStatus();
            expect(draft).toBe(false);
        });

        it("throws an error if the context is not for a pull request", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/wrong-event-type-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            expect(getPullRequestDraftStatus).toThrowError("This action should only be run with Pull Request Events");
        });
    });

    describe("getPullRequestLabels", () => {
        it("returns a pull requests labels", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/labeled-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            const actualLabels = [
                {
                    "id": 2477858081,
                    "node_id": "MDU6TGFiZWwyNDc3ODU4MDgx",
                    "url": "https://api.github.com/repos/ryanvade/enforce-active-pr-labeled-action/labels/bug",
                    "name": "bug",
                    "color": "d73a4a",
                    "default": true,
                    "description": "Something isn't working"
                }
            ];
            const labels = getPullRequestLabels();
            expect(labels).toEqual(actualLabels);
        });

        it("throws an error if the context is not for a pull request", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/wrong-event-type-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            expect(getPullRequestLabels).toThrowError("This action should only be run with Pull Request Events");
        });
    });

    describe("isValidPullRequest", () => {
        it("returns true if the pull request is a draft", () => {
            const draftAndNoLabels = isValidPullRequest(true, []);
            expect(draftAndNoLabels).toBe(true);

            const draftAndLabels = isValidPullRequest(true, [{
                "id": 2477858081,
                "node_id": "MDU6TGFiZWwyNDc3ODU4MDgx",
                "url": "https://api.github.com/repos/ryanvade/enforce-active-pr-labeled-action/labels/bug",
                "name": "bug",
                "color": "d73a4a",
                "default": true,
                "description": "Something isn't working"
            }]);

            expect(draftAndLabels).toBe(true);
        });

        it("returns true if the pull request is not a draft and has labels", () => {
            const draft = false;
            const labels = [{
                "id": 2477858081,
                "node_id": "MDU6TGFiZWwyNDc3ODU4MDgx",
                "url": "https://api.github.com/repos/ryanvade/enforce-active-pr-labeled-action/labels/bug",
                "name": "bug",
                "color": "d73a4a",
                "default": true,
                "description": "Something isn't working"
            }];
            expect(isValidPullRequest(draft, labels)).toBe(true);
        });

        it("returns false if the pull request is not a draft and does not have labels", () => {
            const draft = false;
            const labels:any[] = [];

            expect(isValidPullRequest(draft, labels)).toBe(false);
        });
    });
});