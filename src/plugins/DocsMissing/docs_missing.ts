import { PRContext } from "../../types";
import { Application } from "probot";
import { REPO_HOME_ASSISTANT } from "../../const";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

const NAME = "DocsMissing";

export const initDocsMissing = (app: Application) => {
  app.on(
    "pull_request.labeled",
    filterEventByRepo(NAME, REPO_HOME_ASSISTANT, runDocsMissing)
  );
};

export const runDocsMissing = async (context: PRContext) => {
  const pr = context.payload.pull_request;

  const hasDocsMissingLabel = (pr.labels as WebhookPayloadIssuesIssue["labels"])
    .map((label) => label.name)
    .includes("docs-missing");

  await context.github.repos.createStatus(
    context.repo({
      sha: pr.head.sha,
      context: "docs-missing",
      state: hasDocsMissingLabel ? "failure" : "success",
      description: hasDocsMissingLabel
        ? `Please open a documentation PR.`
        : `Documentation ok.`,
    })
  );
};
