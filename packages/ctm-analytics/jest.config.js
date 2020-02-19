const { name: displayName } = require("./package.json");

module.exports = {
  displayName,
  preset: "@adhawk/jest-preset/default",
  testURL:
    "https://www.example.com?utm_source=news4&utm_medium=email&utm_campaign=spring-summer",
};
