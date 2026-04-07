import { Channel } from "../types/event";
import { getQueue } from "./queueFactory";

export async function publishNotificationMessages(
  eventId: string,
  eventType: string,
  channels: Channel[],
): Promise<void> {
  const queue = getQueue();
  const promises = channels.map((channel) =>
    queue.publish({
      event_id: eventId,
      event_type: eventType,
      channel,
    }),
  );
  await Promise.all(promises);
}
