"use strict";

/* eslint-disable */

var integration = require("@segment/analytics.js-integration");

var FreshDesk = integration("FreshDesk")
  .global("FreshworksWidget")
  .option("widgetId", null)
  .tag(
    '<script async src="https://widget.freshworks.com/widgets/{{widgetId}}.js"></script>'
  );

FreshDesk.prototype.initialize = function () {
  window.fwSettings = {
    widget_id: this.options.widgetId,
  };

  if (typeof window.FreshworksWidget !== "function") {
    var n = function () {
      n.q.push(arguments);
    };
    n.q = [];
    window.FreshworksWidget = n;
  }

  this.load(this.ready);
};

FreshDesk.prototype.identify = function (identify) {
  window.FreshworksWidget("identify", "ticketForm", {
    name: identify.name(),
    email: identify.email(),
  });
};

FreshDesk.prototype.reset = function () {
  window.FreshworksWidget("logout");
};

module.exports = FreshDesk;
