const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

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

  return {
    entry: path.join(dirname, "src/index.tsx"),
    mode: "development",
    devtool: "source-map",
    output: {
      path: path.join(dirname, "dist"),
      publicPath: `http://localhost:${port}/`,
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
        remotes,
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
        },
      }),
      new HtmlWebpackPlugin({
        template: path.join(dirname, "public/index.html"),
      }),
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
