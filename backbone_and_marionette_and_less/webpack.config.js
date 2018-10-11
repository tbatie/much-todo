const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(hbs|handlebars)$/,
        use: {
          loader: "handlebars-loader"
        }
      },
      {
        test: /\.(css|less)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { sourceMap: true }
          },
          {
            loader: "less-loader",
            options: { sourceMap: true }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Vanilla",
      template: "src/index.html"
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  }
};
