# @adhawk/react-tracked-link

This package is a wrapper `<a>` tags that is compatible Segment.io. Under the
hood, it ensures `analytics.track` is called before the browser navigates
away. Similar to `analytics.trackLink`, but for React.

## Setup

```sh
yarn add @adhawk/react-tracked-link
```

## Usage

```javascript
import { TrackedLink } from "@adhawk/react-tracked-link";

ReactDOM.render(
  <TrackedLink
    href="/foo/bar"
    eventName="Clicked Foo Link"
    eventProperties={{ experiment: "v2" }}
  />,
  document.querySelector("root"),
);
```
