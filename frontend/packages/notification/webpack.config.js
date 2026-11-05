const { createWebpackConfig } = require("@poc/config/webpack");

module.exports = createWebpackConfig({
  name: "notification",
  port: 5004,
  dirname: __dirname,
  exposes: {
    "./App": "./src/App",
  },
});
