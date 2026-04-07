export interface NotificationParams {
  event_id: string;
  event_type: string;
  channel: string;
}

export interface NotificationResult {
  success: boolean;
  provider: string;
  sent_at: string | null;
}

export interface NotificationProvider {
  send(params: NotificationParams): Promise<NotificationResult>;
}
