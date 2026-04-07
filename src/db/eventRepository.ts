import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from './client';
import { EventRecord, NotificationRecord, Channel } from '../types/event';

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME!;
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE_NAME!;

export async function saveEvent(event: EventRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: EVENTS_TABLE,
      Item: event,
    })
  );
}

export async function saveNotification(notification: NotificationRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: NOTIFICATIONS_TABLE,
      Item: notification,
    })
  );
}

export async function saveNotifications(
  eventId: string,
  channels: Channel[],
  createdAt: string
): Promise<void> {
  const promises = channels.map((channel) =>
    saveNotification({
      event_id: eventId,
      channel,
      provider: '',
      status: 'pending',
      sent_at: null,
      created_at: createdAt,
    })
  );
  await Promise.all(promises);
}

export async function getEvent(eventId: string): Promise<EventRecord | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: EVENTS_TABLE,
      Key: { event_id: eventId },
    })
  );
  return (result.Item as EventRecord) ?? null;
}

export async function getNotificationsByEventId(
  eventId: string
): Promise<NotificationRecord[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: NOTIFICATIONS_TABLE,
      KeyConditionExpression: 'event_id = :eid',
      ExpressionAttributeValues: { ':eid': eventId },
    })
  );
  return (result.Items as NotificationRecord[]) ?? [];
}

export async function listEventsByClinic(
  clinicId: string,
  status?: string
): Promise<EventRecord[]> {
  const params: {
    TableName: string;
    IndexName: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, string>;
  } = {
    TableName: EVENTS_TABLE,
    IndexName: 'clinic_id-status-index',
    KeyConditionExpression: 'clinic_id = :cid',
    ExpressionAttributeValues: { ':cid': clinicId },
  };

  if (status) {
    params.KeyConditionExpression += ' AND #s = :s';
    (params as Record<string, unknown>).ExpressionAttributeNames = { '#s': 'status' };
    params.ExpressionAttributeValues[':s'] = status;
  }

  const result = await docClient.send(new QueryCommand(params));
  return (result.Items as EventRecord[]) ?? [];
}
