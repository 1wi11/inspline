# 배포 트러블슈팅 및 활용 기록

## 배포 중 만난 문제와 해결 과정

### 1. IaC 첫 도입에 따른 시행착오

**문제**: AWS 콘솔에서 직접 설정하던 방식과 달리, SAM template.yaml로 리소스를 정의할 때 DynamoDB GSI 설정, Lambda 트리거 연결, IAM 정책 작성 등에서 문법 오류와 설정 누락이 반복적으로 발생

**해결**:

- Claude Code를 활용하여 template.yaml 작성을 진행하되, 생성된 리소스 구성과 IAM 정책을 직접 검토하고 수정
- 각 Lambda 함수별로 필요한 최소 권한만 정의하여 IAM 정책을 명시적으로 관리

### 2. 환경변수 미설정

**문제**: 배포 후 Lambda 실행 시 환경변수가 없어 런타임 에러 발생

**해결**:

- `template.yaml`의 `Globals.Function.Environment.Variables`에 모든 환경변수를 정의
- `src/utils/envValidator.ts`를 작성하여 Lambda 실행 시작 시점에 필수 환경변수 존재 여부를 검증하도록 함

---

## 무료 크레딧 및 무료 Plan 활용

### AWS 무료 크레딧

- **AWS Free Tier** 범위 내에서 모든 리소스를 운영
  - Lambda: 월 100만 건 무료 요청
  - DynamoDB: 25GB 스토리지, 월 2억 건 읽기/쓰기 무료
  - SNS: 월 100만 건 발행 무료
  - SQS: 월 100만 건 요청 무료
  - API Gateway: 월 100만 건 REST API 호출 무료
  - Amplify: 빌드 월 1,000분 무료
- 과제 규모에서는 무료 범위를 초과할 일이 없으므로 비용 0원으로 운영

### Code Agent 활용

**Claude Code** (Anthropic) 유료 플랜을 사용하여 아래 5단계로 구현을 진행했다. 각 Phase의 구현 계획은 Claude Code와 논의하며 설계했고, 코드 작성과 리팩토링에도 활용했다.

| Phase   | 내용                                                       | Claude Code 활용                                          |
| ------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Phase 1 | SAM 프로젝트 초기화, POST /events Lambda, 구조화 로깅      | template.yaml 작성, 핸들러 코드 생성, 로거 유틸 작성      |
| Phase 2 | DynamoDB 테이블 설계(Events, Notifications), 조회 API 구현 | 테이블 스키마 정의, Repository 패턴 코드 작성, GSI 설정   |
| Phase 3 | SNS 메시지 발행, 소비 Lambda, 채널별 알림 발송 파이프라인  | SNS 연동 코드, processNotification 핸들러, 상태 갱신 로직 |
| Phase 4 | 프로바이더/큐 추상화, 환경변수 기반 전환, 환경변수 검증    | 인터페이스 설계, 팩토리 패턴 구현, envValidator 작성      |
| Phase 5 | AWS 배포, 통합 테스트, README 문서화                       | 배포 명령어 확인, 테스트 코드 작성, README 작성           |

---

## 본인 검토 및 수정 부분

AI가 생성한 코드를 그대로 사용하지 않고, 아래 항목들을 직접 검토하고 수정했다.

### 리팩토링

- **핸들러 코드 정리** (`refactor: 핸들러 코드 정리 및 안정성 개선`): 4개 핸들러와 Repository 코드에서 중복된 응답 처리 로직을 `response.ts` 유틸로 통일하고, 코드 가독성을 개선
- **코드 개선 및 테스트 보강** (`refactor: 코드 개선 및 필수 테스트 추가`): `snsPublisher.ts`를 `messagePublisher.ts`로 리네이밍하여 큐 추상화와 일관되게 정리. providerFactory, queueFactory, envValidator, eventRepository에 대한 테스트 추가

### 직접 수정

- **CORS 설정**: API Gateway와 Lambda 응답 양쪽에 CORS 헤더가 필요하다는 것을 확인하고, template.yaml과 response.ts 모두 수정
- **불필요한 프로바이더 제거**: webhook mock2 프로바이더가 실제로 불필요하다고 판단하여 삭제
- **IAM 정책 검토**: AI가 생성한 template.yaml의 Lambda 권한 정책이 과도하지 않은지 확인하고, 함수별 최소 권한으로 조정
- **테스트 환경 설정**: Phase 4에서 환경변수 의존 테스트가 실패하여 `tests/setup.ts`와 `jest.config.js`를 직접 수정

---

## 오류 또는 제약 조건

### 1. 알림 프로바이더가 Mock 구현

- 실제 이메일(SES), SMS(Twilio) 연동은 과제 범위와 비용을 고려하여 제외
- `NotificationProvider` 인터페이스를 정의하여 실제 프로바이더 추가 시 코드 변경 없이 환경변수만으로 전환 가능하도록 설계

### 2. 인증/인가 미구현

- API Key, JWT 등 인증 메커니즘은 과제 범위를 고려하여 미구현
- 입력 검증(`eventValidator.ts`)과 CORS 설정으로 기본적인 요청 제어만 적용

### 3. DynamoDB 단일 리전

- 현재 `ap-northeast-2` 단일 리전에서 운영
- 글로벌 서비스로 확장 시 DynamoDB Global Tables 활용 가능
