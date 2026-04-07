import { NotificationProvider, NotificationParams, NotificationResult } from "./types";

export class MockWebhookProvider implements NotificationProvider {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(params: NotificationParams): Promise<NotificationResult> {
    return {
      success: true,
      provider: `mock-webhook(${this.webhookUrl})`,
      sent_at: new Date().toISOString(),
    };
  }
}
