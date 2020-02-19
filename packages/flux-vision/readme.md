# @adhawk/flux-vision

Tracks end of funnel E-Commerce data for your Shopify checkout.

Gather in-depth analytics about product information, checkout steps viewed, and purchases

This package utilizes Segment.io to allow you to send data to any number of destinations including Google Analytics, Google Tag Manager and more.

## Steps to install

1.  Go to your Shopify Checkout Theme and open the "Edit Code" dashboard. Open the `checkout.liquid` template file and add your Segment.io script within the `<head>` tag like below:

```html
<head>
  <script type="text/javascript">
    //  insert your segment io script here
  </script>
</head>
```

1. Go to your Shopify Checkout Theme and open the "Edit Code" dashboard. Open the `checkout.liquid` template file and add the following to the end of the `<body>` tag.

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

1. Then add the following script to import this package and automatically send `analytic.track()` events populated with checkout data.

```html
<html>
  <body>
    <!-- ...body contents here -->
  </body>
</html>

<!-- Add this script in after the </html> -->
<script src="https://unpkg.com/@adhawk/flux-vision/lib/flux-vision.umd.min.js"></script>
```

That's it!
