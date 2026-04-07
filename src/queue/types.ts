export interface EventMessage {
  event_id: string;
  event_type: string;
  channel: string;
}

export interface MessageQueue {
  publish(message: EventMessage): Promise<void>;
}
