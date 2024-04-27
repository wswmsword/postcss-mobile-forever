const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const glob = require("glob");

const isProdMode = process.env.NODE_ENV === "production";

const { entry, htmlWebpackPlugins } = getMPA();

module.exports = {
  mode: isProdMode ? "production" : "development",
  entry,
  target: "web",
  output: {
    filename: "js/[name].[fullhash:8].js",
    path: path.resolve(__dirname, "build"),
    clean: true,
    publicPath: '',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].[fullhash:8].css",
    }),
  ].concat(htmlWebpackPlugins),
  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    port: 3000,
    liveReload: true,
    watchFiles: `${path.resolve(__dirname, "src")}/**/*`,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          isProdMode ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader", "postcss-loader"],
      },
      {
        test: /\.(jpe?g|svg|png|gif)$/,
        type: "asset",
        generator: {
          filename: "img/[name]-[hash:8][ext]",
        },
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js"],
    alias: {
      '@': path.resolve(__dirname, "src"),
      "@img": path.resolve(__dirname, "src", "assets", "img"),
    },
  },
  optimization: {
    minimizer: [
      "...",
      new CssMinimizerPlugin(),
    ],
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
    },
  },
};


function getMPA() {
  const entry = {};
  const htmlWebpackPlugins = [];
  // 获取本地按规则修改好的文件
  const entryFiles = glob.sync(path.join(__dirname, "./src/pages/*/index.js"));
  Object.keys(entryFiles).map((index) => {

    const entryFile = entryFiles[index];

    // 'my-project/src/index/index.js'

    const match = entryFile.match(/src[\\\/]pages[\\\/]([^\\\/]*)[\\\/]index.js/);
    // 获取页面文件名
    const pageName = match && match[1];

    entry[pageName] = entryFile;
    // 根据本地定义的页面文件数量来定义htmlWebpackPlugin

    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin(getHtmlWebpackPluginOpts(pageName))
    );
  });

  return {
    entry,
    htmlWebpackPlugins
  };
};

function getHtmlWebpackPluginOpts(pageName) {
  return isProdMode ? {
    template: path.join(__dirname, `src/pages/${pageName}/index.html`),
    filename: `${pageName}.html`,
    chunks: [pageName],
    inject: true,
    minify: {
      html5: true,
      collapseWhitespace: true,
      preserveLineBreaks: false,
      minifyCSS: true,
      minifyJS: true,
      removeComments: false
    },
  } : {
    template: path.join(__dirname, `src/pages/${pageName}/index.html`),
    filename: `${pageName}.html`,
    chunks: [pageName],
  };
}