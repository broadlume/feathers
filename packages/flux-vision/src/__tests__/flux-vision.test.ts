import FluxVision from "./../";

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
});
