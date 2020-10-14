/* eslint-disable @typescript-eslint/camelcase */
export default class FluxVision {
  htmlDataElements: string;
  checkoutDataset: DOMStringMap;
  productData: DOMStringMap[];
  Shopify: { Checkout: { page: unknown; step: unknown } };
  analytics: SegmentAnalytics.AnalyticsJS;
  liquidDivSelector: string;

  constructor({
    analytics,
    Shopify,
    liquidDivSelector = "#FLUX_VISION_DATASETS",
  }) {
    this.productData = [];
    this.analytics = analytics;
    this.Shopify = Shopify;
    this.liquidDivSelector = liquidDivSelector;
  }

  public init(): void {
    this.checkDomForSelector();
    this.pullDataFromDOM();
    this.sendAnalytics();
  }

  private checkDomForSelector(): void {
    const { liquidDivSelector } = this;
    const liquidElement = document.querySelector(liquidDivSelector);
    if (!liquidElement) {
      throw new Error(
        `No liquid element found with selector ${liquidDivSelector}. Learn more at https://github.com/broadlume/feathers/tree/master/packages/flux-vision`,
      );
    }
  }

  private pullDataFromDOM(): void {
    const { productData } = this;

    //checkout data
    const checkoutElemement = document.querySelector<HTMLDataElement>(
      "#checkout-data",
    );
    this.checkoutDataset = Object.assign({}, checkoutElemement.dataset);

    // product data
    const productsDatasets = document.querySelectorAll<HTMLDataElement>(
      "#product-item-for-analytics-dataset",
    );

    for (let i = 0; i < productsDatasets.length; i++) {
      const productDataset = productsDatasets[i].dataset;
      if (productDataset) {
        const formattedPrice = (Number(productDataset.price) / 100).toFixed(2);
        productDataset.price = formattedPrice;
        const objectProduct = Object.assign({}, productDataset);
        productData.push(objectProduct);
      }
    }
  }

  private sendAnalytics(): void {
    const { analytics, checkoutDataset, productData } = this;
    const { currentStep, currentPage } = this.getCurrentEnvironment();

    switch (currentStep) {
      case "contact_information":
        analytics.track("Checkout Started", {
          order_id: checkoutDataset.orderNumber,
          value: checkoutDataset.orderPrice,
          currency: "USD",
          products: productData,
        });
        break;
      case "shipping_method":
        analytics.track("Checkout Step Viewed", {
          checkout_id: checkoutDataset.checkoutId,
          step: 2,
          products: productData,
        });
        break;
      case "payment_method":
        analytics.track("Checkout Step Viewed", {
          checkout_id: checkoutDataset.checkoutId,
          step: 3,
          products: productData,
        });
        break;
      default:
        break;
    }

    if (currentPage == "thank_you") {
      analytics.track("Order Completed", {
        checkout_id: checkoutDataset.checkoutId,
        order_id: checkoutDataset.orderNumber,
        total: checkoutDataset.totalPrice,
        currency: "USD",
        products: productData,
      });
    }
  }

  private getCurrentEnvironment(): {
    currentStep: unknown;
    currentPage: unknown;
  } {
    const { Shopify } = this;

    return {
      currentStep: Shopify.Checkout.step,
      currentPage: Shopify.Checkout.page,
    };
  }
}
