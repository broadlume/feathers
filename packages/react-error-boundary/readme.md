# @adhawk/react-error-boundary

This packages export a React component which will wrap React components to
catch errors. A user is shown a dialog to give feedback when they experience an
error.

## Setup

```sh
yarn add @adhawk/error-boundary
```

## Usage

```javascript
import { ErrorBoundary } from "@adhawk/error-boundary";

ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.querySelector("root"),
);
```
