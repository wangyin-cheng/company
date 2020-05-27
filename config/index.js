const path = require('path')

module.exports = {
  dev: {
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    host: '127.0.0.1',
    port: 8091, // if port is in use, a free one will be determined
    autoOpenBrowser: true,
    notifyOnErrors: true,
    useEslint: false,
    showEslintErrorsInOverlay: false,
    devtool: 'cheap-module-eval-source-map'
  },
  directory: {
    root: path.resolve(__dirname, '../'),
    src: path.resolve(__dirname, '../', 'src')
  },
  build: {
    version: '1.0.1',
    dllNum: 3,

    index: path.resolve(__dirname, '../dist/index.html'),

    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',

    spDirectory: '',
    productionSourceMap: false,
    devtool: '#source-map',
    
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    
    bundleAnalyzerReport: false,

    manifest: true
  }
}
