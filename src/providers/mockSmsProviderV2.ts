import { NotificationProvider, NotificationParams, NotificationResult } from "./types";

export class MockSmsProviderV2 implements NotificationProvider {
  async send(params: NotificationParams): Promise<NotificationResult> {
    return {
      success: true,
      provider: "mock-sms-v2",
      sent_at: new Date().toISOString(),
    };
  }
}
