export const VALID_EVENT_TYPES = [
  'appointment_confirmed',
  'insurance_approved',
  'claim_completed',
] as const;

export const VALID_CHANNELS = ['email', 'sms', 'webhook'] as const;

export type EventType = (typeof VALID_EVENT_TYPES)[number];
export type Channel = (typeof VALID_CHANNELS)[number];

export interface EventRequest {
  event_type: EventType;
  clinic_id: string;
  patient_id: string;
  channels: Channel[];
}

export interface EventRecord {
  event_id: string;
  event_type: EventType;
  clinic_id: string;
  patient_id: string;
  channels: Channel[];
  status: string;
  created_at: string;
}

export interface NotificationRecord {
  event_id: string;
  channel: Channel;
  provider: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}
