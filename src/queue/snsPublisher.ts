import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Channel } from '../types/event';

const snsClient = new SNSClient({});
const TOPIC_ARN = process.env.TOPIC_ARN!;

export async function publishNotificationMessages(
  eventId: string,
  eventType: string,
  channels: Channel[]
): Promise<void> {
  const promises = channels.map((channel) =>
    snsClient.send(
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Message: JSON.stringify({
          event_id: eventId,
          event_type: eventType,
          channel,
        }),
      })
    )
  );
  await Promise.all(promises);
}
