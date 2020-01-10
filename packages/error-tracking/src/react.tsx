import React from "react";
import { captureException } from "./";
import { withScope, showReportDialog } from "@sentry/browser";

interface State {
  hasError?: boolean;
  eventId?: string;
}

export class ErrorBoundary extends React.Component<{}, State> {
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: object) {
    withScope(scope => {
      scope.setExtras(errorInfo);
      const eventId = captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    const { hasError, eventId } = this.state;

    if (hasError) {
      //render fallback UI
      return typeof eventId !== "string" ? (
        <button onClick={() => showReportDialog({ eventId: eventId })}>
          Report Feedback
        </button>
      ) : null;
    }

    //when there's not an error, render children untouched
    return this.props.children;
  }
}
