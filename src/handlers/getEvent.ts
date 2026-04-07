import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getEvent, getNotificationsByEventId } from "../db/eventRepository";
import { errorResponse } from "../utils/response";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const eventId = event.pathParameters?.event_id;

  if (!eventId) return errorResponse(400, "event_id is required");

  const eventRecord = await getEvent(eventId);

  if (!eventRecord) return errorResponse(404, "Event not found");

  const notifications = await getNotificationsByEventId(eventId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...eventRecord,
      notifications,
    }),
  };
};
