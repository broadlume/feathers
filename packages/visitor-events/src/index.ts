import integration from "@segment/analytics.js-integration";
import Queue from "@segment/localstorage-retry";
import utm from "@segment/utm-params";

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
        (_m: unknown, key: string, value: string): any => {
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

VisitorEvents.prototype.normalizeEvent = function (
  event: any,
  type: string,
  argNames: string[] = [],
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { properties = {}, integrations: _, context, ...body } = event.obj;
  const typeContext = {};

  argNames.forEach((argName) => {
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
};
VisitorEvents.prototype.initialize = function () {
  this.queue = new Queue("visitor-events", (item: any, done: any) => {
    return this.postJSON(item, done)
      .then((res) => done(null, res))
      .catch((err: Error) => {
        console.error(err);
        done(err);
      });
  });
  this.queue.start();
  // @ts-ignore
  this.ready();
};

VisitorEvents.prototype.track = function (event: any) {
  return this.publishEvent(event, "track");
};

VisitorEvents.prototype.page = function (event: any) {
  return this.publishEvent(event, "page", ["name", "category"]);
};

VisitorEvents.prototype.identify = function (event: any) {
  return this.publishEvent(event, "identify");
};

VisitorEvents.prototype.group = function (event: any) {
  return this.publishEvent(event, "group", ["groupId"]);
};

VisitorEvents.prototype.alias = function (event: any) {
  return this.publishEvent(event, "alias", ["previousId"]);
};

VisitorEvents.prototype.publishEvent = function (
  event: any,
  type: any,
  argNames: string[] = [],
) {
  return this.queue.addItem(this.normalizeEvent(event, type, argNames));
};

VisitorEvents.prototype.getQueue = function () {
  return this.queue;
};

VisitorEvents.prototype.postJSON = function (
  data: object,
  done: any,
): Promise<Response> {
  const request = {
    method: "POST",
    credentials: "same-origin" as "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  // @ts-ignore
  return postJSON(this.options.endpoint, request, done);
};

export default VisitorEvents;
