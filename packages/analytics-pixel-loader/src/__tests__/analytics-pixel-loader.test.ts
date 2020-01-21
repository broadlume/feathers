import loader from "./../";

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
      var Analytics = require('@segment/analytics.js-core').constructor;
      var analytics = new Analytics();
      analytics.use(GoogleAnalytics);
      analytics.initialize({\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}});
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
      var Analytics = require('@segment/analytics.js-core').constructor;
      var analytics = new Analytics();
      analytics.use(GoogleAnalytics);
      analytics.initialize({\\"Google Analytics\\":{\\"trackingId\\":\\"UA-123\\"}});
      export default analytics;"
    `);
  });
});
