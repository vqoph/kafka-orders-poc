const { createWebpackConfig } = require("@poc/config/webpack");

module.exports = createWebpackConfig({
  name: "shell",
  port: 5000,
  dirname: __dirname,
  isHost: true,
  remotes: {
    orders: "orders@http://localhost:5001/remoteEntry.js",
    payment: "payment@http://localhost:5002/remoteEntry.js",
    inventory: "inventory@http://localhost:5003/remoteEntry.js",
  },
});
