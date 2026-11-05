const { createWebpackConfig } = require("@poc/config/webpack");

module.exports = createWebpackConfig({
  name: "inventory",
  port: 5003,
  dirname: __dirname,
  exposes: {
    "./App": "./src/App",
  },
});
