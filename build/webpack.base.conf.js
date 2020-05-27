'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {resolve} = require('./utils')
const webpack = require('webpack')
const fse = require('fs-extra')

let aliasMap = {
  'vue$': 'vue/dist/vue.esm.js',
  '$rootPath': resolve(''),
  '@common': resolve('src/common'),
  '@src': resolve('src'),
  '@frame': resolve('src/frame'),
  '@biz': resolve('src/biz')
}
// 汇总子模块的alias
let files = fse.readdirSync(resolve('src/biz/'))
files.forEach(item => {
  // 判定是否存在
  let exits = fse.pathExistsSync(resolve('src/biz/' + item + '/config.js'))
  if (exits) {
    let a = require('../src/biz/' + item + '/config.js')
    if (a.alias) {
      for (let i in a.alias) {
        aliasMap[i] = resolve(a.alias[i])
      }
    }
  }
})
module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    // app: './src/frame/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: aliasMap,
    modules: [resolve('node_modules')]
  },
  performance: false,
  stats: {
    // 未定义选项时，stats 选项的备用值(fallback value)（优先级高于 webpack 本地默认值）
    // all: undefined,
    // 添加资源信息
    assets: true,
    // 添加构建日期和构建时间信息
    builtAt: true,
    // 添加缓存（但未构建）模块的信息
    cached: true,
    // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
    cachedAssets: false,
    // 添加 children 信息
    children: false,
    // 添加 chunk 信息（设置为 `false` 能允许较少的冗长输出）
    chunks: false,
    // 添加 namedChunkGroups 信息
    chunkGroups: false,
    // 将构建模块信息添加到 chunk 信息
    chunkModules: false,
    // 添加 chunk 和 chunk merge 来源的信息
    chunkOrigins: false,
    // `webpack --colors` 等同于
    colors: true,
    // 显示每个模块到入口起点的距离(distance)
    depth: false,
    // 通过对应的 bundle 显示入口起点
    entrypoints: true,
    // 添加 --env information
    env: false,
    // 添加错误信息
    errors: true,
    // 添加错误的详细信息（就像解析日志一样）
    errorDetails: true,
    // 添加 compilation 的哈希值
    hash: true,
    // 设置要显示的模块的最大数量
    maxModules: 5,
    // 添加构建模块信息
    modules: false,
    // 显示警告/错误的依赖和来源（从 webpack 2.5.0 开始）
    moduleTrace: true,
    // 当文件大小超过 `performance.maxAssetSize` 时显示性能提示
    performance: true,
    // 显示模块的导出
    providedExports: true,
    // 添加 public path 的信息
    publicPath: false,
    // 添加模块被引入的原因
    reasons: false,
    // 添加模块的源码
    source: false,
    // 添加时间信息
    timings: true,
    // 显示哪个模块导出被用到
    usedExports: false,
    // 添加 webpack 版本信息
    version: true,
    // 添加警告
    warnings: true
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            prettify: false,
            cacheDirectory: resolve('node_modules/.cache/vue-loader'),
            cacheIdentifier: 'vue'
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')],
        options: {
          cacheDirectory: true
        }
      },
      /* 统一将img/media/fonts放置在frame下 */
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.spJsPath('static/img/[name].[ext]'),
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.spJsPath('static/media/[name].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.spJsPath('static/fonts/[name].[ext]')
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    // 为每个文件添加头部注释
    new webpack.BannerPlugin({
      banner: 'version:' + process.env.npm_package_version + ', creation time:' + utils.getDateTimeString()  // 其值为字符串，将作为注释存在
    }),
    new MiniCssExtractPlugin({
      filename: utils.spJsPath('[name].css'),
      chunkFilename: utils.spJsPath('[name].css')
    }),
　　 // 这是一个数组，单入口时只需填写一个对应的webpack.DllReferencePlugin实例
    // webpack.DllReferencePlugin可以帮助webpack得知哪些包是dll负责的，进而避免重复打包
    ...(function () {
      let max = config.build.dllNum
      let res = []
      for (let i = 0; i < max; i++) {
        res.push(new webpack.DllReferencePlugin({
          context: path.resolve(__dirname, '../'),
          manifest: resolve(`./dllManifest/vendor${i}-manifest.json`)
        }))
      }
      return res
    })()
  ]
}
