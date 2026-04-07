import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";
import { validateEventRequest } from "../validators/eventValidator";
import { log } from "../utils/logger";
import { errorResponse, response } from "../utils/response";
import { validatePostEventEnv } from "../utils/envValidator";
import { saveEvent, saveNotifications } from "../db/eventRepository";
import { publishNotificationMessages } from "../queue/messagePublisher";

validatePostEventEnv();

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "");
  } catch {
    return errorResponse(400, "Invalid JSON");
  }

  const validation = validateEventRequest(body);
  if (!validation.valid) return errorResponse(400, validation.error);

  const { data } = validation;
  const eventId = `evt-${randomUUID()}`;
  const createdAt = new Date().toISOString();
  const eventRecord = {
    event_id: eventId,
    event_type: data.event_type,
    clinic_id: data.clinic_id,
    patient_id: data.patient_id,
    channels: data.channels,
    status: "pending" as const,
    created_at: createdAt,
  };

  log(eventRecord);
  // Event 저장
  await saveEvent(eventRecord);
  // 채널별 알림 레코드 저장 (상태 추적용)
  await saveNotifications(eventId, data.channels, createdAt);
  // 메시지 큐로 발행
  await publishNotificationMessages(eventId, data.event_type, data.channels);

  return response(201, {
    event_id: eventId,
    status: "queued",
  });
};
