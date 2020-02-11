"use strict";

const Analytics = require("@segment/analytics.js-core").constructor;
const integration = require("@segment/analytics.js-integration");
const sandbox = require("@segment/clear-env");
const tester = require("@segment/analytics.js-integration-tester");
const GTM = require("..");

interface Window {
  dataLayer: any;
}

describe("GTM Enhanced", () => {
  let analytics: any;
  let gtm: any;

  let options = {
    containerId: "GTM-M8M29T",
    environment: "",
    extraDimensions: ["retailer-id"],
  };

  beforeEach(done => {
    sandbox();

    analytics = new Analytics();
    gtm = new GTM(options);
    analytics.use(GTM);
    analytics.use(tester);
    analytics.add(gtm);

    window["dataLayer"] = [];
    window["google_tag_manger"] = true;

    analytics.once("ready", done);
    analytics.initialize();
    analytics.page();
  });

  describe("#track", () => {
    it("should send event", () => {
      const anonId = analytics.user().anonymousId();

      analytics.track("some-event");

      expect(window["dataLayer"]).toEqual([
        {
          segmentAnonymousId: anonId,
          event: "some-event",
        },
      ]);
    });

    it("tracks custom dimensions", () => {
      analytics.identify(1, { "retailer-id": "123" });

      analytics.track("test");

      expect(window["dataLayer"]).toEqual([
        expect.objectContaining({
          userId: 1,
          "retailer-id": "123",
        }),
      ]);
    });
  });

  describe("#productClicked", () => {
    it("maps to Enhanced Ecommerce spec", () => {
      const anonId = analytics.user().anonymousId();

      analytics.track("Product Clicked", {
        name: "Monopoly: 3rd jEdition",
        sku: "G-32",
        price: 18.99,
        category: "Games",
        brand: "Hasbro",
        variant: "200 pieces",
        quantity: 1,
        coupon: "MAYDEALS",
        position: 3,
        url: "https://www.example.com/product/path",
        image_url: "https://www.example.com/product/path.jpg",
      });

      expect(window["dataLayer"]).toEqual([
        expect.objectContaining({
          segmentAnonymousId: anonId,
          event: "productClick",
          ecommerce: {
            click: {
              products: expect.arrayContaining([
                {
                  id: "G-32",
                  name: "Monopoly: 3rd jEdition",
                  brand: "Hasbro",
                  category: "Games",
                  variant: "200 pieces",
                  currency: "USD",
                  price: 18.99,
                  quantity: 1,
                  coupon: "MAYDEALS",
                  position: 3,
                },
              ]),
            },
          },
        }),
      ]);
    });

    describe("#productAdded", () => {
      it("maps to Enhanced Ecommerce spec", () => {
        const anonId = analytics.user().anonymousId();

        analytics.track("Product Added", {
          name: "Monopoly: 3rd jEdition",
          sku: "G-32",
          price: 18.99,
          category: "Games",
          brand: "Hasbro",
          variant: "200 pieces",
          quantity: 1,
          coupon: "MAYDEALS",
          position: 3,
          url: "https://www.example.com/product/path",
          image_url: "https://www.example.com/product/path.jpg",
        });

        expect(window["dataLayer"]).toEqual([
          expect.objectContaining({
            segmentAnonymousId: anonId,
            event: "addToCart",
            ecommerce: {
              currencyCode: "USD",
              add: {
                products: [
                  {
                    id: "G-32",
                    name: "Monopoly: 3rd jEdition",
                    category: "Games",
                    quantity: 1,
                    price: 18.99,
                    brand: "Hasbro",
                    variant: "200 pieces",
                    currency: "USD",
                    position: 3,
                    coupon: "MAYDEALS",
                  },
                ],
              },
            },
          }),
        ]);
      });
    });

    describe("#checkoutStarted", () => {
      it("maps to Enhanced Ecommerce spec", () => {
        const cartValue = 18.99;
        const productData = {
          id: "G-32",
          name: "Monopoly: 3rd jEdition",
          category: "Games",
          quantity: 1,
          price: 18.99,
          brand: "Hasbro",
          variant: "200 pieces",
          currency: "USD",
          position: 3,
          coupon: "MAYDEALS",
        };

        analytics.track("Checkout Started", {
          order_id: "123",
          value: cartValue,
          currency: "USD",
          products: [{ ...productData }],
        });

        expect(window["dataLayer"]).toEqual([
          expect.objectContaining({
            event: "checkout",
            ecommerce: {
              checkout: {
                actionField: { step: 1 },
                products: [
                  {
                    brand: "Hasbro",
                    category: "Games",
                    coupon: "MAYDEALS",
                    currency: "USD",
                    id: "G-32",
                    name: "Monopoly: 3rd jEdition",
                    position: 3,
                    price: 18.99,
                    quantity: 1,
                    variant: "200 pieces",
                  },
                ],
              },
            },
          }),
        ]);
      });
    });

    describe("#orderComplete", () => {
      it("maps order complete to Enhanced Ecommerce spec", () => {
        analytics.track("Order Complete", {
          checkout_id: "123",
          step: 2,
        });

        expect(window["dataLayer"]).toEqual([
          expect.objectContaining({
            event: "checkout",
            ecommerce: {
              purchase: {
                actionField: {
                  id: "T12345", // Transaction ID. Required for purchases and refunds.
                  affiliation: "Online Store",
                  revenue: "35.43", // Total transaction value (incl. tax and shipping)
                  tax: "4.90",
                  shipping: "5.99",
                  coupon: "SUMMER_SALE",
                },
                products: [
                  {
                    // List of productFieldObjects.
                    name: "Triblend Android T-Shirt", // Name or ID is required.
                    id: "12345",
                    price: "15.25",
                    brand: "Google",
                    category: "Apparel",
                    variant: "Gray",
                    quantity: 1,
                    coupon: "", // Optional fields may be omitted or set to empty string.
                  },
                  {
                    name: "Donut Friday Scented T-Shirt",
                    id: "67890",
                    price: "33.75",
                    brand: "Google",
                    category: "Apparel",
                    variant: "Black",
                    quantity: 1,
                  },
                ],
              },
            },
          }),
        ]);
      });
    });

    it("tracks custom dimensions", () => {
      analytics.identify(1, { "retailer-id": "123" });

      analytics.track("Product Clicked", {
        sku: "G-32",
      });

      expect(window["dataLayer"]).toEqual([
        expect.objectContaining({
          userId: 1,
          "retailer-id": "123",
        }),
      ]);
    });
  });
});
