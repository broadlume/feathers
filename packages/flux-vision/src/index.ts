import FluxVision from "./flux-vision";

declare global {
  interface Window {
    Shopify: any;
    analytics: any;
  }
}

export default (function() {
  new FluxVision({ Shopify: window.Shopify, analytics: window.analytics });
})();
