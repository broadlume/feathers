const defaultHTMLData = `<div style='display:none'> <div id="checkout-data" data-checkout-id={{checkout.id}} data-order-number={{checkout.order_number}} data-total-price={{checkout.total_price}} ></div>{% for item in checkout.line_items %} <div id="product-item-for-analytics-dataset" data-name="{{item.title}}" data-sku="{{item.sku}}" data-price="{{item.price}}" data-quantity="{{item.quantity}}" data-url="{{item.url}}" > </div>{% endfor %}</div>`;

export default class FluxVision {
  htmlDataElements: string;
  checkoutDataset: any;
  productData: any[];
  Shopify: any;
  currentStep: any;
  currentPage: any;
  analytics: any;

  constructor({ htmlDataElements = defaultHTMLData, analytics, Shopify }) {
    this.htmlDataElements = htmlDataElements;
    this.productData = [];
    this.analytics = analytics;
    this.Shopify = Shopify;

    // Add html elements with product / checkout data
    const body = document.querySelector("body");
    body.insertAdjacentHTML("beforeend", htmlDataElements);

    this.setCurrentEnvironment();
    this.pullDataFromDOM();
    this.sendAnalytics();
  }

  private sendAnalytics() {
    const {
      analytics,
      currentStep,
      currentPage,
      checkoutDataset,
      productData,
    } = this;

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
        order_id: checkoutDataset.orderId,
        total: checkoutDataset.orderPrice,
        currency: "USD",
        products: productData,
      });
    }
  }

  private setCurrentEnvironment() {
    const { Shopify } = this;
    this.currentStep = Shopify.Checkout.step;
    this.currentPage = Shopify.Checkout.page;
  }

  private pullDataFromDOM() {
    // Analytics: FF main account
    let { productData } = this;
    // Pull in html elements with data
    const checkoutElemement: any = document.querySelector("#checkout-data");
    this.checkoutDataset = Object.assign({}, checkoutElemement.dataset);
    const productsDatasets: any = document.querySelectorAll(
      "#product-item-for-analytics-dataset",
    );

    if (productsDatasets) {
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
  }
}
