import FluxVision from "./flux-vision";

declare global {
  interface Window {
    Shopify: { Checkout: { page: unknown; step: number } };
    analytics: SegmentAnalytics.AnalyticsJS;
  }
}

export default (function(): void {
  const flux = new FluxVision({
    Shopify: window.Shopify,
    analytics: window.analytics,
  });
  flux.init();
})();
