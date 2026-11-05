const { createWebpackConfig } = require("@poc/config/webpack");

module.exports = createWebpackConfig({
  name: "payment",
  port: 5002,
  dirname: __dirname,
  exposes: {
    "./App": "./src/App",
  },
});
