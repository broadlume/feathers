# @adhawk/adwords-phone-tag

This package offers a simple way to install the plumbing for [Adwords call
tracking](https://support.google.com/google-ads/answer/6095883). No more
fussing about with hacky, one-off install scripts to make call tracking work.

## Usage

For all phone numbers on a page that you would like tracked, structure your
HTML with the relevant `phone-number--link` and `phone-number--text` classes,
like so:

```html
<a href="tel:1-800-REAL" class="phone-number--link">
  <span class="phone-number--text">
    <span>1-800-REAL</span>
  </span>
</a>
```

First, make sure to include `gtag`:

```html
<!-- Global site tag (gtag.js) - Google Ads: AW-CONVERSION_ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID">
```

Now, in a JavaScript file, install the tracking using this package:

```javascript
import * as AdwordsPhoneTag from "@adhawk/adwords-phone-tag";

const conversionId = "AW-111111111"; // replace with your own conversion id
const conversionLabel = "xxxxxx--xxxxxxxxxxx"; // replace with your own conversion label

AdwordsPhoneTag.install(conversionId, conversionLabel);
```

Now, when a visitor comes from an AdWords campaign, the phone number will be
replaced so conversions will be properly tracked.
