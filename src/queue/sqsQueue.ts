import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { MessageQueue, EventMessage } from "./types";

export class SqsQueue implements MessageQueue {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(queueUrl: string) {
    this.client = new SQSClient({});
    this.queueUrl = queueUrl;
  }

  async publish(message: EventMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );
  }
}
