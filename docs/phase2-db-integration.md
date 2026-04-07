# Phase 2: DynamoDB 연동 + 조회 API

## 목표

DynamoDB 테이블을 추가하고, 이벤트를 저장/조회하는 API를 완성한다.

## 작업 항목

### 2-1. DynamoDB 테이블 설계

- template.yaml에 DynamoDB 리소스 정의
- 테이블 설계:
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
    "notifications": [
      {
        "channel": "email",
        "provider": "mock-email",
        "status": "pending",
        "sent_at": null
      }
    ],
    "created_at": "2026-04-07T12:00:00Z"
  }
  ```

### 2-2. POST /events에 DB 저장 추가

- 이벤트 수신 시 DynamoDB에 저장
- 각 channel별로 `notifications` 배열에 `pending` 상태로 기록
- 환경변수 `TABLE_NAME`으로 테이블명 주입

### 2-3. GET /events/:event_id 구현

- 새 Lambda 함수 작성
- DynamoDB에서 event_id로 조회
- 해당 이벤트의 채널별 발송 상태 반환
- 존재하지 않는 event_id → 404 응답

### 2-4. GET /events 필터링 조회 구현

- 쿼리 파라미터: `clinic_id`, `status` (optional)
- GSI를 활용한 조회
- `clinic_id` 필수, `status`는 선택적 필터
- 결과가 없으면 빈 배열 반환

### 2-5. 로컬 테스트

- `sam local start-api`로 DynamoDB Local 또는 Docker 기반 DynamoDB와 연동 테스트
- 이벤트 생성 → 조회 흐름 검증

## 완료 기준

- [ ] template.yaml에 DynamoDB 테이블 + GSI 정의
- [ ] `POST /events` → DB에 이벤트 저장
- [ ] `GET /events/:event_id` → 이벤트 상세 조회
- [ ] `GET /events?clinic_id=xxx` → 필터링 조회
- [ ] `GET /events?clinic_id=xxx&status=failed` → 상태 필터링
- [ ] 존재하지 않는 리소스 → 404 응답
- [ ] 로컬에서 전체 흐름 테스트 통과
