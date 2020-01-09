import { init as sentryInit } from "@sentry/browser";

interface ErrorTrackingConfig {
  environment: string;
  release: string;
  sentryDsn?: string;
  debug?: boolean;
}

export function init(conf: ErrorTrackingConfig) {
  const { sentryDsn, release, debug, environment } = conf;

  if (sentryDsn) {
    sentryInit({ dsn: sentryDsn, debug, environment, release });
  }
}
