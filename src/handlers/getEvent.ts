import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getEvent, getNotificationsByEventId } from "../db/eventRepository";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const eventId = event.pathParameters?.event_id;

  if (!eventId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "event_id is required" }),
    };
  }

  const eventRecord = await getEvent(eventId);

  if (!eventRecord) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event not found" }),
    };
  }

  const notifications = await getNotificationsByEventId(eventId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...eventRecord,
      notifications,
    }),
  };
};
