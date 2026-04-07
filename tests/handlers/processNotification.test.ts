import { handler } from '../../src/handlers/processNotification';
import { SNSEvent } from 'aws-lambda';
import * as eventRepository from '../../src/db/eventRepository';

jest.mock('../../src/db/eventRepository');

const mockedRepo = eventRepository as jest.Mocked<typeof eventRepository>;

function makeSNSEvent(message: Record<string, string>): SNSEvent {
  return {
    Records: [
      {
        EventSource: 'aws:sns',
        EventVersion: '1.0',
        EventSubscriptionArn: 'arn:aws:sns:ap-northeast-2:123456789:test',
        Sns: {
          Type: 'Notification',
          MessageId: 'test-id',
          TopicArn: 'arn:aws:sns:ap-northeast-2:123456789:test',
          Subject: undefined,
          Message: JSON.stringify(message),
          Timestamp: '2026-04-07T12:00:00Z',
          SignatureVersion: '1',
          Signature: '',
          SigningCertUrl: '',
          UnsubscribeUrl: '',
          MessageAttributes: {},
        },
      },
    ],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedRepo.updateNotificationStatus.mockResolvedValue();
  mockedRepo.updateEventStatus.mockResolvedValue();
});

describe('processNotification handler', () => {
  it('알림 발송 성공 시 Notification을 sent로 업데이트한다', async () => {
    mockedRepo.getNotificationsByEventId.mockResolvedValue([
      { event_id: 'evt-001', channel: 'email', provider: 'mock-email', status: 'sent', sent_at: '2026-04-07T12:00:00Z', created_at: '2026-04-07T12:00:00Z' },
    ]);

    await handler(makeSNSEvent({
      event_id: 'evt-001',
      event_type: 'appointment_confirmed',
      channel: 'email',
    }));

    expect(mockedRepo.updateNotificationStatus).toHaveBeenCalledWith(
      'evt-001',
      'email',
      'sent',
      'mock-email',
      expect.any(String)
    );
  });

  it('모든 채널이 sent이면 Events를 sent로 업데이트한다', async () => {
    mockedRepo.getNotificationsByEventId.mockResolvedValue([
      { event_id: 'evt-001', channel: 'email', provider: 'mock-email', status: 'sent', sent_at: '2026-04-07T12:00:00Z', created_at: '2026-04-07T12:00:00Z' },
      { event_id: 'evt-001', channel: 'sms', provider: 'mock-sms', status: 'sent', sent_at: '2026-04-07T12:00:00Z', created_at: '2026-04-07T12:00:00Z' },
    ]);

    await handler(makeSNSEvent({
      event_id: 'evt-001',
      event_type: 'appointment_confirmed',
      channel: 'email',
    }));

    expect(mockedRepo.updateEventStatus).toHaveBeenCalledWith('evt-001', 'completed');
  });

  it('하나라도 failed면 Events를 partial_failure로 업데이트한다', async () => {
    mockedRepo.getNotificationsByEventId.mockResolvedValue([
      { event_id: 'evt-001', channel: 'email', provider: 'mock-email', status: 'sent', sent_at: '2026-04-07T12:00:00Z', created_at: '2026-04-07T12:00:00Z' },
      { event_id: 'evt-001', channel: 'sms', provider: 'mock-sms', status: 'failed', sent_at: null, created_at: '2026-04-07T12:00:00Z' },
    ]);

    await handler(makeSNSEvent({
      event_id: 'evt-001',
      event_type: 'appointment_confirmed',
      channel: 'email',
    }));

    expect(mockedRepo.updateEventStatus).toHaveBeenCalledWith('evt-001', 'partial_failure');
  });

  it('아직 pending이 남아있으면 Events 상태를 변경하지 않는다', async () => {
    mockedRepo.getNotificationsByEventId.mockResolvedValue([
      { event_id: 'evt-001', channel: 'email', provider: 'mock-email', status: 'sent', sent_at: '2026-04-07T12:00:00Z', created_at: '2026-04-07T12:00:00Z' },
      { event_id: 'evt-001', channel: 'sms', provider: '', status: 'pending', sent_at: null, created_at: '2026-04-07T12:00:00Z' },
    ]);

    await handler(makeSNSEvent({
      event_id: 'evt-001',
      event_type: 'appointment_confirmed',
      channel: 'email',
    }));

    expect(mockedRepo.updateEventStatus).not.toHaveBeenCalled();
  });
});
