import { NotificationProvider, NotificationParams, NotificationResult } from "./types";

export class MockWebhookProviderV2 implements NotificationProvider {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(params: NotificationParams): Promise<NotificationResult> {
    return {
      success: true,
      provider: `mock-webhook-v2(${this.webhookUrl})`,
      sent_at: new Date().toISOString(),
    };
  }
}
