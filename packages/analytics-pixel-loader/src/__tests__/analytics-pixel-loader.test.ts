import loader from "@adhawk/analytics-pixel-loader";

describe("Analytics Pixel Loader", () => {
  it("compiles valid source", () => {
    const config = `
---
integrations:
  - name: Google Analytics
    opts:
      trackingId: UA-123
    `;

    const compiled = loader(config);

    expect(compiled).toMatchInlineSnapshot(`
      "import GoogleAnalytics from \\"@segment/analytics.js-integration-google-analytics\\";
      import Analytics from '@segment/analytics.js-core/build/analytics';

      var analytics = new Analytics();
      analytics.VERSION = \\"4.1.5\\";
      analytics.use(GoogleAnalytics);
      var analyticsConfig = {\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}};
      var analyticsOptions = {};

      if (typeof document !== 'undefined') {
        var analyticsConfigMeta = document.querySelector('meta[name=\\"analytics-config\\"]');
        if (analyticsConfigMeta) {
          analyticsConfig = JSON.parse(analyticsConfigMeta.content);
        }

        var analyticsOptionsMeta = document.querySelector('meta[name=\\"analytics-options\\"]');
        if (analyticsOptionsMeta) {
          analyticsConfig = JSON.parse(analyticsOptionsMeta.content);
        }
      }

      analytics.initialize(analyticsConfig, analyticsOptions);
      export default analytics;"
    `);
  });

  it("allows for package to be specified", () => {
    const config = `
---
integrations:
  - name: Google Analytics
    package: "@segment/foo-bar"
    opts:
      trackingId: UA-123
    `;

    const compiled = loader(config);

    expect(compiled).toMatchInlineSnapshot(`
      "import GoogleAnalytics from \\"@segment/foo-bar\\";
      import Analytics from '@segment/analytics.js-core/build/analytics';

      var analytics = new Analytics();
      analytics.VERSION = \\"4.1.5\\";
      analytics.use(GoogleAnalytics);
      var analyticsConfig = {\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}};
      var analyticsOptions = {};

      if (typeof document !== 'undefined') {
        var analyticsConfigMeta = document.querySelector('meta[name=\\"analytics-config\\"]');
        if (analyticsConfigMeta) {
          analyticsConfig = JSON.parse(analyticsConfigMeta.content);
        }

        var analyticsOptionsMeta = document.querySelector('meta[name=\\"analytics-options\\"]');
        if (analyticsOptionsMeta) {
          analyticsConfig = JSON.parse(analyticsOptionsMeta.content);
        }
      }

      analytics.initialize(analyticsConfig, analyticsOptions);
      export default analytics;"
    `);
  });

  it("allows for other options to be specified", () => {
    const config = `
---
cookie:
  path: /retailer
integrations:
  - name: Google Analytics
    package: "@segment/foo-bar"
    opts:
      trackingId: UA-123
    `;

    const compiled = loader(config);

    expect(compiled).toMatchInlineSnapshot(`
      "import GoogleAnalytics from \\"@segment/foo-bar\\";
      import Analytics from '@segment/analytics.js-core/build/analytics';

      var analytics = new Analytics();
      analytics.VERSION = \\"4.1.5\\";
      analytics.use(GoogleAnalytics);
      var analyticsConfig = {\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}};
      var analyticsOptions = {\\"cookie\\":{\\"path\\":\\"/retailer\\"}};

      if (typeof document !== 'undefined') {
        var analyticsConfigMeta = document.querySelector('meta[name=\\"analytics-config\\"]');
        if (analyticsConfigMeta) {
          analyticsConfig = JSON.parse(analyticsConfigMeta.content);
        }

        var analyticsOptionsMeta = document.querySelector('meta[name=\\"analytics-options\\"]');
        if (analyticsOptionsMeta) {
          analyticsConfig = JSON.parse(analyticsOptionsMeta.content);
        }
      }

      analytics.initialize(analyticsConfig, analyticsOptions);
      export default analytics;"
    `);
  });
});
