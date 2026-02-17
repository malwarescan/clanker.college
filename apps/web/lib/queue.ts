import { Queue } from "bullmq";

export const gradeQueue = process.env.REDIS_URL
  ? new Queue("grade", { connection: { url: process.env.REDIS_URL } })
  : null;

export async function enqueueGrade(submissionId: string) {
  if (!gradeQueue) throw new Error("Redis not configured");
  await gradeQueue.add(
    "grade_submission",
    { submissionId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    }
  );
}
