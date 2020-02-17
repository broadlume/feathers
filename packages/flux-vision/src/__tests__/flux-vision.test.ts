import FluxVision from "./../flux-vision";

describe("FluxVision", () => {
  it("initializes the class with analytics and shopify object", () => {
    const analytics = {
      track: jest.fn(),
    };

    const Shopify = {
      Checkout: { page: "page_one", step: "contact_information" },
    };

    const flux = new FluxVision({ analytics, Shopify });
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

      new FluxVision({ analytics, Shopify });

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
          {
            name: "{{item.title}}",
            price: "NaN",
            quantity: "{{item.quantity}}",
            sku: "{{item.sku}}",
            url: "{{item.url}}",
          },
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
  });
});
