import { SNSEvent } from "aws-lambda";
import { log } from "../utils/logger";
import { validateProcessNotificationEnv } from "../utils/envValidator";
import { getProvider } from "../providers/providerFactory";
import {
  updateNotificationStatus,
  updateEventStatus,
  getNotificationsByEventId,
} from "../db/eventRepository";

interface NotificationMessage {
  event_id: string;
  event_type: string;
  channel: string;
}

validateProcessNotificationEnv();

export const handler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message: NotificationMessage = JSON.parse(record.Sns.Message);
    const { event_id, event_type, channel } = message;
    const startTime = Date.now();
    const provider = getProvider(channel);

    try {
      const result = await provider.send({ event_id, event_type, channel });

      await updateNotificationStatus(
        event_id,
        channel,
        "sent",
        result.provider,
        result.sent_at,
      );

      log({
        event_id,
        event_type,
        channel,
        provider: result.provider,
        status: "sent",
        message: "발송 완료",
        duration_ms: Date.now() - startTime,
      });
    } catch (error) {
      const providerName = `failed-${channel}`;

      await updateNotificationStatus(
        event_id,
        channel,
        "failed",
        providerName,
        null,
      );

      log({
        event_id,
        event_type,
        channel,
        provider: providerName,
        status: "failed",
        duration_ms: Date.now() - startTime,
        error: (error as Error).message,
      });
    }

    // 모든 채널 처리 완료 여부 확인 → Events 상태 갱신
    const notifications = await getNotificationsByEventId(event_id);
    const allDone = notifications.every((n) => n.status !== "pending");

    if (allDone) {
      const hasFailed = notifications.some((n) => n.status === "failed");
      const newStatus = hasFailed ? "partial_failure" : "completed";
      await updateEventStatus(event_id, newStatus);
    }
  }
};
