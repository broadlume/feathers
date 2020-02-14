export default function() {
  // add html elements we need to pull data off of
  const htmlText = `<div style='display:none'> <div id="checkout-data" data-checkout-id={{checkout.id}} data-order-number={{checkout.order_number}} data-total-price={{checkout.total_price}} ></div>{% for item in checkout.line_items %} <div id="product-item-for-analytics-dataset" data-name="{{item.title}}" data-sku="{{item.sku}}" data-price="{{item.price}}" data-quantity="{{item.quantity}}" data-url="{{item.url}}" > </div>{% endfor %}</div>`;
  const body = document.querySelector("body");
  body.insertAdjacentHTML("beforeend", htmlText);

  // Analytics: FF main account
  const productAnalyticDatasetArray = [];

  const currentStep = Shopify.Checkout.step;
  const currentPage = Shopify.Checkout.page;

  // Get DOM elements with checkout data
  const dataset = document.querySelector("#checkout-data").dataset;
  const productsDatasets = document.querySelectorAll(
    "#product-item-for-analytics-dataset",
  );

  for (const i = 0; i < productsDatasets.length; i++) {
    const productDataset = productsDatasets[i].dataset;
    if (productDataset) {
      const formattedPrice = (productDataset.price / 100).toFixed(2);
      productDataset.price = formattedPrice;
      const objectProduct = Object.assign({}, productDataset);

      productAnalyticDatasetArray.push(objectProduct);
    }
  }

  //   console.log('productAnalyticDatasetArray', productAnalyticDatasetArray)

  switch (currentStep) {
    case "contact_information":
      analytics.track("Checkout Started", {
        order_id: dataset.orderNumber,
        value: dataset.orderPrice,
        currency: "USD",
        products: productAnalyticDatasetArray,
      });
    case "shipping_method":
      analytics.track("Checkout Step Viewed", {
        checkout_id: dataset.checkoutId,
        step: 2,
        products: productAnalyticDatasetArray,
      });
    case "payment_method":
      analytics.track("Checkout Step Viewed", {
        checkout_id: dataset.checkoutId,
        step: 3,
        products: productAnalyticDatasetArray,
      });
    default:
      break;
  }

  if (currentPage == "thank_you") {
    analytics.track("Order Completed", {
      checkout_id: dataset.checkoutId,
      order_id: dataset.orderId,
      total: dataset.orderPrice,
      currency: "USD",
      products: productAnalyticDatasetArray,
    });
  }
}
