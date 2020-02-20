export default class FluxVision {
  htmlDataElements: string;
  checkoutDataset: any;
  productData: any[];
  Shopify: any;
  analytics: any;
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

  public init() {
    try {
      this.checkDomForSelector();
      this.pullDataFromDOM();
      this.sendAnalytics();
    } catch (error) {
      throw new Error(`Flux Vision ${error}`);
    }
  }

  private checkDomForSelector() {
    const { liquidDivSelector } = this;
    try {
      const liquidElement = document.querySelector(liquidDivSelector);
      if (!liquidElement) {
        throw `no liquid element found with selector ${liquidDivSelector}. Learn more at https://github.com/adHawk/feathers/tree/master/packages/flux-vision`;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  private pullDataFromDOM() {
    let { productData } = this;

    //checkout data
    const checkoutElemement: any = document.querySelector("#checkout-data");
    this.checkoutDataset = Object.assign({}, checkoutElemement.dataset);

    // product data
    const productsDatasets: any = document.querySelectorAll(
      "#product-item-for-analytics-dataset",
    );

    for (let i = 0; i < productsDatasets.length; i++) {
      const productDataset = productsDatasets[i].dataset;
      if (productDataset) {
        const formattedPrice = (productDataset.price / 100).toFixed(2);
        productDataset.price = formattedPrice;
        const objectProduct = Object.assign({}, productDataset);
        productData.push(objectProduct);
      }
    }
  }

  private sendAnalytics() {
    const { analytics, checkoutDataset, productData } = this;
    const {
      currentStep,
      currentPage,
      isOrderStatusPage,
    } = this.getCurrentEnvironment();

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

    if (currentPage == "thank_you" || isOrderStatusPage) {
      analytics.track("Order Completed", {
        checkout_id: checkoutDataset.checkoutId,
        order_id: checkoutDataset.orderNumber,
        total: checkoutDataset.totalPrice,
        currency: "USD",
        products: productData,
      });
    }
  }

  private getCurrentEnvironment() {
    const { Shopify } = this;

    return {
      currentStep: Shopify.Checkout.step,
      currentPage: Shopify.Checkout.page,
      isOrderStatusPage: Shopify.Checkout.isOrderStatusPage,
    };
  }
}
