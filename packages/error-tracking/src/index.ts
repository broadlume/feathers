import {
  configureScope,
  captureException as sentryCaptureException
} from "@sentry/browser";

interface User {
  id: string;
  username?: string;
  email?: string;
}

export function identify<T extends User>(user: T) {
  configureScope(scope => {
    scope.setUser(user);
  });
}

export function captureException(error: Error) {
  if (process.env.NODE_ENV !== "production") {
    console.log(process.env.NODE_ENV);
    console.error(error);
  }

  sentryCaptureException(error);
}
