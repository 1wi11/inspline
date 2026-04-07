# Phase 1: 기본 뼈대 + 로컬 테스트

## 목표

SAM 프로젝트를 초기화하고, 첫 번째 Lambda(`POST /events`)를 로컬에서 호출할 수 있는 상태까지 만든다.

## 기술 스택

- Runtime: Node.js 20.x
- Language: TypeScript
- IaC: AWS SAM (template.yaml)
- 로컬 테스트: `sam local start-api`

## 작업 항목

### 1-1. SAM 프로젝트 초기화

- `sam init` 또는 수동으로 프로젝트 구조 생성
- TypeScript 빌드 환경 구성 (esbuild)
- 디렉토리 구조:
  ```
  inspline/
  ├── template.yaml
  ├── tsconfig.json
  ├── package.json
  ├── src/
  │   └── handlers/
  │       └── postEvent.ts
  ├── events/          # SAM 로컬 테스트용 이벤트 JSON
  └── docs/
  ```

### 1-2. POST /events Lambda 작성

- API Gateway → Lambda 연동 (template.yaml에 정의)
- 요청 바디 파싱 및 검증:
  - `event_type`: `appointment_confirmed | insurance_approved | claim_completed`
  - `clinic_id`: string (필수)
  - `patient_id`: string (필수)
  - `channels`: `("email" | "sms" | "webhook")[]` (1개 이상)
- `event_id` 생성 (UUID prefix: `evt-`)
- 응답: `{ "event_id": "evt-xxxxx", "status": "queued" }`
- 이 단계에서는 큐 발행 없이 응답만 반환

### 1-3. 구조화 로깅

- `console.log`로 JSON 구조화 로그 출력 (stdout)
- 로그 형식:
  ```json
  {
    "timestamp": "2026-04-07T12:00:00Z",
    "event_id": "evt-xxxxx",
    "event_type": "appointment_confirmed",
    "channel": "",
    "provider": "",
    "status": "received",
    "duration_ms": 0
  }
  ```
- 파일 기반 로깅 금지 — stdout만 사용

### 1-4. 로컬 테스트

- `sam local start-api`로 로컬 API 실행
- `curl`로 `POST /events` 호출하여 정상 응답 확인
- 잘못된 요청(필수 필드 누락 등)에 대한 에러 응답 확인

## 완료 기준

- [ ] `sam build` 성공
- [ ] `sam local start-api`로 로컬 서버 기동
- [ ] `POST /events` 호출 시 `{ event_id, status: "queued" }` 응답
- [ ] 잘못된 요청 시 400 에러 응답
- [ ] stdout에 JSON 구조화 로그 출력
