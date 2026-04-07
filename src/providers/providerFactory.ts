import { NotificationProvider } from "./types";
import { MockEmailProvider } from "./mockEmailProvider";
import { MockEmailProviderV2 } from "./mockEmailProviderV2";
import { MockSmsProvider } from "./mockSmsProvider";
import { MockSmsProviderV2 } from "./mockSmsProviderV2";
import { MockWebhookProvider } from "./mockWebhookProvider";


const PROVIDER_MAP: Record<
  string,
  Record<string, () => NotificationProvider>
> = {
  email: {
    mock: () => new MockEmailProvider(),
    mock2: () => new MockEmailProviderV2(),
  },
  sms: {
    mock: () => new MockSmsProvider(),
    mock2: () => new MockSmsProviderV2(),
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
    throw new Error(
      `Unknown provider "${providerName}" for channel "${channel}"`,
    );
  }

  return factory();
}
