import {
  EventRequest,
  EventType,
  Channel,
  VALID_EVENT_TYPES,
  VALID_CHANNELS,
} from '../types/event';

type ValidationResult =
  | { valid: true; data: EventRequest }
  | { valid: false; error: string };

export function validateEventRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const req = body as Record<string, unknown>;

  if (!req.event_type || !VALID_EVENT_TYPES.includes(req.event_type as EventType)) {
    return { valid: false, error: `event_type must be one of: ${VALID_EVENT_TYPES.join(', ')}` };
  }

  if (!req.clinic_id || typeof req.clinic_id !== 'string') {
    return { valid: false, error: 'clinic_id is required' };
  }

  if (!req.patient_id || typeof req.patient_id !== 'string') {
    return { valid: false, error: 'patient_id is required' };
  }

  if (!Array.isArray(req.channels) || req.channels.length === 0) {
    return { valid: false, error: 'channels must be a non-empty array' };
  }

  const invalidChannels = req.channels.filter(
    (ch: unknown) => !VALID_CHANNELS.includes(ch as Channel)
  );
  if (invalidChannels.length > 0) {
    return {
      valid: false,
      error: `Invalid channels: ${invalidChannels.join(', ')}. Must be one of: ${VALID_CHANNELS.join(', ')}`,
    };
  }

  return { valid: true, data: body as EventRequest };
}
