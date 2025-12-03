import { Probot, Context } from "probot";

export default (app: Probot) => {
  // Handle new issues
  app.on("issues.opened", async (context: Context<"issues.opened">) => {
    const issue = context.payload.issue;
    if (!issue) return;

    await context.octokit.issues.createComment(
      context.issue({ body: "Hello from LexiSign Bot! 👋" })
    );

    context.log.info(`Commented on issue #${issue.number}`);
  });

  // Handle new PRs
  app.on("pull_request.opened", async (context: Context<"pull_request.opened">) => {
    const pr = context.payload.pull_request;
    if (!pr) return;

    await context.octokit.issues.createComment(
      context.pullRequest({ body: "Thanks for submitting a PR! LexiSign Bot will review it soon." })
    );

    context.log.info(`Commented on PR #${pr.number}`);
  });
};
