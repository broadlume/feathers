import FluxVision from "./flux-vision";

declare global {
  interface Window {
    Shopify: any;
    analytics: any;
  }
}

export default (function() {
  const flux = new FluxVision({
    Shopify: window.Shopify,
    analytics: window.analytics,
  });
  flux.init();
  console.log("Loading Flux Vision!");
})();
