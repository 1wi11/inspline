import { handler } from '../../src/handlers/postEvent';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as eventRepository from '../../src/db/eventRepository';

jest.mock('../../src/db/eventRepository');

const mockedRepo = eventRepository as jest.Mocked<typeof eventRepository>;

function makeEvent(body: unknown): APIGatewayProxyEvent {
  return {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    httpMethod: 'POST',
    path: '/events',
    headers: { 'Content-Type': 'application/json' },
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  };
}

const validBody = {
  event_type: 'appointment_confirmed',
  clinic_id: 'clinic-001',
  patient_id: 'patient-001',
  channels: ['email', 'sms'],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedRepo.saveEvent.mockResolvedValue();
  mockedRepo.saveNotifications.mockResolvedValue();
});

describe('POST /events handler', () => {
  it('정상 요청 시 201과 event_id를 반환한다', async () => {
    const result = await handler(makeEvent(validBody));
    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body.event_id).toMatch(/^evt-/);
    expect(body.status).toBe('queued');
  });

  it('정상 요청 시 Events 테이블에 저장한다', async () => {
    await handler(makeEvent(validBody));

    expect(mockedRepo.saveEvent).toHaveBeenCalledTimes(1);
    expect(mockedRepo.saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'appointment_confirmed',
        clinic_id: 'clinic-001',
        patient_id: 'patient-001',
        channels: ['email', 'sms'],
        status: 'pending',
      })
    );
  });

  it('정상 요청 시 Notifications 테이블에 채널별 저장한다', async () => {
    await handler(makeEvent(validBody));

    expect(mockedRepo.saveNotifications).toHaveBeenCalledTimes(1);
    expect(mockedRepo.saveNotifications).toHaveBeenCalledWith(
      expect.stringMatching(/^evt-/),
      ['email', 'sms'],
      expect.any(String)
    );
  });

  it('잘못된 JSON이면 400을 반환한다', async () => {
    const result = await handler(makeEvent('not json'));
    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('Invalid JSON');
  });

  it('body가 비어있으면 400을 반환한다', async () => {
    const event = makeEvent(validBody);
    event.body = null;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });

  it('필수 필드 누락 시 400을 반환한다', async () => {
    const { clinic_id, ...incomplete } = validBody;
    const result = await handler(makeEvent(incomplete));
    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error).toContain('clinic_id');
  });

  it('매 요청마다 다른 event_id를 생성한다', async () => {
    const result1 = await handler(makeEvent(validBody));
    const result2 = await handler(makeEvent(validBody));

    const id1 = JSON.parse(result1.body).event_id;
    const id2 = JSON.parse(result2.body).event_id;
    expect(id1).not.toBe(id2);
  });
});
