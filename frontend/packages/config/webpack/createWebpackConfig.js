const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const { config: loadDotenv } = require("dotenv");

const FRONTEND_ROOT = path.resolve(__dirname, "../../..");

const API_ENV_DEFAULTS = {
  ORDERS_API_BASE_URL: "http://localhost:8081",
  PAYMENT_API_BASE_URL: "http://localhost:8082",
  NOTIFICATION_API_BASE_URL: "http://localhost:8084",
  INVENTORY_API_BASE_URL: "http://localhost:8085",
};

/** Same-origin Module Federation remotes (nginx demo / VPS). */
const SAME_ORIGIN_REMOTES = {
  orders: "orders@/mf/orders/remoteEntry.js",
  payment: "payment@/mf/payment/remoteEntry.js",
  inventory: "inventory@/mf/inventory/remoteEntry.js",
  notification: "notification@/mf/notification/remoteEntry.js",
};

function loadFrontendEnv() {
  loadDotenv({ path: path.join(FRONTEND_ROOT, ".env") });
  loadDotenv({ path: path.join(FRONTEND_ROOT, ".env.example") });
}

function apiEnvDefines() {
  loadFrontendEnv();
  /** @type {Record<string, string>} */
  const defines = {};
  for (const [key, fallback] of Object.entries(API_ENV_DEFAULTS)) {
    // Prefer ?? so an intentional empty string is kept (same-origin APIs).
    defines[`process.env.${key}`] = JSON.stringify(process.env[key] ?? fallback);
  }
  return defines;
}

function resolvePublicPath(port) {
  if (process.env.MF_PUBLIC_PATH) {
    return process.env.MF_PUBLIC_PATH;
  }
  return `http://localhost:${port}/`;
}

function resolveRemotes(remotes, isHost) {
  if (isHost && process.env.MF_SAME_ORIGIN === "true") {
    return SAME_ORIGIN_REMOTES;
  }
  return remotes;
}

/**
 * @param {{
 *   name: string;
 *   port: number;
 *   dirname: string;
 *   exposes?: Record<string, string>;
 *   remotes?: Record<string, string>;
 *   isHost?: boolean;
 * }} options
 */
function createWebpackConfig(options) {
  const { name, port, dirname, exposes = {}, remotes = {}, isHost = false } = options;
  const deps = require(path.join(dirname, "package.json")).dependencies || {};
  const resolvedRemotes = resolveRemotes(remotes, isHost);

  return {
    entry: path.join(dirname, "src/index.tsx"),
    mode: "development",
    devtool: "source-map",
    output: {
      path: path.join(dirname, "dist"),
      publicPath: resolvePublicPath(port),
      clean: true,
      uniqueName: name,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      alias: {
        "@poc/shared": path.resolve(dirname, "../shared/src"),
        "@poc/config": path.resolve(dirname, "../config"),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1 },
            },
            "postcss-loader",
          ],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: "remoteEntry.js",
        exposes,
        remotes: resolvedRemotes,
        shared: {
          react: {
            singleton: true,
            requiredVersion: deps.react,
            eager: isHost,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
            eager: isHost,
          },
          "react-router-dom": {
            singleton: true,
            requiredVersion: deps["react-router-dom"],
            eager: isHost,
          },
          ...(deps.i18next
            ? {
                i18next: {
                  singleton: true,
                  requiredVersion: deps.i18next,
                  eager: isHost,
                },
              }
            : {}),
          ...(deps["react-i18next"]
            ? {
                "react-i18next": {
                  singleton: true,
                  requiredVersion: deps["react-i18next"],
                  eager: isHost,
                },
              }
            : {}),
          ...(deps["@reduxjs/toolkit"]
            ? {
                "@reduxjs/toolkit": {
                  singleton: true,
                  requiredVersion: deps["@reduxjs/toolkit"],
                },
                "react-redux": {
                  singleton: true,
                  requiredVersion: deps["react-redux"],
                },
              }
            : {}),
        },
      }),
      new HtmlWebpackPlugin({
        template: path.join(dirname, "public/index.html"),
      }),
      new webpack.DefinePlugin(apiEnvDefines()),
    ],
    devServer: {
      port,
      historyApiFallback: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      hot: true,
      liveReload: true,
    },
  };
}

module.exports = { createWebpackConfig };
