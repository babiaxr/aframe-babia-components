// Specific configuration for developers
// Runs a HTTPS server in port 8080, accesible
// only from localhost.

const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    publicPath: "/dist/",
    contentBase: path.resolve(__dirname, ".")
  }
});