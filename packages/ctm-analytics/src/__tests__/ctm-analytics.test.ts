import CTMAnalyticsIntegration from "@adhawk/ctm-analytics";
const Analytics = require("@segment/analytics.js-core").constructor;
const analyticsIntegration = require("@segment/analytics.js-integration");
const sandbox = require("@segment/clear-env");
const tester = require("@segment/analytics.js-integration-tester");

function wait() {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, 10);
  });
}

describe("CTMAnalytics", () => {
  let analytics: any;

  beforeEach(() => {
    analytics = new Analytics();
    analytics.use(CTMAnalyticsIntegration);
    analytics.use(tester);
    analytics.initialize({ "CTM Analytics": {} });
  });

  afterEach(() => {
    analytics.restore();
    analytics.reset();
    sandbox();
    window["__ctm_cvars"] = [];
  });

  describe("#identify", () => {
    it("sets the ctm cvars with segmentUserId when ID is known", async () => {
      analytics.identify("123", { "retailer-id": "456" });

      await wait();

      expect(window["__ctm_cvars"]).toEqual([
        { "retailer-id": "456", segmentUserId: "123" },
      ]);
    });

    it("sets the ctm cvars with segmentAnonymousId when ID is not known", async () => {
      analytics.identify({ "retailer-id": "456" });

      await wait();

      expect(window["__ctm_cvars"]).toEqual([
        {
          "retailer-id": "456",
          segmentAnonymousId: expect.stringMatching(/.+-/),
        },
      ]);
    });
  });
});
