"use strict";

const Analytics = require("@segment/analytics.js-core").constructor;
const integration = require("@segment/analytics.js-integration");
const sandbox = require("@segment/clear-env");
const tester = require("@segment/analytics.js-integration-tester");
const GTM = require("..");

interface Window {
  dataLayer: any;
}

describe("GTM Enhanced", function() {
  let analytics: any;
  let gtm: any;

  let options = {
    containerId: "GTM-M8M29T",
    environment: "",
  };

  beforeEach(() => {
    analytics = new Analytics();
    gtm = new GTM(options);
    analytics.use(GTM);
    analytics.use(tester);
    analytics.add(gtm);
  });

  afterEach(() => {
    analytics.restore();
    analytics.reset();
    gtm.reset();
    sandbox();
  });

  describe("after loading", function() {
    let stub: any;

    beforeEach(done => {
      options = {
        containerId: "GTM-M8M29T",
        environment: "",
      };

      window["dataLayer"] = [];
      window["google_tag_manger"] = true;

      stub = jest.spyOn(window.dataLayer, "push");
      analytics.once("ready", done);
      analytics.initialize();
      analytics.page();
    });

    describe("#track", function() {
      it("should send event", function() {
        const anonId = analytics.user().anonymousId();

        analytics.track("some-event");

        expect(stub).toHaveBeenCalledWith({
          segmentAnonymousId: anonId,
          event: "some-event",
        });
      });
    });
  });
});
