# Phase 3: 메시지 큐 + 소비 함수

## 목표

SNS 토픽을 추가하고, 이벤트 발행 → 큐 소비 → Mock 알림 발송 → DB 업데이트 파이프라인을 완성한다.

## 작업 항목

### 3-1. SNS 토픽 추가

- template.yaml에 SNS 토픽 리소스 정의
- 환경변수 `TOPIC_ARN`으로 토픽 ARN 주입

### 3-2. POST /events에서 SNS 발행

- 이벤트를 DB에 저장한 후 SNS 토픽으로 메시지 발행
- SNS 메시지 페이로드:
  ```json
  {
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "clinic_id": "clinic-001",
    "patient_id": "patient-001",
    "channels": ["email", "sms", "webhook"]
  }
  ```

### 3-3. 알림 소비 Lambda 작성

- SNS 트리거로 실행되는 별도 Lambda 함수
- 메시지 수신 → `channels` 배열 순회
- 각 채널별로:
  1. Mock 알림 발송 (로그에 `'발송완료'` 기록)
  2. DynamoDB의 해당 notification 상태를 `sent`로 업데이트
  3. `sent_at` 타임스탬프 기록
- 구조화 로그 출력:
  ```json
  {
    "timestamp": "2026-04-07T12:00:05Z",
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "channel": "email",
    "provider": "mock-email",
    "status": "sent",
    "duration_ms": 45
  }
  ```

### 3-4. 에러 처리

- 개별 채널 발송 실패 시 해당 채널만 `failed`로 기록
- 다른 채널은 정상 처리 계속
- 실패 시 에러 로그 출력

### 3-5. 로컬 테스트

- `sam local invoke`로 소비 Lambda 직접 호출 (SNS 이벤트 JSON 전달)
- POST → SNS → 소비 Lambda → DB 업데이트 전체 흐름은 AWS 배포 후 테스트

## 완료 기준

- [ ] template.yaml에 SNS 토픽 정의
- [ ] `POST /events` → SNS 메시지 발행
- [ ] 소비 Lambda가 SNS 트리거로 실행
- [ ] 각 채널별 Mock 발송 + `'발송완료'` 로그
- [ ] DB에 채널별 발송 상태(`sent`/`failed`) 업데이트
- [ ] 개별 채널 실패가 다른 채널에 영향 없음
- [ ] 구조화 JSON 로그 출력
