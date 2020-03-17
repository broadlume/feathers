import GTM from "@adhawk/gtm-enhanced";

const Analytics = require("@segment/analytics.js-core").constructor;
const sandbox = require("@segment/clear-env");

interface Window {
  dataLayer: any;
}

describe("GTM Enhanced", () => {
  let analytics: any;

  const options = {
    trackAllPages: true,
    containerId: "GTM-M8M29T",
    environment: "",
    extraDimensions: ["retailer-id"],
    loadTag: false,
  };

  beforeEach(done => {
    window["dataLayer"] = [];
    window["google_tag_manager"] = true;
    analytics = new Analytics();
    analytics.use(GTM);
    analytics.once("ready", done);
    analytics.initialize({ "GTM Enhanced": options });
  });

  afterEach(() => {
    analytics.reset();
    analytics.user().reset();
    analytics.group().reset();
    window["dataLayer"] = [];
    localStorage.clear();
    sandbox();
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

      expect(window["dataLayer"][1]).toEqual(
        expect.objectContaining({
          userId: 1,
          "retailer-id": "123",
        }),
      );
    });
  });

  describe("#identify", () => {
    it("nests the user data with properties", () => {
      analytics.identify(1, { "retailer-id": "123", email: "foo@bar.com" });

      expect(window["dataLayer"][0]).toEqual(
        expect.objectContaining({
          user: expect.objectContaining({ email: "foo@bar.com" }),
        }),
      );
    });
  });

  describe("#page", () => {
    it("nests the page data with name", () => {
      analytics.page("My Page");

      expect(window["dataLayer"]).toEqual([
        expect.objectContaining({
          event: "Loaded a Page",
          page: expect.objectContaining({ name: "My Page" }),
        }),
      ]);
    });

    it("nests the page data with name and category", () => {
      analytics.page("Core Website", "My Page");

      expect(window["dataLayer"]).toEqual([
        expect.objectContaining({
          event: "Loaded a Page",
          page: expect.objectContaining({
            category: "Core Website",
            name: "My Page",
          }),
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

    describe("#checkoutStepViewed", () => {
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

      it("maps to Enhanced Ecommerce spec", () => {
        analytics.track("Checkout Step Viewed", {
          checkout_id: "1234",
          step: 2,
          products: [{ ...productData }],
        });

        expect(window["dataLayer"]).toEqual([
          expect.objectContaining({
            event: "checkout",
            ecommerce: {
              checkout: {
                actionField: { step: 2 },
                products: [{ ...productData }],
              },
            },
          }),
        ]);
      });
    });

    describe("#orderCompleted", () => {
      it("maps order completed to Enhanced Ecommerce spec", () => {
        const anonId = analytics.user().anonymousId();
        const products = [
          {
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
          },
        ];

        analytics.track("Order Completed", {
          checkout_id: "fksdjfsdjfisjf9sdfjsd9f",
          order_id: "50314b8e9bcf000000000000",
          affiliation: "Google Store",
          total: 27.5,
          subtotal: 22.5,
          revenue: 25.0,
          shipping: 3,
          tax: 2,
          discount: 2.5,
          currency: "USD",
          products: products,
        });

        expect(window["dataLayer"]).toEqual([
          expect.objectContaining({
            segmentAnonymousId: anonId,
            event: "purchase",
            ecommerce: {
              purchase: {
                actionField: {
                  id: "50314b8e9bcf000000000000",
                  affiliation: "Google Store",
                  revenue: 27.5,
                  tax: 2,
                  shipping: 3,
                },
                products: products,
              },
            },
          }),
        ]);
      });
    });

    describe("#productViewed", () => {
      it("maps to Enhanced Ecommerce spec", () => {
        const anonId = analytics.user().anonymousId();

        analytics.track("Product Viewed", {
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
            ecommerce: {
              detail: {
                actionField: {},
                products: [
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

      expect(window["dataLayer"][1]).toEqual(
        expect.objectContaining({
          userId: 1,
          "retailer-id": "123",
        }),
      );
    });
  });
});
