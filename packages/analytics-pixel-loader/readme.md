# @adhawk/analytics-pixel-loader

This packages export a React component which will wrap React components to
catch errors. A user is shown a dialog to give feedback when they experience an
error.

## Setup

1. Install the package

```sh
yarn add @adhawk/analytics-pixel-loader
```

2. Create an `analytics-pixel.yml` file with your Segment config

```yaml
---
- name: Google Analytics
  opts:
    trackingId: UA-123
    sendUserId: true
```

3. Setup webpack loader to build the pixel

```javascript
module: {
  rules: [
    {
      test: /analytics-pixel\.yml$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: "@adhawk/analytics-pixel-loader",
      },
    },
  ];
}
```

4. Import the analytics pixel in your main entrypoint:

```javascript
// index.js

import "./analytics-pixel.yml";
```

5. Start tracking

```javascript
<button onClick={() => analytics.track("Button Clicked", { foo: "bar" })} />
```
