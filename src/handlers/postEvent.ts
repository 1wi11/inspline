import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { validateEventRequest } from '../validators/eventValidator';
import { log } from '../utils/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? '');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const validation = validateEventRequest(body);
  if (!validation.valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: validation.error }),
    };
  }

  const { data } = validation;
  const eventId = `evt-${randomUUID()}`;

  log({
    event_id: eventId,
    event_type: data.event_type,
    channel: '',
    provider: '',
    status: 'received',
    duration_ms: 0,
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      event_id: eventId,
      status: 'queued',
    }),
  };
};
