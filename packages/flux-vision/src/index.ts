import FluxVision from "./flux-vision";

declare global {
  interface Window {
    Shopify: { Checkout: { page: unknown; step: number } };
    analytics: any;
  }
}

export default (function(): void {
  const flux = new FluxVision({
    Shopify: window.Shopify,
    analytics: window.analytics,
  });
  flux.init();
})();
