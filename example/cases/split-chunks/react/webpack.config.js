const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { defaultGetLocalIdent } = require("css-loader");
const { remakeExtractedGetLocalIdent } = require("postcss-mobile-forever");

const isProdMode = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProdMode ? "production" : "development",
  entry: "./src/index.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
    new MiniCssExtractPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    port: 3000,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: [isProdMode ? MiniCssExtractPlugin.loader : "style-loader", {
          loader: "css-loader",
          options: {
            modules: {
              auto: resourcePath => !resourcePath.includes("index.css"),
              localIdentName: isProdMode ? "[hash:base64]" : "[path][name]__[local]",
              getLocalIdent: isProdMode ? remakeExtractedGetLocalIdent({ defaultGetLocalIdent }) : undefined,
            },
          }
        }, "postcss-loader"],
      }
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      cacheGroups: {
        desktop: {
          chunks: "all",
          enforce: true,
          test: /desktop[^\\/]*?\.css$/,
          name: "desktop",
          priority: 100,
        },
        landscape: {
          chunks: "all",
          enforce: true,
          test: /landscape[^\\/]*?\.css$/,
          name: "landscape",
          priority: 100,
        }
      }
    }
  },
};
