# Phase 3: 메시지 큐 + 소비 함수

## 목표

SNS 토픽을 추가하고, 채널별 개별 메시지 발행 → 소비 Lambda → Mock 알림 발송 → Notifications 상태 업데이트 파이프라인을 완성한다.

## 전체 흐름

```
POST /events (channels: ["email", "sms", "webhook"])
    │
    ├── Events 테이블에 저장 (status: "pending")
    ├── Notifications 테이블에 3건 저장 (각각 status: "pending")
    │
    ├── 큐에 메시지 3개 개별 발행
    │   ├── { event_id, channel: "email" }
    │   ├── { event_id, channel: "sms" }
    │   └── { event_id, channel: "webhook" }
    │
    └── 소비 Lambda가 메시지 1개씩 처리
        ├── Mock 알림 발송 + '발송완료' 로그
        ├── Notifications 테이블 해당 레코드 status 업데이트 ("sent" / "failed")
        └── 모든 채널 완료 시 Events 테이블 status 업데이트
```

## 작업 항목

### 3-1. SNS 토픽 추가

- template.yaml에 SNS 토픽 리소스 정의
- 환경변수 `TOPIC_ARN`으로 토픽 ARN 주입

### 3-2. POST /events에서 채널별 SNS 발행

- DB 저장 후 채널 수만큼 개별 SNS 메시지 발행
- 메시지 페이로드 (채널당 1개):
  ```json
  {
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "channel": "email"
  }
  ```
- 3개 채널이면 SNS publish 3회

### 3-3. 알림 소비 Lambda 작성

- SNS 트리거로 실행되는 별도 Lambda 함수
- 메시지 1개 = 채널 1개 처리
- 처리 흐름:
  1. 메시지에서 event_id, channel 추출
  2. Mock 알림 발송 (로그에 `'발송완료'` 기록)
  3. Notifications 테이블에서 해당 레코드 status를 `sent`로 업데이트, `sent_at` 기록
  4. 해당 event_id의 모든 Notification 조회 → 전부 완료되었으면 Events 테이블 status 업데이트
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

### 3-4. Events 상태 갱신 로직

- 해당 event_id의 모든 Notification 조회
- 전부 `sent` → Events status를 `sent`로
- 하나라도 `failed` → Events status를 `partial_failure`로
- 아직 `pending`이 남아있으면 유지

### 3-5. 에러 처리

- 개별 채널 발송 실패 시 해당 Notification만 `failed`로 기록
- 다른 채널 메시지는 별도 Lambda 호출이므로 영향 없음
- 실패 시 에러 로그 출력

### 3-6. 로컬 테스트

- `sam local invoke`로 소비 Lambda 직접 호출 (SNS 이벤트 JSON 전달)
- POST → SNS → 소비 Lambda → DB 업데이트 전체 흐름은 AWS 배포 후 테스트
- Jest 테스트 추가

## 완료 기준

- [ ] template.yaml에 SNS 토픽 정의
- [ ] `POST /events` → 채널별 개별 SNS 메시지 발행
- [ ] 소비 Lambda가 SNS 트리거로 실행 (채널 1개씩 처리)
- [ ] Mock 발송 + `'발송완료'` 로그
- [ ] Notifications 테이블에 채널별 상태(`sent`/`failed`) 업데이트
- [ ] Events 테이블에 전체 상태 갱신 (sent / partial_failure)
- [ ] 개별 채널 실패가 다른 채널에 영향 없음
- [ ] 구조화 JSON 로그 출력
