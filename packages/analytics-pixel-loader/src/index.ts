import { getOptions } from "loader-utils";
import { JSONSchema7 } from "json-schema";
import { safeLoad } from "js-yaml";
import kebabCase from "lodash.kebabcase";

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

function buildImportStatement(integration: IntegrationConfig) {
  const importName = integration.name.replace(" ", "");
  const importPath =
    integration.package ||
    `@segment/analytics.js-integration-${kebabCase(integration.name)}`;

  return `import ${importName} from "${importPath}";`;
}

function buildSetupStatement(integration: IntegrationConfig) {
  const importName = integration.name.replace(" ", "");

  return `analytics.use(${importName});`;
}

export default function(source: string) {
  // @ts-ignore
  const options = getOptions(this);

  validateOptions(schema, options, { name: "Analytics Pixel Loader" });

  const analyticsConfig: IntegrationConfig[] = safeLoad(source);

  const imports = [];
  const setups = [];
  const mappedAnalyticsConfig: any = {};

  for (const integration of analyticsConfig) {
    imports.push(buildImportStatement(integration));
    setups.push(buildSetupStatement(integration));
    mappedAnalyticsConfig[integration.name] = integration.opts;
  }

  const outputSource = [
    ...imports,
    "var Analytics = require('@segment/analytics.js-core').constructor;",
    "var analytics = new Analytics();",
    ...setups,
    `analytics.initialize(${JSON.stringify(mappedAnalyticsConfig)});`,
    "export default analytics;"
  ].join("\n");

  return outputSource;
}