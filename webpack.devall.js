// Specific configuration for developers
// Runs a HTTPS server in port 8080, accesible
// from all hosts that can connect to it.
// Convenient for connecting external devices (eg, a VR device)
// USE AT YOUR OWN RISK

const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, '.'),
    },
    host: "0.0.0.0",
    server: {
      type: 'https',
      options: {
        cert: './babia_cert.pem',
        key: './babia_key.pem'
      }
    }
  }
});

