import { getProvider } from "../../src/providers/providerFactory";
import { MockEmailProvider } from "../../src/providers/mockEmailProvider";
import { MockSmsProvider } from "../../src/providers/mockSmsProvider";
import { MockWebhookProvider } from "../../src/providers/mockWebhookProvider";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("getProvider", () => {
  it("email 채널에 mock 프로바이더를 반환한다", () => {
    process.env.NOTIFICATION_EMAIL_PROVIDER = "mock";
    const provider = getProvider("email");
    expect(provider).toBeInstanceOf(MockEmailProvider);
  });

  it("sms 채널에 mock 프로바이더를 반환한다", () => {
    process.env.NOTIFICATION_SMS_PROVIDER = "mock";
    const provider = getProvider("sms");
    expect(provider).toBeInstanceOf(MockSmsProvider);
  });

  it("webhook 채널에 mock 프로바이더를 반환한다", () => {
    process.env.NOTIFICATION_WEBHOOK_PROVIDER = "mock";
    process.env.WEBHOOK_URL = "https://example.com";
    const provider = getProvider("webhook");
    expect(provider).toBeInstanceOf(MockWebhookProvider);
  });

  it("환경변수가 없으면 기본값 mock을 사용한다", () => {
    delete process.env.NOTIFICATION_EMAIL_PROVIDER;
    const provider = getProvider("email");
    expect(provider).toBeInstanceOf(MockEmailProvider);
  });

  it("알 수 없는 채널이면 에러를 던진다", () => {
    expect(() => getProvider("fax")).toThrow("Unknown channel: fax");
  });

  it("알 수 없는 프로바이더면 에러를 던진다", () => {
    process.env.NOTIFICATION_EMAIL_PROVIDER = "ses";
    expect(() => getProvider("email")).toThrow(
      'Unknown provider "ses" for channel "email"',
    );
  });
});
