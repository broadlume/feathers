const integration = require("@segment/analytics.js-integration");
const push = require("global-queue")("dataLayer", { wrap: false });
const dot = require("obj-case");
const pick = require("lodash.pick");

/**
 * Expose `GTM`.
 */
const EnhancedGTM = integration("GTM Enhanced")
  .global("dataLayer")
  .global("google_tag_manager")
  .option("containerId", "")
  .option("environment", "")
  .option("extraDimensions", [])
  .option("trackNamedPages", true)
  .option("trackCategorizedPages", true)
  .tag(
    "no-env",
    '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">',
  )
  .tag(
    "with-env",
    '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer&gtm_preview={{ environment }}">',
  );

/**
 * Initialize.
 *
 * https://developers.google.com/tag-manager
 *
 * @api public
 */

EnhancedGTM.prototype.initialize = function() {
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
EnhancedGTM.prototype.loaded = function() {
  if (process.env.NODE_ENV === "test") {
    return !!window["dataLayer"];
  }

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
EnhancedGTM.prototype.page = function(page: any) {
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
EnhancedGTM.prototype.track = function(track: any) {
  const props = track.properties();
  props.event = track.event();

  push({ ...enhancedUserInfo(this.analytics, this.options), ...props });
};

/**
 * Product Clicked.
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#product-data
 *
 * @api public
 * @param {Track} track
 */
EnhancedGTM.prototype.productClicked = function(track: any) {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const product = enhancedEcommerceTrackProduct(track, this.options);

  push({
    ...userProps,
    event: "productClick",
    ecommerce: {
      click: {
        products: [product],
      },
    },
  });
};

/**
 * Added product - Enhanced Ecommerce
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#add-remove-cart
 *
 * @api private
 */

EnhancedGTM.prototype.productAdded = function(track: any) {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const product = enhancedEcommerceTrackProduct(track, this.options);

  push({
    ...userProps,
    event: "addToCart",
    ecommerce: {
      currencyCode: "USD",
      add: {
        products: [product],
      },
    },
  });
};

/**
 * Started order - Enhanced Ecommerce
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#checkout-steps
 *
 * @api private
 */

EnhancedGTM.prototype.checkoutStarted = function(track) {
  const userProps = enhancedUserInfo(this.analytics, this.options);

  push({
    ...userProps,
    event: "checkout",
    ecommerce: {
      checkout: {
        actionField: { step: 1 },
        products: track.products(),
      },
    },
  });
};

/**
 * Viewed checkout step - Enhanced Ecommerce
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#checkout-steps
 *
 * @api private
 */

EnhancedGTM.prototype.checkoutStepViewed = function(track) {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const step = track.properties().step;

  push({
    ...userProps,
    event: "checkout",
    ecommerce: {
      checkout: {
        actionField: { step: step },
        products: track.products(),
      },
    },
  });
};

/**
 * Completed order - Enhanced Ecommerce
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-transactions
 * @api private
 */

EnhancedGTM.prototype.orderCompleted = function(track) {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const total = track.total() || track.revenue() || 0;
  const props = track.properties();

  push({
    ...userProps,
    ecommerce: {
      purchase: {
        actionField: {
          id: track.orderId(),
          affiliation: props.affiliation,
          revenue: total,
          tax: track.tax(),
          shipping: track.shipping(),
        },
        products: track.products(),
      },
    },
  });
};

function enhancedUserInfo(analytics: any, opts: any) {
  const userId = analytics.user().id();
  const anonymousId = analytics.user().anonymousId();
  const userProps: any = {};
  const customDimensions = pick(
    analytics.user().traits(),
    opts.extraDimensions,
  );

  if (userId) userProps.userId = userId;
  if (anonymousId) userProps.segmentAnonymousId = anonymousId;

  return { ...customDimensions, ...userProps };
}

function enhancedEcommerceTrackProduct(track: any, _opts: any) {
  const props = track.properties();
  const product: any = {
    id: track.productId() || track.id() || track.sku(),
    name: track.name(),
    category: track.category(),
    quantity: track.quantity(),
    price: track.price(),
    brand: props.brand,
    variant: props.variant,
    currency: track.currency(),
  };

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#product-data
  // GA requires an integer but our specs says "Number", so it could be a float.
  if (props.position != null) {
    product.position = Math.round(props.position);
  }

  // append coupon if it set
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-transactions
  const coupon = track.proxy("properties.coupon");
  if (coupon) product.coupon = coupon;

  return product;
}

module.exports = EnhancedGTM;
