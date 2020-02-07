"use strict";

//  @ts-ignore
var Analytics = require("@segment/analytics.js-core").constructor;
//  @ts-ignore
var integration = require("@segment/analytics.js-integration");
//  @ts-ignore
var sandbox = require("@segment/clear-env");
//  @ts-ignore
var tester = require("@segment/analytics.js-integration-tester");
//  @ts-ignore
var GTM = require("..");

describe("Google Tag Manager", function() {
  //  @ts-ignore
  var analytics;
  //  @ts-ignore
  var gtm;
  //  @ts-ignore
  var options = {
    containerId: "GTM-M8M29T",
    environment: "",
  };

  beforeEach(function() {
    //  @ts-ignore
    analytics = new Analytics();
    gtm = new GTM(options);
    analytics.use(GTM);
    analytics.use(tester);
    analytics.add(gtm);
  });

  afterEach(function() {
    //  @ts-ignore
    analytics.restore();
    //  @ts-ignore
    analytics.reset();
    //  @ts-ignore
    gtm.reset();
    //  @ts-ignore
    sandbox();
  });

  describe("after loading", function() {
    let stub: any;

    beforeEach(function(done) {
      //  @ts-ignore
      options = {
        containerId: "GTM-M8M29T",
        environment: "",
      };
      //@ts-ignore
      stub = jest.spyOn(window.dataLayer, "push");
      //  @ts-ignore
      analytics.once("ready", done);
      //  @ts-ignore
      analytics.initialize();
      //  @ts-ignore
      analytics.page();
    });

    describe("#track", function() {
      it("should send event", function() {
        // @ts-ignore
        window.google_tag_manger = true;
        //  @ts-ignore
        var anonId = analytics.user().anonymousId();
        //  @ts-ignore
        analytics.track("some-event");

        expect(stub).toHaveBeenCalledWith({
          segmentAnonymousId: anonId,
          event: "some-event",
        });
      });
    });
  });
});
