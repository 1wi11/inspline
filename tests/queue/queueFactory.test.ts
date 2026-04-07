import { getQueue } from "../../src/queue/queueFactory";
import { SnsQueue } from "../../src/queue/snsQueue";
import { SqsQueue } from "../../src/queue/sqsQueue";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("getQueue", () => {
  it("sns 선택 시 SnsQueue를 반환한다", () => {
    process.env.MESSAGE_QUEUE_PROVIDER = "sns";
    process.env.TOPIC_ARN = "arn:aws:sns:test";
    const queue = getQueue();
    expect(queue).toBeInstanceOf(SnsQueue);
  });

  it("sqs 선택 시 SqsQueue를 반환한다", () => {
    process.env.MESSAGE_QUEUE_PROVIDER = "sqs";
    process.env.QUEUE_URL = "https://sqs.test";
    const queue = getQueue();
    expect(queue).toBeInstanceOf(SqsQueue);
  });

  it("환경변수가 없으면 기본값 sns를 사용한다", () => {
    delete process.env.MESSAGE_QUEUE_PROVIDER;
    process.env.TOPIC_ARN = "arn:aws:sns:test";
    const queue = getQueue();
    expect(queue).toBeInstanceOf(SnsQueue);
  });

  it("알 수 없는 큐 프로바이더면 에러를 던진다", () => {
    process.env.MESSAGE_QUEUE_PROVIDER = "kafka";
    expect(() => getQueue()).toThrow("Unknown message queue provider: kafka");
  });
});
