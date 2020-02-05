import VisitorEventsIntegration from "..";
const Analytics = require("@segment/analytics.js-core").constructor;
const analyticsIntegration = require("@segment/analytics.js-integration");
const sandbox = require("@segment/clear-env");
const tester = require("@segment/analytics.js-integration-tester");
const { matchers } = require("jest-json-schema");

expect.extend(matchers);

function expectFetchedWithProperSchema(extra: any) {
  // @ts-ignore
  const body = JSON.parse(window.fetch.mock.calls[0][1].body);
  // @ts-ignore
  const endpoint = window.fetch.mock.calls[0][0];

  // @ts-ignore
  expect(body).toMatchSchema(schema(extra));
  expect(body).toMatchSnapshot({
    timestamp: expect.any(String),
    anonymousId: expect.any(String),
    messageId: expect.any(String),
  });
  expect(endpoint).toEqual("/visitor-events");
}

const schema = (extra: any) => ({
  ...require("./../schema"),
  properties: {
    ...require("./../schema").properties,
    ...extra,
  },
  $id: undefined,
});

function mockFetch(data: any) {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => data,
    }),
  );
}

describe("VisitorEvents", () => {
  let analytics: any;
  let visitorEvents: any;
  const options = {};

  function isProcessed() {
    return new Promise((resolve, reject) => {
      visitorEvents.queue.on("processed", (err: any, res: any) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  beforeEach(() => {
    analytics = new Analytics();
    visitorEvents = new VisitorEventsIntegration(options);
    analytics.use(VisitorEventsIntegration);
    analytics.use(tester);
    analytics.add(visitorEvents);
  });

  afterEach(() => {
    analytics.restore();
    analytics.reset();
    visitorEvents.reset();
    sandbox();
  });

  it("should have the right settings", () => {
    analytics.compare(
      VisitorEventsIntegration,
      analyticsIntegration("Visitor Events")
        .option("endpoint", "/visitor-events")
        .option("debug", false)
        .readyOnInitialize(),
    );
  });

  describe("after loading", () => {
    beforeEach(done => {
      analytics.once("ready", done);
      window.fetch = mockFetch({});
      analytics.initialize();
    });

    it("sets the campaign based on utm params", async () => {
      window.location.href =
        "https://www.example.com?utm_source=news4&utm_medium=email&utm_campaign=spring-summer";
      analytics.track("foo", { some_field: "field_value" });

      await isProcessed();

      expectFetchedWithProperSchema({
        context: {
          type: "object",
          properties: {
            campaign: {
              type: "object",
              properties: {
                source: {
                  type: "string",
                },
                medium: {
                  type: "string",
                },
                campaign: {
                  type: "string",
                },
              },
            },
          },
        },
      });
    });

    describe("#identify", () => {
      it("should default to anonymousId", async () => {
        analytics.identify();

        await isProcessed();

        expectFetchedWithProperSchema({
          anonymousId: {
            type: "string",
          },
          userId: {
            type: "null",
          },
        });
      });

      it("sends the userId when identified", async () => {
        analytics.identify("1");

        await isProcessed();

        expectFetchedWithProperSchema({
          anonymousId: {
            type: "string",
          },
          userId: {
            type: "string",
          },
        });
      });
    });

    describe("#track", () => {
      it("includes the provided props as a payload", async () => {
        analytics.track("foo", { some_field: "field_value" });

        await isProcessed();

        expectFetchedWithProperSchema({
          payload: {
            type: "object",
            properties: {
              some_field: {
                type: "string",
              },
            },
          },
        });
      });

      it("includes the event name", async () => {
        analytics.track("foo", { some_field: "field_value" });

        await isProcessed();

        expectFetchedWithProperSchema({
          event: {
            type: "string",
            enum: ["foo"],
          },
        });
      });
    });

    describe("#page", () => {
      it("includes the event name", async () => {
        analytics.page();

        await isProcessed();

        expectFetchedWithProperSchema({
          event: {
            type: "string",
            enum: ["Page"],
          },
        });
      });

      it("includes the page name and category in type context", async () => {
        analytics.page("FlooringStores", "Show");

        await isProcessed();

        expectFetchedWithProperSchema({
          typeContext: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["FlooringStores"],
              },
              name: {
                type: "string",
                enum: ["Show"],
              },
            },
          },
        });
      });
    });

    describe("#group", () => {
      it("includes the event name", async () => {
        analytics.group("Manufacturers");

        await isProcessed();

        expectFetchedWithProperSchema({
          event: {
            type: "string",
            enum: ["Group"],
          },
        });
      });

      it("includes the args", async () => {
        analytics.group("Manufacturers");

        await isProcessed();

        expectFetchedWithProperSchema({
          typeContext: {
            type: "object",
            properties: {
              groupId: {
                type: "string",
                enum: ["Manufacturers"],
              },
            },
          },
        });
      });
    });

    describe("#alias", () => {
      it("includes the event name", async () => {
        analytics.alias("old ID", "new ID");

        await isProcessed();

        expectFetchedWithProperSchema({
          type: {
            type: "string",
            enum: ["alias"],
          },
        });
      });

      it("includes the args", async () => {
        analytics.alias("new ID", "old ID");

        await isProcessed();

        expectFetchedWithProperSchema({
          typeContext: {
            type: "object",
            properties: {
              previousId: {
                type: "string",
                enum: ["old ID"],
              },
            },
          },
        });
      });
    });
  });
});
