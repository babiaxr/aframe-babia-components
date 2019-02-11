// Required libraries, for webpack to work
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [{
  entry: './src/main.js',
  output: {
    filename: 'aframe-components-city.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      // JavaScript files
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      // HTML files
      {
        test: /\.html$/,
        include: [path.resolve(__dirname, 'src')],
        use: ['html-loader']
      },
      // Images
      {
        test: /\.(jpg|png|svg)$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        ]
      },
      // JSON files
      {
        type: 'javascript/auto',
        test: /\.json$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        ]
      }

    ],
  },
  stats: {
    colors: true
  },
  devtool: 'source-map',
  plugins: [new HtmlWebpackPlugin({
    template: './src/main.html',
    inject: 'head',
    filename: 'index.html'
  })]
},
{
  entry: './src/painter.js',
  output: {
    filename: 'painter.js',
    path: path.resolve(__dirname, 'dist')
  }
}
];