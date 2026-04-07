import { NotificationProvider, NotificationParams, NotificationResult } from "./types";

export class MockEmailProviderV2 implements NotificationProvider {
  async send(params: NotificationParams): Promise<NotificationResult> {
    return {
      success: true,
      provider: "mock-email-v2",
      sent_at: new Date().toISOString(),
    };
  }
}
