"use strict";

/**
 * Module dependencies.
 */

const integration = require("@segment/analytics.js-integration");
const push = require("global-queue")("dataLayer", { wrap: false });

/**
 * Expose `GTM`.
 */
const GTM = (module.exports = integration("Google Tag Manager")
  .global("dataLayer")
  .global("google_tag_manager")
  .option("containerId", "")
  .option("environment", "")
  .option("trackNamedPages", true)
  .option("trackCategorizedPages", true)
  .tag(
    "no-env",
    '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">',
  )
  .tag(
    "with-env",
    '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer&gtm_preview={{ environment }}">',
  ));

/**
 * Initialize.
 *
 * https://developers.google.com/tag-manager
 *
 * @api public
 */

GTM.prototype.initialize = function() {
  if (process.env.NODE_ENV === "test") {
    this.ready();
  } else {
    push({ "gtm.start": Number(new Date()), event: "gtm.js" });

    if (this.options.environment.length) {
      this.load("with-env", this.options, this.ready);
    } else {
      this.load("no-env", this.options, this.ready);
    }
  }
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */
GTM.prototype.loaded = function() {
  return !!(
    window["dataLayer"] && Array.prototype.push !== window["dataLayer"].push
  );
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

GTM.prototype.page = function(page: any) {
  const category = page.category();
  const name = page.fullName();
  const opts = this.options;

  // all
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Track.
 *
 * https://developers.google.com/tag-manager/devguide#events
 *
 * @api public
 * @param {Track} track
 */

GTM.prototype.track = function(track: any) {
  const props = track.properties();
  const userId = this.analytics.user().id();
  const anonymousId = this.analytics.user().anonymousId();

  if (userId) props.userId = userId;
  if (anonymousId) props.segmentAnonymousId = anonymousId;

  props.event = track.event();

  push(props);
};
