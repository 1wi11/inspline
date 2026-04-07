import { handler } from '../../src/handlers/listEvents';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as eventRepository from '../../src/db/eventRepository';

jest.mock('../../src/db/eventRepository');

const mockedRepo = eventRepository as jest.Mocked<typeof eventRepository>;

function makeEvent(query: Record<string, string> | null): APIGatewayProxyEvent {
  return {
    body: null,
    httpMethod: 'GET',
    path: '/events',
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: query,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /events handler', () => {
  it('clinic_id로 이벤트 목록을 반환한다', async () => {
    mockedRepo.listEventsByClinic.mockResolvedValue([
      { event_id: 'evt-001', event_type: 'appointment_confirmed', clinic_id: 'clinic-001', patient_id: 'patient-001', channels: ['email'], status: 'pending', created_at: '2026-04-07T12:00:00Z' },
    ]);

    const result = await handler(makeEvent({ clinic_id: 'clinic-001' }));
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.events).toHaveLength(1);
    expect(body.events[0].clinic_id).toBe('clinic-001');
  });

  it('clinic_id + status로 필터링한다', async () => {
    mockedRepo.listEventsByClinic.mockResolvedValue([]);

    const result = await handler(makeEvent({ clinic_id: 'clinic-001', status: 'failed' }));
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.events).toEqual([]);
    expect(mockedRepo.listEventsByClinic).toHaveBeenCalledWith('clinic-001', 'failed');
  });

  it('clinic_id가 없으면 400을 반환한다', async () => {
    const result = await handler(makeEvent(null));
    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('clinic_id query parameter is required');
  });

  it('결과가 없으면 빈 배열을 반환한다', async () => {
    mockedRepo.listEventsByClinic.mockResolvedValue([]);

    const result = await handler(makeEvent({ clinic_id: 'clinic-999' }));
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.events).toEqual([]);
  });
});
