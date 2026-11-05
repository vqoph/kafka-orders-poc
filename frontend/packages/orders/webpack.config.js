const { createWebpackConfig } = require("@poc/config/webpack");

module.exports = createWebpackConfig({
  name: "orders",
  port: 5001,
  dirname: __dirname,
  exposes: {
    "./App": "./src/App",
  },
});
