const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const TerserJSPlugin = require('terser-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const config = require('../config')
let vendors = [
  [
    'js-cookie',
    './src/common/utils/url-search-params.min'
  ],
  [
    'vue/dist/vue.esm.js',
  ],
  [
    'vue-router',
    'vuex',
    'vue-i18n'
  ]
]

module.exports = {
  mode: 'production',
  entry: {
    // 多入口，单入口情况，只需写一个，key值自定义，value值为数组
    vendor0: vendors[0],
    vendor1: vendors[1],
    vendor2: vendors[2],
  },
  output: {
    path: path.join(__dirname, "../static/dll"),
    filename: "[name].[chunkhash:8].dll.js",
    library: "[name]_[chunkhash:8]"
  },
  performance: false,
  optimization: {
    minimizer: [new TerserJSPlugin()]
  },
  plugins: [
    new CleanWebpackPlugin([config.build.assetsSubDirectory + '/dll', 'dllManifest'], {
      // 必须设置
      root: config.directory.root
    }),
    new webpack.DllPlugin({
      path: path.join(__dirname, "../dllManifest", "[name]-manifest.json"),
      name: "[name]_[chunkhash:8]",
      context: path.resolve(__dirname, '../')
    })
  ]
}