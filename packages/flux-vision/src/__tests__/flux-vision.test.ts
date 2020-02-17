import FluxVision from "./../flux-vision";

describe("FluxVision", () => {
  // clean up divs added to document in test environment
  afterEach(() => {
    var data = document.getElementById("TEST_ID_ENV");
    if (data) {
      data.remove();
    }
  });

  it("initializes the class with analytics and shopify object", () => {
    const analytics = {
      track: jest.fn(),
    };

    const Shopify = {
      Checkout: { page: "page_one", step: "contact_information" },
    };

    const flux = new FluxVision({ analytics, Shopify });
    flux.init();
    expect(flux.analytics).toEqual(analytics);
    expect(flux.currentPage).toEqual("page_one");
    expect(flux.currentStep).toEqual("contact_information");
  });

  it("pulls correct dom element data (liquid template style)", () => {
    const analytics = {
      track: jest.fn(),
    };

    const Shopify = {
      Checkout: { page: "page_one", step: "contact_information" },
    };

    const flux = new FluxVision({ analytics, Shopify });
    flux.init();

    expect(flux.checkoutDataset).toEqual({
      checkoutId: "{{checkout.id}}",
      orderNumber: "{{checkout.order_number}}",
      totalPrice: "{{checkout.total_price}}",
    });

    expect(flux.productData).toEqual([
      {
        name: "{{item.title}}",
        price: "NaN",
        quantity: "{{item.quantity}}",
        sku: "{{item.sku}}",
        url: "{{item.url}}",
      },
    ]);
  });

  describe("Analytics", () => {
    it("sends the correct checkout start event", () => {
      const analyticsTrackMock = jest.fn();
      const analytics = {
        track: analyticsTrackMock,
      };

      const Shopify = {
        Checkout: { page: "page_one", step: "contact_information" },
      };

      const flux = new FluxVision({ analytics, Shopify });
      flux.init();

      console.log(flux.productData);

      expect(analyticsTrackMock).toHaveBeenCalledTimes(1);
      expect(analyticsTrackMock).toHaveBeenCalledWith("Checkout Started", {
        currency: "USD",
        order_id: "{{checkout.order_number}}",
        products: [
          {
            name: "{{item.title}}",
            price: "NaN",
            quantity: "{{item.quantity}}",
            sku: "{{item.sku}}",
            url: "{{item.url}}",
          },
        ],
        value: undefined,
      });
    });

    it("sends the correct checkout step 2 event for shipping_method", () => {
      const analyticsTrackMock = jest.fn();
      const analytics = {
        track: analyticsTrackMock,
      };

      const Shopify = {
        Checkout: { page: "page_one", step: "shipping_method" },
      };

      const flux = new FluxVision({ analytics, Shopify });
      flux.init();

      expect(analyticsTrackMock).toHaveBeenCalledTimes(1);
      expect(analyticsTrackMock).toHaveBeenCalledWith("Checkout Step Viewed", {
        checkout_id: "{{checkout.id}}",
        products: [
          {
            name: "{{item.title}}",
            price: "NaN",
            quantity: "{{item.quantity}}",
            sku: "{{item.sku}}",
            url: "{{item.url}}",
          },
        ],
        step: 2,
      });
    });

    it("sends the correct checkout step 3 event for payment_method", () => {
      const analyticsTrackMock = jest.fn();
      const analytics = {
        track: analyticsTrackMock,
      };

      const Shopify = {
        Checkout: { page: "page_one", step: "payment_method" },
      };

      const flux = new FluxVision({ analytics, Shopify });
      flux.init();

      expect(analyticsTrackMock).toHaveBeenCalledTimes(1);
      expect(analyticsTrackMock).toHaveBeenCalledWith("Checkout Step Viewed", {
        checkout_id: "{{checkout.id}}",
        products: [
          {
            name: "{{item.title}}",
            price: "NaN",
            quantity: "{{item.quantity}}",
            sku: "{{item.sku}}",
            url: "{{item.url}}",
          },
        ],
        step: 3,
      });
    });

    it("sends the correct event for purchase", () => {
      const analyticsTrackMock = jest.fn();
      const analytics = {
        track: analyticsTrackMock,
      };

      const Shopify = {
        Checkout: { page: "thank_you", step: "processing" },
      };

      const flux = new FluxVision({ analytics, Shopify });
      flux.init();

      expect(analyticsTrackMock).toHaveBeenCalledTimes(1);
      expect(analyticsTrackMock).toHaveBeenCalledWith("Order Completed", {
        checkout_id: "{{checkout.id}}",
        currency: "USD",
        order_id: undefined,
        total: undefined,
        products: [
          {
            name: "{{item.title}}",
            price: "NaN",
            quantity: "{{item.quantity}}",
            sku: "{{item.sku}}",
            url: "{{item.url}}",
          },
        ],
      });
    });
  });
});
