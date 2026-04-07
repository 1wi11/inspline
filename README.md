# InSpline 과제 박정진 - 서버리스 이벤트 기반 알림 파이프라인 (BE-1)

> 12-Factor: III. Config / IV. Backing Services / XI. Logs / I. Codebase

InSpline 치과 보험 청구 시스템의 이벤트(예약 확인, 보험 승인, 청구 완료)를 수신하여 이메일/SMS/Webhook으로 알림을 발송하는 서버리스 파이프라인입니다.

## 사전 준비

### 1. Node.js 설치

Node.js 20.x 이상이 필요합니다.

```bash
node --version  # v20.x.x 확인
```

설치: https://nodejs.org/

### 2. IAM 사용자 생성

AWS 콘솔에서 IAM 사용자를 생성합니다.

1. AWS 콘솔 → IAM → 사용자 → 사용자 추가
2. 사용자 이름 입력 (예: `inspline-deploy`)
3. 권한 정책에서 `AdministratorAccess` 연결
4. 사용자 생성 후 **Access Key ID**와 **Secret Access Key**를 저장

> 과제 시연 목적으로 `AdministratorAccess`를 사용했습니다. 실제 프로덕션에서는 Lambda, DynamoDB, SNS, SQS, API Gateway, CloudFormation, S3, IAM 등 필요한 최소 권한만 부여해야 합니다.

### 3. AWS CLI 설치 및 설정

```bash
# macOS
brew install awscli

# 설치 확인
aws --version
```

설치 후 자격 증명을 설정합니다.

```bash
aws configure
```

| 항목 | 입력값 |
|------|--------|
| AWS Access Key ID | IAM에서 발급한 Access Key |
| AWS Secret Access Key | IAM에서 발급한 Secret Key |
| Default region name | `ap-northeast-2` |
| Default output format | `json` |

### 4. SAM CLI 설치

```bash
# macOS
brew install aws-sam-cli

# 설치 확인
sam --version
```

설치 가이드: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

## 배포 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/1wi11/inspline.git
cd inspline
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 빌드

```bash
sam build
```

### 4. 배포

```bash
sam deploy --stack-name inspline --resolve-s3 --capabilities CAPABILITY_IAM --region ap-northeast-2
```

배포가 완료되면 API Gateway 엔드포인트 URL이 출력됩니다.

```
Outputs
-----------------------------------------
Key                 ApiUrl
Description         API Gateway endpoint URL
Value               https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/Prod/
-----------------------------------------
```

### 5. 코드 변경 후 재배포

```bash
sam build && sam deploy --stack-name inspline --resolve-s3 --capabilities CAPABILITY_IAM --region ap-northeast-2
```

### 6. 스택 삭제

```bash
sam delete --stack-name inspline --region ap-northeast-2
```

## 환경변수 목록

`template.yaml`의 `Globals.Function.Environment.Variables`에서 관리됩니다.

### 인프라

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `EVENTS_TABLE_NAME` | Events DynamoDB 테이블명 | SAM이 자동 주입 |
| `NOTIFICATIONS_TABLE_NAME` | Notifications DynamoDB 테이블명 | SAM이 자동 주입 |

### 메시지 큐 (12F-IV: Backing Services)

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `MESSAGE_QUEUE_PROVIDER` | 큐 서비스 선택 (`sns` / `sqs`) | `sns` |
| `TOPIC_ARN` | SNS 토픽 ARN (SNS 선택 시 필수) | SAM이 자동 주입 |
| `QUEUE_URL` | SQS 큐 URL (SQS 선택 시 필수) | SAM이 자동 주입 |

### 알림 프로바이더 (12F-III: Config)

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NOTIFICATION_EMAIL_PROVIDER` | 이메일 프로바이더 (`mock` / `mock2`) | `mock` |
| `NOTIFICATION_SMS_PROVIDER` | SMS 프로바이더 (`mock` / `mock2`) | `mock` |
| `NOTIFICATION_WEBHOOK_PROVIDER` | Webhook 프로바이더 (`mock`) | `mock` |
| `WEBHOOK_URL` | Webhook 발송 대상 URL | `https://example.com/webhook` |

> 환경변수 변경 후 `sam build && sam deploy`로 재배포하면 코드 수정 없이 프로바이더를 전환할 수 있습니다.
