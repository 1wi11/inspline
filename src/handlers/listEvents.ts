import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { listEventsByClinic } from '../db/eventRepository';
import { log } from '../utils/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const clinicId = event.queryStringParameters?.clinic_id;

  if (!clinicId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'clinic_id query parameter is required' }),
    };
  }

  const status = event.queryStringParameters?.status;
  const events = await listEventsByClinic(clinicId, status);

  log({
    event_id: '',
    event_type: '',
    channel: '',
    provider: '',
    status: 'listed',
    duration_ms: 0,
    query: { clinic_id: clinicId, status: status ?? null },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ events }),
  };
};
