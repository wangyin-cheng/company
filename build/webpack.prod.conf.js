"use strict";

const ManifestPlugin = require("webpack-manifest-plugin");

const path = require("path");
const utils = require("./utils");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const glob = require("glob");

// const commonScript = glob.sync('./src/common/**/*.js')
// const commonScript = glob.sync('./src/common/**/!{store, router}.js')
const commonDirective = glob.sync("./src/common/directives/*.js");
const commonMixins = glob.sync("./src/common/mixins/*.js");
const commonUtils = glob.sync("./src/common/utils/*.js");
// const commonMain = glob.sync('./src/common/entry/api.js')

const commonComponent = glob.sync("./src/common/components/**/*.{vue,js}");
const commonStyle = glob.sync("./src/common/styles/hui/main.scss");
// const commonCommon = commonScript.concat(commonComponent).concat(commonStyle)
const commonCommon = commonDirective
  .concat(commonComponent)
  .concat(commonStyle)
  .concat(commonMixins)
  .concat(commonUtils);

// const frameScript = glob.sync('./src/frame/**/*.js')
const frameComponent = glob.sync("./src/frame/components/**/*.{vue,js}");
const frameView = glob.sync("./src/frame/views/**/*.vue");
const frameStyle = glob.sync("./src/frame/styles/main.scss");
const frameCommon = commonCommon
  .concat(frameComponent)
  .concat(frameView)
  .concat(frameStyle);

const entries = Object.assign(
  {},
  {
    "common/frame": frameCommon,
    "common/app": "./src/frame/index.js"
  }
);
const webpackConfig = merge(baseWebpackConfig, {
  mode: "production",
  entry: entries,
  module: {
    rules: utils.generateStyleModules({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      localIdentName: "[local]_[hash:base64:8]"
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.spJsPath("[name].[chunkhash:8].js"),
    chunkFilename: utils.spJsPath("[name].[chunkhash:8].js")
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        parallel: true,
        sourceMap: config.build.productionSourceMap // Must be set to true if using source-maps in production
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    splitChunks: {
      chunks: "async",
      // 30k+
      minSize: 30000,
      maxSize: 0,
      minChunks: 2,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "_",
      name: true,
      cacheGroups: {
        [`common/vendors`]: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: "all",
          enforce: true
        },
        [`common/default`]: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(["dist"], {
      // 必须设置
      root: config.directory.root
    }),
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: "index.ejs",
      hash: true,
      inject: "body",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      dll: (function() {
        let max = config.build.dllNum;
        let res = [];
        for (let i = 0; i < max; i++) {
          const dllName = require(path.resolve(
            __dirname,
            `../dllManifest/vendor${i}-manifest.json`
          )).name.split("_");
          res.push(`./static/dll/${dllName[0]}.${dllName[1]}.dll.js`);
        }
        return res;
      })()
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../static"),
        to: config.build.assetsSubDirectory,
        ignore: [".*"],
        transform: function(content, path) {
          if (
            path.indexOf(".js") > -1 ||
            path.indexOf(".html") > -1 ||
            path.indexOf(".css") > -1
          ) {
            let versionInfo =
              "/** version:" +
              process.env.npm_package_version +
              ", creation time:" +
              utils.getDateTimeString() +
              "*/"; // 其值为字符串，将作为注释存在
            return versionInfo + content;
          }
          return content;
        }
      },
      {
        from: path.resolve(config.directory.root, "sysconfig.js"),
        to: "sysconfig.js",
        transform: function(content, path) {
          let versionInfo =
            "/** version:" +
            process.env.npm_package_version +
            ", creation time:" +
            utils.getDateTimeString() +
            "*/"; // 其值为字符串，将作为注释存在
          return versionInfo + content;
        }
      }
    ])
  ]
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require("compression-webpack-plugin");

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: new RegExp(
        "\\.(" + config.build.productionGzipExtensions.join("|") + ")$"
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

if (config.build.manifest) {
  webpackConfig.plugins.push(
    new ManifestPlugin({
      fileName: path.resolve(
        __dirname,
        "..",
        "dist",
        `manifest.${Date.now()}.json`
      ),
      publicPath: "",
      generate(seed, files, entrypoints) {
        return files.reduce((manifest, { name, path: manifestFilePath }) => {
          const { root, dir, base } = path.parse(manifestFilePath);
          return {
            ...manifest,
            [name + "-" + base]: { path: manifestFilePath, root, dir }
          };
        }, seed);
      }
    })
  );
}

module.exports = webpackConfig;
