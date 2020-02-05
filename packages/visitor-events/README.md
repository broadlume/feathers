# Visitor Events

This package is an integration for
[analytics.js](https://segment.com/docs/sources/website/analytics.js/) that
sends all events to our own backend for storage. By doing this, we can use the
events to create a better browsing experience for our users.

## Installation

1. All dependencies are managed with yarn: `yarn`

## Testing

```
yarn test
```

## Notes on the Implementation

1. It makes HTTP POST requests conforming to [this JSON schema](./src/schema.json)
1. It uses a durable `localStorage` queue to retry failed requests
1. In order to avoid cross-domain issues, to conditionally send events, and for
   easier debugging, we use a proxy instead of directly sending events to
   insights.tryadhawk.com/visitor-events
