import { log } from "./logger";

interface EnvConfig {
  required: string[];
  conditional?: { when: string; equals: string; require: string[] }[];
}

export function validateEnv(config: EnvConfig): void {
  const missing: string[] = [];

  for (const key of config.required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (config.conditional) {
    for (const rule of config.conditional) {
      if (process.env[rule.when] === rule.equals) {
        for (const key of rule.require) {
          if (!process.env[key]) {
            missing.push(key);
          }
        }
      }
    }
  }

  if (missing.length > 0) {
    log({
      status: "error",
      message: `Missing required environment variables: ${missing.join(", ")}`,
      missing_variables: missing,
    });
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function validatePostEventEnv(): void {
  validateEnv({
    required: [
      "EVENTS_TABLE_NAME",
      "NOTIFICATIONS_TABLE_NAME",
    ],
    conditional: [
      { when: "MESSAGE_QUEUE_PROVIDER", equals: "sns", require: ["TOPIC_ARN"] },
      { when: "MESSAGE_QUEUE_PROVIDER", equals: "sqs", require: ["QUEUE_URL"] },
    ],
  });
}

export function validateProcessNotificationEnv(): void {
  validateEnv({
    required: [
      "EVENTS_TABLE_NAME",
      "NOTIFICATIONS_TABLE_NAME",
      "NOTIFICATION_EMAIL_PROVIDER",
      "NOTIFICATION_SMS_PROVIDER",
      "NOTIFICATION_WEBHOOK_PROVIDER",
      "WEBHOOK_URL",
    ],
  });
}
