import FluxVision from "./../flux-vision";

describe("FluxVision", () => {
  // clean up divs added to document in test environment
  afterEach(() => {
    const data = document.getElementById("FLUX_VISION_DATASETS");
    if (data) {
      data.remove();
    }
  });

  beforeEach(() => {
    const data = document.querySelector("body");
    data.insertAdjacentHTML(
      "beforeend",
      `
          <div id="FLUX_VISION_DATASETS" style='display:none'> 
              <div 
                  id="checkout-data" 
                  data-checkout-id={{checkout.id}} 
                  data-order-number={{checkout.order_number}} 
                  data-total-price={{checkout.total_price}} 
              >
              </div>
              <div 
                  id="product-item-for-analytics-dataset" 
                  data-name="{{item.title}}" 
                  data-sku="{{item.sku}}" 
                  data-price="{{item.price}}" 
                  data-quantity="{{item.quantity}}" 
                  data-url="{{item.url}}" 
              > 
              </div>
          </div>
      `,
    );
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
        order_id: "{{checkout.order_number}}",
        total: "{{checkout.total_price}}",
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

describe("Flux Vision Errors", () => {
  beforeEach(() => {
    const data = document.getElementById("FLUX_VISION_DATASETS");
    if (data) {
      data.remove();
    }
  });

  it("throws an error if no div is found on the document", () => {
    const analyticsTrackMock = jest.fn();
    const analytics = {
      track: analyticsTrackMock,
    };

    const Shopify = {
      Checkout: { page: "thank_you", step: "processing" },
    };

    const flux = new FluxVision({ analytics, Shopify });
    expect(() => {
      flux.init();
    }).toThrowError(
      new Error(
        "No liquid element found with selector #FLUX_VISION_DATASETS. Learn more at https://github.com/broadlume/feathers/tree/master/packages/flux-vision",
      ),
    );
  });
});
