import { getOptions } from "loader-utils";
import { JSONSchema7 } from "json-schema";
import { safeLoad } from "js-yaml";
import kebabCase from "lodash.kebabcase";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const validateOptions = require("schema-utils");

const schema: JSONSchema7 = {
  // type: "object",
  // properties: {},
};

interface IntegrationConfig {
  name: string;
  package?: string;
  opts: object;
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

export default function(source: string): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const options = getOptions(this);

  validateOptions(schema, options, { name: "Analytics Pixel Loader" });

  const analyticsConfig: IntegrationConfig[] = safeLoad(source);

  const imports = [];
  const setups = [];
  const mappedAnalyticsConfig: { [k: string]: object } = {};

  for (const integration of analyticsConfig) {
    imports.push(buildImportStatement(integration));
    setups.push(buildSetupStatement(integration));
    mappedAnalyticsConfig[integration.name] = integration.opts;
  }

  const outputSource = `${imports.join("\n")}
var Analytics = require('@segment/analytics.js-core/lib/analytics');
var analytics = new Analytics();
analytics.VERSION = require('@segment/analytics.js-core/package.json').version;
${setups.join("\n")}
var analyticsConfig = ${JSON.stringify(mappedAnalyticsConfig)};

if (typeof document !== 'undefined') {
  var analyticsConfigMeta = document.querySelector('meta[name="analytics-config"]');
  if (analyticsConfigMeta) {
    analyticsConfig = JSON.parse(analyticsConfigMeta.content);
  }
}

analytics.initialize(analyticsConfig);
export default analytics;`;

  return outputSource;
}
