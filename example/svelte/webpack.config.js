/** https://github.com/sveltejs/template-webpack/blob/master/webpack.config.js */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const sveltePreprocess = require("svelte-preprocess");

const path = require("path");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

module.exports = {
  entry: "./src/main.js",
  resolve: {
    alias: {
      svelte: path.dirname(require.resolve("svelte/package.json"))
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"]
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js"
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          // https://www.npmjs.com/package/svelte-loader
          loader: "svelte-loader",
          options: {
            preprocess: sveltePreprocess({
              postcss: true,
            }),
            compilerOptions: {
              dev: !prod
            },
            emitCss: prod,
            hotReload: !prod
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /svelte\.\d+\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ]
      },
      {
        test: /\.css$/,
        include: /svelte\.\d+\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        // https://ru.stackoverflow.com/questions/1191008/module-not-found-error-cant-resolve-svelte-webpack-5
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  mode,
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    })
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    hot: true
  }
};