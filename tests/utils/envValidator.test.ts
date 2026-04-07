import { validateEnv, validatePostEventEnv, validateProcessNotificationEnv } from "../../src/utils/envValidator";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("validateEnv", () => {
  it("필수 환경변수가 모두 있으면 에러 없이 통과한다", () => {
    process.env.FOO = "bar";
    expect(() => validateEnv({ required: ["FOO"] })).not.toThrow();
  });

  it("필수 환경변수가 누락되면 에러를 던진다", () => {
    delete process.env.FOO;
    expect(() => validateEnv({ required: ["FOO"] })).toThrow(
      "Missing required environment variables: FOO",
    );
  });

  it("조건부 환경변수가 충족되면 통과한다", () => {
    process.env.QUEUE = "sns";
    process.env.TOPIC_ARN = "arn:aws:sns:test";
    expect(() =>
      validateEnv({
        required: [],
        conditional: [{ when: "QUEUE", equals: "sns", require: ["TOPIC_ARN"] }],
      }),
    ).not.toThrow();
  });

  it("조건부 환경변수가 누락되면 에러를 던진다", () => {
    process.env.QUEUE = "sns";
    delete process.env.TOPIC_ARN;
    expect(() =>
      validateEnv({
        required: [],
        conditional: [{ when: "QUEUE", equals: "sns", require: ["TOPIC_ARN"] }],
      }),
    ).toThrow("Missing required environment variables: TOPIC_ARN");
  });

  it("조건이 일치하지 않으면 조건부 변수를 검사하지 않는다", () => {
    process.env.QUEUE = "sqs";
    delete process.env.TOPIC_ARN;
    expect(() =>
      validateEnv({
        required: [],
        conditional: [{ when: "QUEUE", equals: "sns", require: ["TOPIC_ARN"] }],
      }),
    ).not.toThrow();
  });
});

describe("validatePostEventEnv", () => {
  it("필수 환경변수가 있으면 통과한다", () => {
    process.env.EVENTS_TABLE_NAME = "events";
    process.env.NOTIFICATIONS_TABLE_NAME = "notifications";
    process.env.MESSAGE_QUEUE_PROVIDER = "sns";
    process.env.TOPIC_ARN = "arn:aws:sns:test";
    expect(() => validatePostEventEnv()).not.toThrow();
  });

  it("SQS 선택 시 QUEUE_URL이 없으면 에러를 던진다", () => {
    process.env.EVENTS_TABLE_NAME = "events";
    process.env.NOTIFICATIONS_TABLE_NAME = "notifications";
    process.env.MESSAGE_QUEUE_PROVIDER = "sqs";
    delete process.env.QUEUE_URL;
    expect(() => validatePostEventEnv()).toThrow("QUEUE_URL");
  });
});

describe("validateProcessNotificationEnv", () => {
  it("필수 환경변수가 있으면 통과한다", () => {
    process.env.EVENTS_TABLE_NAME = "events";
    process.env.NOTIFICATIONS_TABLE_NAME = "notifications";
    process.env.NOTIFICATION_EMAIL_PROVIDER = "mock";
    process.env.NOTIFICATION_SMS_PROVIDER = "mock";
    process.env.NOTIFICATION_WEBHOOK_PROVIDER = "mock";
    process.env.WEBHOOK_URL = "https://example.com";
    expect(() => validateProcessNotificationEnv()).not.toThrow();
  });

  it("WEBHOOK_URL이 없으면 에러를 던진다", () => {
    process.env.EVENTS_TABLE_NAME = "events";
    process.env.NOTIFICATIONS_TABLE_NAME = "notifications";
    process.env.NOTIFICATION_EMAIL_PROVIDER = "mock";
    process.env.NOTIFICATION_SMS_PROVIDER = "mock";
    process.env.NOTIFICATION_WEBHOOK_PROVIDER = "mock";
    delete process.env.WEBHOOK_URL;
    expect(() => validateProcessNotificationEnv()).toThrow("WEBHOOK_URL");
  });
});
