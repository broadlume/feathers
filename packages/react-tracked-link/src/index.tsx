import React from "react";

const NEWTAB = "_blank";
const MIDDLECLICK = 1;

function isAnalyticsActive(): boolean {
  return window.analytics && typeof window.analytics.track === "function";
}

function warnNoAnalytics(): void {
  console.warn(
    "TrackedLink: window.analytics could not be found, make sure to include analytics.js script tag in the head tag before any other JS",
  );
}

interface Props extends React.AnchorHTMLAttributes<{}> {
  eventName: string;
  eventProperties: object;
}

export class TrackedLink extends React.Component<Props, {}> {
  static defaultProps = {
    target: null,
    to: null,
    onClick: null,
    eventProperties: {},
  };

  static trackEvent(
    eventName: string,
    properties: object,
    cb?: () => void,
  ): void {
    if (!isAnalyticsActive()) {
      warnNoAnalytics();
      cb && cb();
    } else {
      window.analytics.track(eventName, properties, cb);
    }
  }

  handleClick: React.MouseEventHandler = event => {
    const { target, eventName, eventProperties, href, onClick } = this.props;
    const sameTarget = target !== NEWTAB;

    const normalClick = !(
      event.ctrlKey ||
      event.shiftKey ||
      event.metaKey ||
      event.button === MIDDLECLICK
    );

    if (sameTarget && normalClick) {
      event.preventDefault();

      TrackedLink.trackEvent(eventName, eventProperties, () => {
        window.location.href = href;
      });
    } else {
      TrackedLink.trackEvent(eventName, eventProperties);
    }

    if (onClick) {
      onClick(event);
    }
  };
  render(): React.ReactNode {
    const { href, ...oldProps } = this.props;
    const props = {
      ...oldProps,
      href,
      onClick: this.handleClick,
    };

    if (this.props.target === NEWTAB) {
      props.rel = "noopener noreferrer";
    }

    delete props.eventName;
    delete props.eventProperties;

    return React.createElement("a", props);
  }
}
