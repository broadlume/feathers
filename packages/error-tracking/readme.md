# @adhawk/adwords-phone-tag

This package sets up error tracking for projects. Behinds the curtains, it sets up and uses [sentry.io](https://sentry.io).

## Setup

### NPM

```javascript
import { init as errorTrackingInit } from "@adhawk/error-tracking";

init({
  release: "v1.0",
  environment: "production",
  sentryDsn: "..."
});
```

### Browser

In the `head` tag:

```html
<script src="https://unpkg.com/@adhawk/error-tracking/lib/error-tracking.umd.min.js"></script>
```

## Usage

### Identifying Users

This is useful for knowing which users encountered errors.

```javascript
import { identify as identifyForErrorTracking } from "@adhawk/error-tracking";

identify({
  id: loggedInUser.id,
  username: loggedInUser.name,
  email: loggedInUser.email
});
```

### Manually Capturing Errors

This is useful for reporting exceptions which are caught.

```javascript
import { captureException } from "@adhawk/error-tracking";

try {
  throw new Error("Oh no!");
} catch (e) {
  captureException(e);
}
```
