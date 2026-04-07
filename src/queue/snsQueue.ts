import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { MessageQueue, EventMessage } from "./types";

export class SnsQueue implements MessageQueue {
  private readonly client: SNSClient;
  private readonly topicArn: string;

  constructor(topicArn: string) {
    this.client = new SNSClient({});
    this.topicArn = topicArn;
  }

  async publish(message: EventMessage): Promise<void> {
    await this.client.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
      }),
    );
  }
}
