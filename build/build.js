'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')
const fse = require('fs-extra')
const spinner = ora('building for production...')
const pack = require('./package')
const utils = require('./utils')
webpackConfig.devtool = process.env.npm_config_devtool ? process.env.npm_config_devtool : webpackConfig.devtool
const build = function () {
  return new Promise((resolve, reject) => {
    spinner.start()
    webpack(webpackConfig, (err, stats) => {
      spinner.stop()
      if (err) {
        reject(err)
        return
      }
      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
        chunks: false,
        chunkModules: false
      }) + '\n\n')
      // 为dist目录下index.html引用的config.js添加hash,去除缓存
      fse.readFile(path.join(config.build.assetsRoot, 'index.html'), 'utf-8', function(err, html) {
        if (err) return console.error('[webpack:build]: read index.html failed')
        const hash = stats.toJson('normal').hash || Date.now()
        html = '<!-- version:' + process.env.npm_package_version + ', creation time:' + utils.getDateTimeString()  + '-->' + html
        const content = html.replace('sysconfig.js', `sysconfig.js?${hash}`)
        fse.writeFileSync(path.join(config.build.assetsRoot, 'index.html'), content, 'utf-8')
      })
      if (stats.hasErrors()) {
        reject()
        return
      }
      resolve()
    })
  })
}

build()
  .then(() => {
    console.log(chalk.cyan("  Build complete.\n"));
    console.log(
      chalk.yellow(
        "  Tip: built files are meant to be served over an HTTP server.\n" +
          "  Opening index.html over file:// won't work.\n"
      )
    );

    // generate see deploy package
    const { npm_config_package } = process.env;
    if (npm_config_package === "true") {
      pack("bizframe");
    }
  })
  .catch(err => {
    console.log(chalk.red("Build failed with errors.\n"));
    console.log(err)
  });
