const integration = require("@segment/analytics.js-integration");
const Queue = require("@segment/localstorage-retry");
const utm = require("@segment/utm-params");

export function postJSON(url: string, options: any, done: any) {
  // @ts-ignore
  if (window._visitor_events_postJSON) {
    // @ts-ignore
    return window._visitor_events_postJSON(url, options, done);
  }
  const request = new XMLHttpRequest();
  const keys: any = [];
  const all: any = [];
  const headers: any = {};

  const response = () => ({
    ok: ((request.status / 100) | 0) == 2, // 200-299
    statusText: request.statusText,
    status: request.status,
    url: request.responseURL,
    text: () => Promise.resolve(request.responseText),
    json: () => Promise.resolve(JSON.parse(request.responseText)),
    blob: () => Promise.resolve(new Blob([request.response])),
    clone: response,
    headers: {
      keys: () => keys,
      entries: () => all,
      get: (n: any) => headers[n.toLowerCase()],
      has: (n: any) => n.toLowerCase() in headers,
    },
  });

  request.open(options.method || "get", url, true);

  request.onload = () => {
    request
      .getAllResponseHeaders()
      .replace(
        /^(.*?):[^\S\n]*([\s\S]*?)$/gm,
        (_m: any, key: any, value: any): any => {
          keys.push((key = key.toLowerCase()));
          all.push([key, value]);
          headers[key] = headers[key] ? `${headers[key]},${value}` : value;
        },
      );
    done(null, response());
  };

  request.onerror = done;

  request.withCredentials = options.credentials == "include";

  for (const i in options.headers) {
    request.setRequestHeader(i, options.headers[i]);
  }

  request.send(options.body || null);
}

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
      return this.postJSON(item, done)
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
  postJSON(data: object, done: any): Promise<Response> {
    const request = {
      method: "POST",
      credentials: "same-origin" as "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    // @ts-ignore
    return postJSON(this.options.endpoint, request, done);
  },
});

export default VisitorEvents;
