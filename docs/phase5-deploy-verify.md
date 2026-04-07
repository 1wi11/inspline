# Phase 5: AWS 배포 + 검증

## 목표

전체 파이프라인을 AWS에 배포하고, 과제 요구사항을 모두 충족하는지 검증한다.

## 작업 항목

### 5-1. SAM 배포

- `sam build && sam deploy --guided`로 첫 배포
- samconfig.toml에 배포 설정 저장
- 스택 이름: `inspline-notification`
- 리전: ap-northeast-2 (또는 Free Tier 가용 리전)

### 5-2. 통합 테스트

- 배포된 API Gateway 엔드포인트로 테스트:
  1. 이벤트 3건 발행 (각기 다른 channels 조합)
     - `["email"]`
     - `["email", "sms"]`
     - `["email", "sms", "webhook"]`
  2. 각 이벤트의 이력 조회 (`GET /events/:event_id`)
  3. 필터링 조회 (`GET /events?clinic_id=xxx&status=sent`)
  4. CloudWatch Logs에서 구조화 로그 확인

### 5-3. 프로바이더 전환 시연

- 환경변수 변경 (예: `NOTIFICATION_EMAIL_PROVIDER=mock` → `mock-v2`)
- `sam deploy`로 재배포
- 동일 이벤트 발행 → 로그에서 변경된 프로바이더 확인

### 5-4. README.md 작성

- 아키텍처 다이어그램 (Mermaid)
  - API Gateway → Lambda → SNS → Lambda → DynamoDB 흐름
- 배포 방법 (`sam build`, `sam deploy`)
- 환경변수 목록 및 설명
- API 사용법 (curl 예시)

### 5-5. 데모 비디오 준비 (5분 이내)

시연 항목:
| 순서 | 내용 | 예상 시간 |
|------|------|-----------|
| (a) | 이벤트 3건 발행 (각기 다른 channels 조합) | 1분 |
| (b) | CloudWatch Logs에서 구조화 로그 확인 | 1분 |
| (c) | 이력 조회 API로 발송 결과 확인 | 1분 |
| (d) | 환경변수 변경 → 재배포 → 프로바이더 전환 증명 | 1분 |
| (e) | 아키텍처 다이어그램 설명 | 1분 |

## 완료 기준

- [ ] AWS에 전체 스택 배포 성공
- [ ] 이벤트 발행 → SNS → 소비 Lambda → DB 업데이트 파이프라인 정상 동작
- [ ] CloudWatch Logs에 JSON 구조화 로그 스트리밍
- [ ] 이력 조회 API 정상 동작
- [ ] 환경변수 변경으로 프로바이더 전환 시연 가능
- [ ] README.md 완성 (아키텍처 다이어그램, 배포 방법, 환경변수 목록)
- [ ] 데모 비디오 촬영 완료
