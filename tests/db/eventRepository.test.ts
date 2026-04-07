import {
  saveEvent,
  saveNotification,
  saveNotifications,
  getEvent,
  getNotificationsByEventId,
  updateNotificationStatus,
  updateEventStatus,
  listEventsByClinic,
} from "../../src/db/eventRepository";
import { docClient } from "../../src/db/client";

jest.mock("../../src/db/client", () => ({
  docClient: { send: jest.fn() },
}));

const mockedSend = docClient.send as jest.Mock;

beforeEach(() => {
  mockedSend.mockReset();
});

describe("saveEvent", () => {
  it("PutCommand로 이벤트를 저장한다", async () => {
    mockedSend.mockResolvedValue({});
    const event = {
      event_id: "evt-1",
      event_type: "appointment_confirmed" as const,
      clinic_id: "c1",
      patient_id: "p1",
      channels: ["email" as const],
      status: "pending",
      created_at: "2026-04-07T00:00:00Z",
    };
    await saveEvent(event);
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });
});

describe("saveNotifications", () => {
  it("채널 수만큼 saveNotification을 호출한다", async () => {
    mockedSend.mockResolvedValue({});
    await saveNotifications("evt-1", ["email", "sms"], "2026-04-07T00:00:00Z");
    expect(mockedSend).toHaveBeenCalledTimes(2);
  });
});

describe("getEvent", () => {
  it("이벤트가 있으면 반환한다", async () => {
    const item = { event_id: "evt-1", status: "pending" };
    mockedSend.mockResolvedValue({ Item: item });
    const result = await getEvent("evt-1");
    expect(result).toEqual(item);
  });

  it("이벤트가 없으면 null을 반환한다", async () => {
    mockedSend.mockResolvedValue({});
    const result = await getEvent("evt-none");
    expect(result).toBeNull();
  });
});

describe("getNotificationsByEventId", () => {
  it("알림 목록을 반환한다", async () => {
    const items = [{ event_id: "evt-1", channel: "email", status: "sent" }];
    mockedSend.mockResolvedValue({ Items: items });
    const result = await getNotificationsByEventId("evt-1");
    expect(result).toEqual(items);
  });

  it("결과가 없으면 빈 배열을 반환한다", async () => {
    mockedSend.mockResolvedValue({});
    const result = await getNotificationsByEventId("evt-none");
    expect(result).toEqual([]);
  });
});

describe("updateNotificationStatus", () => {
  it("UpdateCommand를 호출한다", async () => {
    mockedSend.mockResolvedValue({});
    await updateNotificationStatus("evt-1", "email", "sent", "mock-email", "2026-04-07T00:00:00Z");
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });
});

describe("updateEventStatus", () => {
  it("UpdateCommand를 호출한다", async () => {
    mockedSend.mockResolvedValue({});
    await updateEventStatus("evt-1", "completed");
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });
});

describe("listEventsByClinic", () => {
  it("status 없이 clinic_id로 조회한다", async () => {
    const items = [{ event_id: "evt-1" }];
    mockedSend.mockResolvedValue({ Items: items });
    const result = await listEventsByClinic("c1");
    expect(result).toEqual(items);
  });

  it("status 필터를 포함하여 조회한다", async () => {
    const items = [{ event_id: "evt-1", status: "completed" }];
    mockedSend.mockResolvedValue({ Items: items });
    const result = await listEventsByClinic("c1", "completed");
    expect(result).toEqual(items);
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });
});
