import { NotificationProvider } from "./types";
import { MockEmailProvider } from "./mockEmailProvider";
import { MockSmsProvider } from "./mockSmsProvider";
import { MockWebhookProvider } from "./mockWebhookProvider";

const PROVIDER_MAP: Record<string, Record<string, () => NotificationProvider>> = {
  email: {
    mock: () => new MockEmailProvider(),
  },
  sms: {
    mock: () => new MockSmsProvider(),
  },
  webhook: {
    mock: () => new MockWebhookProvider(process.env.WEBHOOK_URL ?? ""),
  },
};

export function getProvider(channel: string): NotificationProvider {
  const envKey = `NOTIFICATION_${channel.toUpperCase()}_PROVIDER`;
  const providerName = process.env[envKey] ?? "mock";
  const channelProviders = PROVIDER_MAP[channel];

  if (!channelProviders) {
    throw new Error(`Unknown channel: ${channel}`);
  }

  const factory = channelProviders[providerName];
  if (!factory) {
    throw new Error(`Unknown provider "${providerName}" for channel "${channel}"`);
  }

  return factory();
}
