const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "aframe-babia-components.min.js"
  },
  devtool: "source-map"
});