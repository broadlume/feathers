import {
  configureScope as sentryConfigureScope,
  captureException as sentryCaptureException,
  init as sentryInit,
} from "@sentry/browser";

export interface User {
  id: string;
  username?: string;
  email?: string;
}

export interface ErrorTrackingConfig {
  environment: string;
  release: string;
  sentryDsn?: string;
  debug?: boolean;
  ignoreErrors?: Array<string | RegExp>;
}

export function init(conf: ErrorTrackingConfig): void {
  const { sentryDsn, ...opts } = conf;

  if (sentryDsn) {
    sentryInit({
      dsn: sentryDsn,
      ...opts,
    });
  }
}

export function identify<T extends User>(user: T): void {
  sentryConfigureScope(scope => {
    scope.setUser(user);
  });
}

export function captureException(error: Error): string {
  if (
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    process?.env?.NODE_ENV !== "production"
  ) {
    console.error(error);
  }

  return sentryCaptureException(error);
}

export { showReportDialog } from "@sentry/browser";
