import integration from "@segment/analytics.js-integration";
import globalQueue from "global-queue";
import pick from "lodash.pick";
import keys from "lodash.keys";
import { Track } from "segmentio-facade";

/* eslint-disable @typescript-eslint/no-explicit-any */

const push = globalQueue("dataLayer", { wrap: false }); // eslint-disable-line
interface Options {
  dimensions: { [key: string]: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enhancedUserInfo(analytics: any, opts: Options): object {
  const userId = analytics.user().id();
  const anonymousId = analytics.user().anonymousId();
  const userProps: any = {};
  const customDimensions = pick(
    analytics.user().traits(),
    keys(opts.dimensions),
  );

  if (userId) userProps.userId = userId;
  if (anonymousId) userProps.segmentAnonymousId = anonymousId;

  return { ...customDimensions, ...userProps };
}

function extractProductDimensions(
  track: any,
  opts: Options,
  analytics: any,
): object {
  const result = {};
  const props = track.properties();
  const userProps = enhancedUserInfo(analytics, opts);

  for (const key in opts.dimensions) {
    const dimNum = opts.dimensions[key];

    if (props[key]) {
      result[dimNum] = props[key];
    } else if (userProps[key]) {
      result[dimNum] = userProps[key];
    }
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
function enhancedEcommerceTrackProduct(
  track: any,
  opts: Options,
  analytics: any,
  extraProps = {},
) {
  const { brand, variant, position, productId, id, sku } = track.properties();

  const product: any = {
    ...extractProductDimensions(track, opts, analytics),
    id: productId || id || sku,
    name: track.name(),
    category: track.category(),
    price: track.price(),
    brand,
    variant,
  };

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#product-data
  // GA requires an integer but our specs says "Number", so it could be a float.
  if (position != null) {
    product.position = Math.round(position);
  }

  // append coupon if it set
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#measuring-transactions
  if (extraProps["coupon"]) {
    const coupon = track.proxy("properties.coupon");
    if (coupon) product.coupon = coupon;
  }

  if (extraProps["quantity"]) {
    product.quantity = track.quantity();
  }

  if (extraProps["currency"]) {
    product["currency"] = track.currency();
  }

  return product;
}

function getProductPosition(item: any, products: any): number {
  const position = item.properties().position;

  if (
    typeof position !== "undefined" &&
    !isNaN(Number(position)) &&
    Number(position) > -1
  ) {
    // If position passed and is valid positive number.
    return position;
  }
  return (
    products
      .map(function (x) {
        return x.product_id;
      })
      .indexOf(item.productId()) + 1
  );
}

function enhancedEcommerceTrackProducts(
  track: any,
  opts: Options,
  analytics: any,
  extraProps = {},
): object[] {
  const products = track.products();

  const result = [];

  for (const unmappedProduct of products) {
    const item = new Track({ properties: unmappedProduct });
    const props = item.properties();

    const impressionObj = {
      ...extractProductDimensions(track, opts, analytics),
      id: item.productId() || item.id() || item.sku(),
      name: item.name(),
      category: item.category() || track.category(),
      brand: item.properties().brand,
      price: item.price(),
      variant: props.variant,
      position: getProductPosition(item, products),
    };

    if (extraProps["coupon"]) {
      const coupon = item.proxy("properties.coupon");
      if (coupon) impressionObj["coupon"] = coupon;
    }

    if (extraProps["quantity"]) {
      impressionObj["quantity"] = item.quantity();
    }

    if (extraProps["currency"]) {
      impressionObj["currency"] = item.currency();
    }

    result.push(impressionObj);
  }

  return result;
}

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
  .option("loadTag", true)
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

EnhancedGTM.prototype.initialize = function (): void {
  if (this.options.loadTag === false) {
    this.ready();
    return;
  }

  push({ "gtm.start": Number(new Date()), event: "gtm.js" });

  if (this.options.environment.length) {
    this.load("with-env", this.options, this.ready);
  } else {
    this.load("no-env", this.options, this.ready);
  }
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */
EnhancedGTM.prototype.loaded = function (): boolean {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
EnhancedGTM.prototype.page = function (page: any): void {
  const opts = this.options;

  // all
  if (opts.trackAllPages) {
    push({
      ...enhancedUserInfo(this.analytics, opts),
      event: "Loaded a Page",
      page: { ...page.properties() },
    });
  }
};

/**
 * Page.
 *
 * @api public
 * @param {Page} identify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
EnhancedGTM.prototype.identify = function (identify: any): void {
  const opts = this.options;

  push({
    ...enhancedUserInfo(this.analytics, opts),
    user: { ...identify.traits() },
  });
};

/**
 * Track.
 *
 * https://developers.google.com/tag-manager/devguide#events
 *
 * @api public
 * @param {Track} track
 */
EnhancedGTM.prototype.track = function (track: any): void {
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
EnhancedGTM.prototype.productClicked = function (track: any): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const product = enhancedEcommerceTrackProduct(
    track,
    this.options,
    this.analytics,
    { coupon: true, currency: true, quantity: true },
  );

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

EnhancedGTM.prototype.productViewed = function (track: any): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const product = enhancedEcommerceTrackProduct(
    track,
    this.options,
    this.analytics,
    { coupon: true, currency: true, quantity: true },
  );

  push({
    ...userProps,
    ecommerce: {
      detail: {
        actionField: {},
        products: [product],
      },
    },
  });
};

EnhancedGTM.prototype.productListViewed = function (track: any): void {
  const props = track.properties();
  const userProps = enhancedUserInfo(this.analytics, this.options);

  const impressions = enhancedEcommerceTrackProducts(
    track,
    this.options,
    this.analytics,
    { coupon: false, currency: false, quantity: false },
  );

  for (const impression of impressions) {
    impression["list"] = props.list_id || track.category() || "search results";
  }

  push({
    ...userProps,
    ecommerce: {
      impressions,
    },
  });
};

EnhancedGTM.prototype.productListFiltered = function (track: any): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);

  const impressions = enhancedEcommerceTrackProducts(
    track,
    this.options,
    this.analytics,
    { coupon: false, currency: false, quantity: false },
  );

  const props = track.properties();
  props.filters = props.filters || [];
  props.sorters = props.sorters || [];
  const filters = props.filters.map((obj) => obj.type + ":" + obj.value).join();
  const sorts = props.sorts.map((obj) => obj.type + ":" + obj.value).join();

  for (const impression of impressions) {
    impression["variant"] = `${filters}::${sorts}`;
    impression["list"] = props.list_id || track.category() || "search results";
  }

  push({
    ...userProps,
    ecommerce: {
      impressions,
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

EnhancedGTM.prototype.productAdded = function (track: any): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const product = enhancedEcommerceTrackProduct(
    track,
    this.options,
    this.analytics,
    { coupon: true, currency: true, quantity: true },
  );

  push({
    ...userProps,
    event: "addToCart",
    ecommerce: {
      currencyCode: product.currency,
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

EnhancedGTM.prototype.checkoutStarted = function (track: any): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);

  push({
    ...userProps,
    event: "checkout",
    ecommerce: {
      checkout: {
        actionField: { step: 1 },
        products: enhancedEcommerceTrackProducts(
          track,
          this.options,
          this.analytics,
          { coupon: true, currency: true, quantity: true },
        ),
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

EnhancedGTM.prototype.checkoutStepViewed = function (track): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const step = track.properties().step;

  push({
    ...userProps,
    event: "checkout",
    ecommerce: {
      checkout: {
        actionField: { step: step },
        products: enhancedEcommerceTrackProducts(
          track,
          this.options,
          this.analytics,
          { coupon: true, currency: true, quantity: true },
        ),
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

EnhancedGTM.prototype.orderCompleted = function (track): void {
  const userProps = enhancedUserInfo(this.analytics, this.options);
  const total = track.total() || track.revenue() || 0;
  const props = track.properties();

  push({
    ...userProps,
    event: "purchase",
    ecommerce: {
      purchase: {
        actionField: {
          id: track.orderId(),
          affiliation: props.affiliation,
          revenue: total,
          tax: track.tax(),
          shipping: track.shipping(),
        },
        products: enhancedEcommerceTrackProducts(
          track,
          this.options,
          this.analytics,
          { coupon: true, currency: true, quantity: true },
        ),
      },
    },
  });
};

export default EnhancedGTM;
