import { MessageQueue } from "./types";
import { SnsQueue } from "./snsQueue";
import { SqsQueue } from "./sqsQueue";

export function getQueue(): MessageQueue {
  const provider = process.env.MESSAGE_QUEUE_PROVIDER ?? "sns";

  switch (provider) {
    case "sns":
      return new SnsQueue(process.env.TOPIC_ARN!);
    case "sqs":
      return new SqsQueue(process.env.QUEUE_URL!);
    default:
      throw new Error(`Unknown message queue provider: ${provider}`);
  }
}
