const integration = require("@segment/analytics.js-integration");
const Queue = require("@segment/localstorage-retry");
const utm = require("@segment/utm-params");

const VisitorEvents = integration("Visitor Events")
  .option("endpoint", "/visitor-events")
  .option("debug", false)
  .readyOnInitialize();

export function sendJson(
  url: string,
  obj: object,
  fn: (err: Error | null, res?: any) => void,
) {
  const req = new XMLHttpRequest();

  req.withCredentials = true;
  req.onerror = () => fn(new Error("Error when sending HTTP request"));
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      // Fail on non-200 statuses
      if (req.status > 299 || req.status < 200) {
        fn(new Error("HTTP Error " + req.status + " (" + req.statusText + ")"));
      } else {
        fn(null, req);
      }
    }
  };

  req.open("POST", url, true);
  req.timeout = 10;
  req.ontimeout = () => fn(new Error("Timed out sending HTTP request"));
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(obj));
}

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
      return this.postJSON(item, done);
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
  postJSON(data: object, fn: (err: Error | null, res?: any) => void) {
    console.log(data);
    // @ts-ignore
    sendJson(this.options.endpoint, data, fn);
  },
});

export default VisitorEvents;
