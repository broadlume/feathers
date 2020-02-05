const integration = require("@segment/analytics.js-integration");
const Queue = require("@segment/localstorage-retry");
const utm = require("@segment/utm-params");

const VisitorEvents = integration("Visitor Events")
  .option("endpoint", "/visitor-events")
  .option("debug", false)
  .readyOnInitialize();

Object.assign(VisitorEvents.prototype, {
  normalizeEvent(event: any, type: string, argNames: string[] = []) {
    const { properties = {}, integrations: _, context, ...body } = event.obj;
    const typeContext = {};

    argNames.forEach(argName => {
      // @ts-ignore
      typeContext[argName] = body[argName];
      delete body[argName];
    });

    const query = window.location.search;

    // Add UTM params
    if (query && !context.campaign) {
      context.campaign = utm(query);
    }

    const normalized = {
      ...body,
      payload: properties,
      type,
      typeContext,
      context,
    };
    // @ts-ignore
    this.debug("normalized event", normalized);
    return normalized;
  },
  set queue(que: typeof Queue) {
    this.queue = que;
  },
  initialize() {
    this.queue = new Queue("visitor-events", (item: any, done: any) => {
      return this.postJSON(item)
        .then(res => done(null, res))
        .catch((err: Error) => {
          console.error(err);
          done(err);
        });
    });
    this.queue.start();
    // @ts-ignore
    this.ready();
  },
  track(event: any) {
    return this.publishEvent(event, "track");
  },
  page(event: any) {
    return this.publishEvent(event, "page", ["name", "category"]);
  },
  identify(event: any) {
    return this.publishEvent(event, "identify");
  },
  group(event: any) {
    return this.publishEvent(event, "group", ["groupId"]);
  },
  alias(event: any) {
    return this.publishEvent(event, "alias", ["previousId"]);
  },
  publishEvent(event: any, type: any, argNames: string[] = []) {
    return this.queue.addItem(this.normalizeEvent(event, type, argNames));
  },
  postJSON(data: object): Promise<Response> {
    const request = {
      method: "POST",
      credentials: "same-origin" as "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    // @ts-ignore
    return window.fetch(this.options.endpoint, request);
  },
});

export default VisitorEvents;
