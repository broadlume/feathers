import React, { ErrorInfo } from "react";
import { withScope, captureException, showReportDialog } from "@sentry/browser";

interface State {
  hasError?: boolean;
  eventId?: string;
}

export class ErrorBoundary extends React.Component<{}, State> {
  state = { hasError: undefined, eventId: undefined };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: object): void {
    withScope((scope) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      scope.setExtras(errorInfo);
      const eventId = captureException(error);
      this.setState({ eventId });
    });
  }

  render(): React.ReactNode {
    const { hasError, eventId } = this.state;

    if (hasError) {
      //render fallback UI
      return typeof eventId !== "string" ? (
        <button onClick={(): void => showReportDialog({ eventId: eventId })}>
          Report Feedback
        </button>
      ) : null;
    }

    //when there's not an error, render children untouched
    return this.props.children;
  }
}
