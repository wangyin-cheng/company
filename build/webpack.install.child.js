// 安装子系统第三方插件
const path = require('path')
const fse = require('fs-extra')
const childProcess = require('child_process')
const utils = require('./utils')
const resolve = utils.resolve
let allPlugin = []
let files = fse.readdirSync(resolve('src/biz/'))
files.forEach(item => {
  // 判定是否存在
  let existed = fse.pathExistsSync(resolve('src/biz/' + item + '/config.js'))
  if (existed) {
    let config = require('../src/biz/' + item + '/config.js')
    if (config.plugins && config.plugins.length > 0) {
      Array.prototype.push.apply(allPlugin, config.plugins)
    }
  }
})
if (allPlugin.length > 0) {
  childProcess.exec('npm install ' + allPlugin.join(' '), function (err, stdout, stderr) {
    console.log(stdout)
  })
}
