// Specific configuration for developers
// Runs a HTTPS server in port 8080, accesible
// only from localhost.

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
    server: {
      type: 'https',
      options: {
        cert: './babia_cert.pem',
        key: './babia_key.pem'
      }
    },
    open: {
      target: ['index.html'],
      app: {
        name: 'chromium',
        arguments: ['--incognito']
      }
    },
    // webpack-dev-server doesn't write any output files after compiling.
    // Instead, it keeps bundle files in memory and serves them as if
    // they were real files mounted at the server's root path.
    // If your page expects to find the bundle files on a different path,
    // you can change this with the devMiddleware.publicPath option
    // in the dev server's configuration.
    // https://webpack.js.org/guides/development/#using-webpack-dev-server
    devMiddleware: {
      publicPath: '/dist/'
    }
  }
});

