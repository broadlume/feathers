import loader from "@adhawk/analytics-pixel-loader";

describe("Analytics Pixel Loader", () => {
  it("compiles valid source", () => {
    const config = `
---
- name: Google Analytics
  opts:
    trackingId: UA-123
    `;

    const compiled = loader(config);

    expect(compiled).toMatchInlineSnapshot(`
      "import GoogleAnalytics from \\"@segment/analytics.js-integration-google-analytics\\";
      var Analytics = require('@segment/analytics.js-core/lib/analytics');
      var analytics = new Analytics();
      analytics.VERSION = require('@segment/analytics.js-core/package.json').version;
      analytics.use(GoogleAnalytics);
      var analyticsConfig = {\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}};

      if (typeof document !== 'undefined') {
        var analyticsConfigMeta = document.querySelector('meta[name=\\"analytics-config\\"]');
        if (analyticsConfigMeta) {
          analyticsConfig = JSON.parse(analyticsConfigMeta.content);
        }
      }

      analytics.initialize(analyticsConfig);
      export default analytics;"
    `);
  });

  it("allows for package to be specified", () => {
    const config = `
---
- name: Google Analytics
  package: "@segment/foo-bar"
  opts:
    trackingId: UA-123
    `;

    const compiled = loader(config);

    expect(compiled).toMatchInlineSnapshot(`
      "import GoogleAnalytics from \\"@segment/foo-bar\\";
      var Analytics = require('@segment/analytics.js-core/lib/analytics');
      var analytics = new Analytics();
      analytics.VERSION = require('@segment/analytics.js-core/package.json').version;
      analytics.use(GoogleAnalytics);
      var analyticsConfig = {\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}};

      if (typeof document !== 'undefined') {
        var analyticsConfigMeta = document.querySelector('meta[name=\\"analytics-config\\"]');
        if (analyticsConfigMeta) {
          analyticsConfig = JSON.parse(analyticsConfigMeta.content);
        }
      }

      analytics.initialize(analyticsConfig);
      export default analytics;"
    `);
  });
});
