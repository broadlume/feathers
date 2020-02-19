const integration = require("@segment/analytics.js-integration");
const pushVars = require("global-queue")("__ctm_cvars", { wrap: false });

const CTMAnalytics = integration("CTM Analytics")
  .global("__ctm")
  .global("__ctm_loaded")
  .global("__ctm_cvars");

CTMAnalytics.prototype.identify = function(identify: any) {
  const traits: any = { ...identify.traits() };
  delete traits.id;

  if (identify.userId()) {
    traits.segmentUserId = identify.userId();
  } else {
    traits.segmentAnonymousId = identify.anonymousId();
  }

  pushVars(traits);
};

CTMAnalytics.prototype.loaded = function() {
  return !!window["__ctm_loaded"];
};

export default CTMAnalytics;
