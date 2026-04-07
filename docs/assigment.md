# 과제 BE-1: 서버리스 이벤트 기반 알림 파이프라인

## 12-Factor 적용 항목

| Factor | 항목 |
|--------|------|
| I | Codebase |
| III | Config |
| IV | Backing Services |
| XI | Logs |

---

## 비즈니스 컨텍스트

InSpline 치과 보험 청구 시스템에서 다음 이벤트가 발생합니다:

- **appointment_confirmed** — 예약 확인
- **insurance_approved** — 보험 승인
- **claim_completed** — 청구 완료

각 이벤트를 메시지 큐에 발행하고, 서버리스 함수가 이를 소비하여 알림(이메일/SMS/Webhook)을 발송하는 **이벤트 기반 파이프라인**을 구축하세요.

> 모든 인프라는 클라우드 Free Tier 내에서 구성해야 합니다.

---

## 클라우드 서비스 매핑 (참고)

### 추천 구성

| 클라우드 | 구성 |
|----------|------|
| **AWS** | API Gateway (12개월 무료) + Lambda (Always Free) + SNS (Always Free) + DynamoDB (Always Free) + CloudWatch Logs (Always Free) |
| **GCP** | Cloud Functions (Always Free) + Firestore (Always Free) + Cloud Logging (Always Free). 메시지 큐는 Firestore 트리거 또는 Cloud Tasks ($300 크레딧) |
| **Azure** | Functions (Always Free) + Cosmos DB (Always Free) + Event Grid ($200 크레딧) + Monitor (Always Free) |

---

## 요구사항 명세

### 1. Git 저장소 및 코드베이스 (12F-I: Codebase)

- GitHub/GitLab에 **단일 코드베이스**로 관리
- `README.md`에 포함할 내용:
  - 아키텍처 다이어그램 (Mermaid 또는 이미지)
  - 배포 방법
  - 환경변수 목록

### 2. 이벤트 발행 API

- **`POST /events`**
  ```json
  {
    "event_type": "appointment_confirmed",
    "clinic_id": "clinic-001",
    "patient_id": "patient-001",
    "channels": ["email", "sms", "webhook"]
  }
  ```
- API Gateway 또는 HTTP 트리거 함수로 구현
- 이벤트를 메시지 큐(SNS / Pub/Sub / Event Grid)에 발행 후 즉시 응답:
  ```json
  {
    "event_id": "evt-xxxxx",
    "status": "queued"
  }
  ```

### 3. 이벤트 소비 함수

- 메시지 큐 트리거로 실행되는 **별도 서버리스 함수**
- 메시지를 수신하여 `channels` 배열에 따라 알림 발송
  - 실제 발송은 **Mock** — 로그에 `'발송완료'` 기록
- 채널별 발송 결과를 DB(DynamoDB / Firestore / Cosmos DB)에 기록

### 4. 알림 프로바이더 추상화 (12F-III: Config)

- 모든 프로바이더 설정(API 키, URL, 프로바이더 종류)은 **환경변수로 주입**
- 코드 내 하드코딩 **0건**
- 필수 환경변수:
  - `NOTIFICATION_EMAIL_PROVIDER`
  - `NOTIFICATION_SMS_PROVIDER`
  - `WEBHOOK_URL`
  - 등
- 환경변수 누락 시 → 함수 시작 시점에 **에러 로그 + 조기 종료**

### 5. Backing Service 추상화 (12F-IV: Backing Services)

- 메시지 큐를 **교체 가능한 Backing Service**로 취급
  - 예: SNS → SQS, Pub/Sub → 다른 토픽 등
- **환경변수 변경만으로 교체 가능한 구조**
- 코드가 특정 큐 서비스에 직접 종속되지 않도록 **추상화 레이어** 구현

### 6. 구조화 로깅 (12F-XI: Logs)

- 모든 로그는 **클라우드 네이티브 로깅 서비스**로 스트리밍
  - stdout/stderr → CloudWatch Logs / Cloud Logging / Azure Monitor
- **파일 기반 로깅 금지**
- JSON 구조화 로그 형식:
  ```json
  {
    "timestamp": "2026-04-07T12:00:00Z",
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "channel": "email",
    "provider": "mock-email",
    "status": "sent",
    "duration_ms": 123
  }
  ```

### 7. 알림 이력 조회 API

- **`GET /events/:event_id`** — 해당 이벤트의 채널별 발송 상태 조회
- **`GET /events?clinic_id=xxx&status=failed`** — 필터링 조회
- DB에서 읽어서 응답

### 8. 데모 비디오 (5분 이내)

다음 항목을 시연:

| 항목 | 내용 |
|------|------|
| **(a)** | 실제 클라우드에 배포된 상태에서 이벤트 3건 발행 (각기 다른 channels 조합) |
| **(b)** | 클라우드 로깅 콘솔에서 구조화 로그 확인 |
| **(c)** | 이력 조회 API로 발송 결과 확인 |
| **(d)** | 환경변수 변경 → 재배포 → 다른 프로바이더로 전환됨을 증명 |
| **(e)** | 아키텍처 다이어그램 설명 |
