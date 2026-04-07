import { SNSEvent } from "aws-lambda";
import { log } from "../utils/logger";
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

function getProviderName(channel: string): string {
  return `mock-${channel}`;
}

export const handler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message: NotificationMessage = JSON.parse(record.Sns.Message);
    const { event_id, event_type, channel } = message;
    const provider = getProviderName(channel);
    const startTime = Date.now();

    try {
      // Notification 상태 업데이트
      await updateNotificationStatus(
        event_id,
        channel,
        "sent",
        provider,
        new Date().toISOString(),
      );

      // Mock 알림 발송
      log({
        event_id,
        event_type,
        channel,
        provider,
        status: "sent",
        message: "발송 완료",
        duration_ms: Date.now() - startTime,
      });
    } catch (error) {
      await updateNotificationStatus(
        event_id,
        channel,
        "failed",
        provider,
        null,
      );

      log({
        event_id,
        event_type,
        channel,
        provider,
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
