import { getOptions } from "loader-utils";
import { JSONSchema7 } from "json-schema";
import { safeLoad } from "js-yaml";
import kebabCase from "lodash.kebabcase";
import { validate as validateOptions } from "schema-utils";
import { InitOptions } from "@segment/analytics.js-core/lib/types";

const schema: JSONSchema7 = {
  // type: "object",
  // properties: {},
};

interface IntegrationConfig {
  name: string;
  package?: string;
  opts: object;
}

interface AnalyticsConfig extends Omit<InitOptions, "integrations"> {
  integrations: IntegrationConfig[];
}

function generateImportName(name: string): string {
  return name.replace(/\W/g, "");
}

function buildImportStatement(integration: IntegrationConfig): string {
  const importName = generateImportName(integration.name);
  const importPath =
    integration.package ||
    `@segment/analytics.js-integration-${kebabCase(integration.name)}`;

  return `import ${importName} from "${importPath}";`;
}

function buildSetupStatement(integration: IntegrationConfig): string {
  const importName = generateImportName(integration.name);

  return `analytics.use(${importName});`;
}

export default function (source: string): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const options = getOptions(this);
  validateOptions(schema, options, { name: "Analytics Pixel Loader" });

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const { integrations, ...analyticsOpts } = safeLoad(
    source
  ) as AnalyticsConfig;

  const imports = [];
  const setups = [];
  const mappedAnalyticsConfig: { [k: string]: object } = {};

  for (const integration of integrations) {
    imports.push(buildImportStatement(integration));
    setups.push(buildSetupStatement(integration));
    mappedAnalyticsConfig[integration.name] = integration.opts;
  }

  const analyticsVersion = require("@segment/analytics.js-core/package.json")
    .version;

  const outputSource = `${imports.join("\n")}
import Analytics from '@segment/analytics.js-core/build/analytics';

var analytics = new Analytics();
analytics.VERSION = ${JSON.stringify(analyticsVersion)};
${setups.join("\n")}
var analyticsConfig = ${JSON.stringify(mappedAnalyticsConfig)};

if (typeof document !== 'undefined') {
  var analyticsConfigMeta = document.querySelector('meta[name="analytics-config"]');
  if (analyticsConfigMeta) {
    analyticsConfig = JSON.parse(analyticsConfigMeta.content);
  }
}

analytics.initialize(analyticsConfig, ${JSON.stringify(analyticsOpts)});
export default analytics;`;

  return outputSource;
}
