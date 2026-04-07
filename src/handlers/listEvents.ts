import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { listEventsByClinic } from "../db/eventRepository";
import { errorResponse } from "../utils/response";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const clinicId = event.queryStringParameters?.clinic_id;

  if (!clinicId)
    return errorResponse(400, "clinic_id query parameter is required");

  const status = event.queryStringParameters?.status;
  const events = await listEventsByClinic(clinicId, status);

  return {
    statusCode: 200,
    body: JSON.stringify({ events }),
  };
};
