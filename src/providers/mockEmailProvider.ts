import { NotificationProvider, NotificationParams, NotificationResult } from "./types";

export class MockEmailProvider implements NotificationProvider {
  async send(params: NotificationParams): Promise<NotificationResult> {
    return {
      success: true,
      provider: "mock-email",
      sent_at: new Date().toISOString(),
    };
  }
}
