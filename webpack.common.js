const path = require("path");

module.exports = {
  entry: path.join(__dirname, "./index.js"),
  output: {
    filename: "aframe-babia-components.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /.js$/,
        include: [path.resolve(__dirname, "components")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "babel-loader"
      },
      {
        test: /\.(glb|gltf|png)$/,
        use:
          [
            {
              loader: 'url-loader',
            }
          ]
      },
    ]
  },
  resolve: {
    extensions: [".js"]
  }
};