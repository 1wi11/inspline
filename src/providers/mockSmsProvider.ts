import { NotificationProvider, NotificationParams, NotificationResult } from "./types";

export class MockSmsProvider implements NotificationProvider {
  async send(params: NotificationParams): Promise<NotificationResult> {
    return {
      success: true,
      provider: "mock-sms",
      sent_at: new Date().toISOString(),
    };
  }
}
