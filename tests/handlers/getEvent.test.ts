import { handler } from '../../src/handlers/getEvent';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as eventRepository from '../../src/db/eventRepository';

jest.mock('../../src/db/eventRepository');

const mockedRepo = eventRepository as jest.Mocked<typeof eventRepository>;

function makeEvent(eventId: string | null): APIGatewayProxyEvent {
  return {
    body: null,
    httpMethod: 'GET',
    path: `/events/${eventId}`,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: eventId ? { event_id: eventId } : null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /events/:event_id handler', () => {
  it('존재하는 이벤트 조회 시 200과 notifications를 반환한다', async () => {
    mockedRepo.getEvent.mockResolvedValue({
      event_id: 'evt-001',
      event_type: 'appointment_confirmed',
      clinic_id: 'clinic-001',
      patient_id: 'patient-001',
      channels: ['email', 'sms'],
      status: 'pending',
      created_at: '2026-04-07T12:00:00Z',
    });
    mockedRepo.getNotificationsByEventId.mockResolvedValue([
      { event_id: 'evt-001', channel: 'email', provider: '', status: 'pending', sent_at: null, created_at: '2026-04-07T12:00:00Z' },
      { event_id: 'evt-001', channel: 'sms', provider: '', status: 'pending', sent_at: null, created_at: '2026-04-07T12:00:00Z' },
    ]);

    const result = await handler(makeEvent('evt-001'));
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.event_id).toBe('evt-001');
    expect(body.notifications).toHaveLength(2);
  });

  it('존재하지 않는 이벤트 조회 시 404를 반환한다', async () => {
    mockedRepo.getEvent.mockResolvedValue(null);

    const result = await handler(makeEvent('evt-nonexistent'));
    expect(result.statusCode).toBe(404);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('Event not found');
  });

  it('event_id가 없으면 400을 반환한다', async () => {
    const result = await handler(makeEvent(null));
    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('event_id is required');
  });
});
