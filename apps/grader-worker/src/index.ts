import { Worker } from "bullmq";
import { PrismaClient } from "@clanker/db";
import { gradeSubmission } from "./processors/grade.js";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("REDIS_URL required");
  process.exit(1);
}

const prisma = new PrismaClient();

const worker = new Worker(
  "grade",
  async (job) => {
    if (job.name === "grade_submission" && job.data?.submissionId) {
      await gradeSubmission(job.data.submissionId);
    }
  },
  {
    connection: { url: redisUrl },
    concurrency: 1,
  }
);

worker.on("completed", (job) => console.log("Job completed", job.id));
worker.on("failed", async (job, err) => {
  console.error("Job failed", job?.id, err);
  const submissionId = job?.data?.submissionId;
  if (submissionId && job?.attemptsMade >= (job?.opts?.attempts ?? 3)) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "failed" },
    }).catch(() => {});
  }
});

const HEARTBEAT_MINUTES = 5;
setInterval(() => {
  console.log("heartbeat", new Date().toISOString());
}, HEARTBEAT_MINUTES * 60 * 1000);

console.log("Grader worker running");
process.on("SIGTERM", () => worker.close());
process.on("SIGINT", () => worker.close());
