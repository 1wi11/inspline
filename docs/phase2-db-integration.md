# Phase 2: DynamoDB 연동 + 조회 API

## 목표

DynamoDB 테이블 2개(Events, Notifications)를 추가하고, 이벤트 저장/조회 API를 완성한다.

## 작업 항목

### 2-1. DynamoDB 테이블 설계

**Events 테이블** — 이벤트 기본 정보

- PK: `event_id` (String)
- GSI: `clinic_id-status-index` (clinic_id + status)
- 항목 스키마:

  ```json
  {
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "clinic_id": "clinic-001",
    "patient_id": "patient-001",
    "channels": ["email", "sms"],
    "status": "pending",
    "created_at": "2026-04-07T12:00:00Z"
  }
  ```

**Notifications 테이블** — 채널별 발송 기록

- PK: `event_id` (String), SK: `channel` (String)
- 항목 스키마:

  ```json
  {
    "event_id": "evt-xxxxx",
    "channel": "email",
    "provider": "mock-email",
    "status": "pending",
    "sent_at": null,
    "created_at": "2026-04-07T12:00:00Z"
  }
  ```

### 2-2. POST /events에 DB 저장 추가

- Events 테이블에 이벤트 기본 정보 저장 (status: "pending")
- Notifications 테이블에 채널 수만큼 개별 레코드 저장 (status: "pending")
  - 예: channels가 \["email", "sms"\]이면 → 2건 저장
- 환경변수 `EVENTS_TABLE_NAME`, `NOTIFICATIONS_TABLE_NAME`으로 테이블명 주입

### 2-3. GET /events/:event_id 구현

- 새 Lambda 함수 작성
- Events 테이블에서 이벤트 기본 정보 조회
- Notifications 테이블에서 event_id로 query → 채널별 발송 상태 조회
- 두 결과를 합쳐서 응답:

  ```json
  {
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "clinic_id": "clinic-001",
    "patient_id": "patient-001",
    "channels": ["email", "sms"],
    "status": "pending",
    "notifications": [
      { "channel": "email", "provider": "mock-email", "status": "pending", "sent_at": null },
      { "channel": "sms", "provider": "mock-sms", "status": "pending", "sent_at": null }
    ],
    "created_at": "2026-04-07T12:00:00Z"
  }
  ```
- 존재하지 않는 event_id → 404 응답

### 2-4. GET /events 필터링 조회 구현

- 쿼리 파라미터: `clinic_id` (필수), `status` (선택)
- Events 테이블의 GSI(`clinic_id-status-index`)를 활용한 조회
- `status` 없으면 clinic_id에 해당하는 전체 이벤트 반환
- 결과가 없으면 빈 배열 반환

### 2-5. 로컬 테스트

- DynamoDB Local (Docker)과 연동하여 테스트
- `sam local start-api`로 이벤트 생성 → 조회 흐름 검증
- Jest 테스트 추가

## 완료 기준

- [ ] template.yaml에 Events 테이블 + GSI 정의

- [ ] template.yaml에 Notifications 테이블 (PK: event_id, SK: channel) 정의

- [ ] `POST /events` → Events 1건 + Notifications N건 저장

- [ ] `GET /events/:event_id` → 이벤트 + 채널별 발송 상태 조회

- [ ] `GET /events?clinic_id=xxx` → 필터링 조회

- [ ] `GET /events?clinic_id=xxx&status=pending` → 상태 필터링

- [ ] 존재하지 않는 리소스 → 404 응답

- [ ] 로컬에서 전체 흐름 테스트 통과