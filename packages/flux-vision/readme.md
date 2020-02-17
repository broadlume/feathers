# @adhawk/flux-vision

Tracks end of funnel E-commerce data for your Shopify checkout. Gather in-depth analytics about product information, checkout steps viewed, purchase complete and more. Automatically integrated with Segment.io to allow you to send data to any number of destinations including Google Analytics, Google Tag Manager and more.

## Liquid Template HTML

To enable this package to pull liquid template data from Shopify into Segment, you must add this to the end of the `<body>` tag.

```html
<div id="FLUX_VISION_DATASETS" style="display:none">
  <div
    id="checkout-data"
    data-checkout-id="{{checkout.id}}"
    data-order-number="{{checkout.order_number}}"
    data-total-price="{{checkout.total_price}}"
  ></div>
  {% for item in checkout.line_items %}
  <div
    id="product-item-for-analytics-dataset"
    data-name="{{item.title}}"
    data-sku="{{item.sku}}"
    data-price="{{item.price}}"
    data-quantity="{{item.quantity}}"
    data-url="{{item.url}}"
  ></div>
  {% endfor %}
</div>
```
