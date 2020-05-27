const base = require('./webpack.child.conf')
const merge = require('webpack-merge')
const builds = {
  'prod' : {
    filename: '[name].js',
    libraryTarget: 'umd',
    env: 'production'
  }
}

function genConfig (opts) {
  let config = merge({}, base, {
    output: {
      filename: opts.filename,
      libraryTarget: opts.libraryTarget
    }
  })

  // config.plugins = config.plugins.concat([
  //   new webpack.DefinePlugin({
  //     'process.env.NODE_ENV': opts.env || 'development'
  //   }),
  //   //文件压缩
  //   // new webpack.optimize.UglifyJsPlugin({
  //   //   compress: {
  //   //     warnings: false,
  //   //   }
  //   // }),
  // ])
  // if (opts.env) {
  //   config.module.loaders = config.module.loaders.concat([
  //     {
  //       test: /\.scss$/,
  //       use: ExtractTextPlugin.extract({
  //         fallback: "css-loader", //不生效使用style-loader，开发模式下使用style-loader,生产使用cssloader
  //         use: "css-loader!sass-loader"
  //       })
  //     }
  //   ])
  //   //文件压缩
  //   config.plugins = config.plugins.concat([
  //     // new webpack.optimize.UglifyJsPlugin({
  //     //   compress: {
  //     //     warnings: false
  //     //   }
  //     // }),
  //     new ExtractTextPlugin(opts.name + '.css')
  //   ])
  //   //消除没用的css：npm i purifycss-webpack purify-css glop -D开发
  //   //let PurifycssWebpack = require('purifycss-webpack')必须用在htmlPlugin后面
  //   //let Glop = require('glop')
  //   //new PurifycssWepack({
  //     //path:glop.sync(path.resolve('src/*.html'))
  //   //})

  // }else{
  //   config.module.loaders = config.module.loaders.concat([
  //     {
  //       test: /\.scss$/,
  //       loader: 'style-loader!css-loader!sass-loader'
  //     }      
  //   ])
  // }

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(builds[process.env.TARGET])
} else {
  exports.getBuild = name => genConfig(builds[name])
  exports.getAllBuilds = () => Object.keys(builds).map(name => genConfig(builds[name]))
}