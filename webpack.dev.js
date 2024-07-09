const { merge } = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require("dotenv-webpack");
const common = require("./webpack.common.js");

const envPath = ".env";

module.exports = merge(common, {
  entry: "./src/index.js",
  devtool: "inline-source-map",
  devServer: {
    historyApiFallback: true
  },
  mode: "development",
  optimization: {
    minimize: false
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    pathinfo: false
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Real time attendees tracking widget",
      template: "./src/index.ejs"
    }),
    new MiniCssExtractPlugin({
      filename: "./index.css"
    }),
    new Dotenv({ path: envPath })
  ],
  watch: true
});
