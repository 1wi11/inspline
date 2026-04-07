# Phase 4: 추상화 레이어

## 목표

알림 프로바이더와 메시지 큐를 환경변수만으로 교체 가능한 구조로 추상화한다. 12-Factor의 Config(III)과 Backing Services(IV)를 충족한다.

## 작업 항목

### 4-1. 알림 프로바이더 추상화 (12F-III: Config)

- 공통 인터페이스 정의:
  ```typescript
  interface NotificationProvider {
    send(params: NotificationParams): Promise<NotificationResult>;
  }
  ```
- 채널별 프로바이더 구현:
  - `MockEmailProvider` / `MockSmsProvider` / `MockWebhookProvider`
  - 향후 실제 프로바이더로 교체 가능한 구조
- 환경변수로 프로바이더 선택:
  - `NOTIFICATION_EMAIL_PROVIDER` → `"mock"` | `"ses"` | ...
  - `NOTIFICATION_SMS_PROVIDER` → `"mock"` | `"sns-sms"` | ...
  - `WEBHOOK_URL` → webhook 발송 대상 URL
- 팩토리 패턴으로 환경변수 기반 프로바이더 인스턴스 생성

### 4-2. 메시지 큐 추상화 (12F-IV: Backing Services)

- 공통 인터페이스 정의:
  ```typescript
  interface MessageQueue {
    publish(message: EventMessage): Promise<void>;
  }
  ```
- 구현체:
  - `SnsMessageQueue` — SNS 토픽으로 발행
  - `SqsMessageQueue` — SQS 큐로 발행 (교체 가능 증명용)
- 환경변수로 큐 서비스 선택:
  - `MESSAGE_QUEUE_PROVIDER` → `"sns"` | `"sqs"`
  - `TOPIC_ARN` 또는 `QUEUE_URL`
- POST /events 핸들러는 인터페이스에만 의존

### 4-3. 환경변수 검증

- Lambda 시작 시점에 필수 환경변수 존재 여부 확인
- 필수 환경변수 목록:
  - `TABLE_NAME`
  - `MESSAGE_QUEUE_PROVIDER`
  - `TOPIC_ARN` 또는 `QUEUE_URL` (선택된 큐에 따라)
  - `NOTIFICATION_EMAIL_PROVIDER`
  - `NOTIFICATION_SMS_PROVIDER`
  - `WEBHOOK_URL`
- 누락 시:
  - 에러 로그 출력 (어떤 변수가 누락인지 명시)
  - 즉시 종료 (500 응답 또는 프로세스 종료)

### 4-4. 코드 내 하드코딩 점검

- 코드 전체에서 하드코딩된 설정값 0건 확인
- 모든 외부 서비스 연결 정보는 환경변수에서 읽기

## 완료 기준

- [ ] `NotificationProvider` 인터페이스 + 채널별 Mock 구현체
- [ ] 환경변수 변경만으로 프로바이더 교체 가능
- [ ] `MessageQueue` 인터페이스 + SNS/SQS 구현체
- [ ] 환경변수 변경만으로 큐 서비스 교체 가능
- [ ] 필수 환경변수 누락 시 에러 로그 + 조기 종료
- [ ] 코드 내 하드코딩 0건
- [ ] 환경변수 변경 → 재배포 → 다른 프로바이더로 전환 검증
