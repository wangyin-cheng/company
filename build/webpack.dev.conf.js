const utils = require('./utils')
const resolve = utils.resolve
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const path = require('path')

process.env.NODE_ENV = "development"

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
process.env.NODE_ENV = 'development'
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src/biz'), resolve('test')],
  exclude: /node_modules/,
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})
const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  entry: {
    app: './src/frame/index.js'
  },
  module: {
    rules: (config.dev.useEslint ? [createLintingRule()] : []).concat(utils.generateStyleModules({ extract: false, sourceMap: true }))
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,
  // these devServer options should be customized in /config/index.js
  devServer: {
    hotOnly: false, // HMR 构建失败时刷新页面
    stats: 'minimal',
    inline: true,
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
  },
  optimization: {
    usedExports: true,
    runtimeChunk: {
      name: 'runtime'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.ejs',
      hash: true,
      inject: 'body',
      chunksSortMode: 'none',
      dll: (function () {
        let max = config.build.dllNum
        let res = []
        for (let i = 0; i < max; i++) {
          const dllName = require(path.resolve(__dirname, `../dllManifest/vendor${i}-manifest.json`)).name.split('_')
          res.push(`./static/dll/${dllName[0]}.${dllName[1]}.dll.js`)
        }
        return res
      })()
    }),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))
      resolve(devWebpackConfig)
    }
  })
})
