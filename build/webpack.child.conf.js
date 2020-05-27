const ManifestPlugin = require("webpack-manifest-plugin");

const webpack = require("webpack");
const path = require("path");
const fse = require("fs-extra");
const utils = require("./utils");
const config = require("../config");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const projectRoot = path.resolve(__dirname, "../");
const resolve = utils.resolve;
const childName = process.env.npm_config_child;
let entries = {};
let aliasMap = {
  vue$: "vue/dist/vue.esm.js",
  $rootPath: resolve(""),
  "@src": resolve("src"),
  "@": resolve("src"),
  "@common": resolve("src/common"),
  "@biz": resolve("src/biz"),
  "@frame": resolve("src/frame")
};
// 复制文件
let copyPlugin = [];
let staticExits = fse.pathExistsSync(
  resolve("src/biz/" + childName + "/static")
);
if (staticExits) {
  copyPlugin.push({
    from: path.resolve(
      config.directory.root,
      "src/biz/" + childName + "/static"
    ),
    to: path.resolve(config.build.assetsRoot, childName + "/static"),
    ignore: [".*"]
  });
}
entries[childName + "/" + childName] = "./src/biz/" + childName + "/index.js";

try {
  const { prefetch } = require(path.resolve(
    __dirname,
    `../src/biz/${childName}/meta.json`
  ));

  if (prefetch) {
    entries[childName + "/prefetch"] =
      "./src/biz/" + childName + "/prefetch.js";
  }
} catch (err) {}

let exits = fse.pathExistsSync(resolve("src/biz/" + childName + "/config.js"));
if (exits) {
  let a = require("../src/biz/" + childName + "/config.js");
  if (a.alias) {
    for (let i in a.alias) {
      aliasMap[i] = resolve(a.alias[i]);
    }
  }
}
let sysConfigExits = fse.pathExistsSync(
  resolve("src/biz/" + childName + "/sysconfig.js")
);
if (sysConfigExits) {
  copyPlugin.push({
    from: path.resolve(
      config.directory.root,
      "src/biz/" + childName + "/sysconfig.js"
    ),
    to: path.resolve(config.build.assetsRoot, childName + "/sysconfig.js")
  });
}

const webpackConfig = {
  mode: "production",
  entry: entries,
  devtool: config.build.productionSourceMap ? "#source-map" : false,
  output: {
    path: config.build.assetsRoot,
    publicPath:
      process.env.NODE_ENV === "production"
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath,
    chunkFilename: utils.spJsPath("[name].[chunkhash:8].js"),
    library: `_${childName}`,
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: aliasMap,
    modules: [resolve("node_modules")]
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
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "_",
      name: true,
      cacheGroups: {
        [childName + "/vendors"]: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        [childName + "/default"]: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
          options: {
            prettify: false,
            cacheDirectory: resolve("node_modules/.cache/vue-loader"),
            cacheIdentifier: "vue"
          }
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: projectRoot,
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        query: {
          limit: 10000,
          name: path.posix.join(childName, utils.assetsPath("img/[name].[ext]"))
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        query: {
          limit: 10000,
          name: path.posix.join(
            childName,
            utils.assetsPath("fonts/[name].[hash:5].[ext]")
          )
        }
      },
      ...utils.generateStyleModules({
        sourceMap: config.build.productionSourceMap,
        extract: false,
        localIdentName: "[local]_[hash:base64:8]"
      })
    ]
  },
  externals: {
    vue: {
      global: "Vue", // 外部 library 能够作为全局变量使用。用户可以通过在 script 标签中引入来实现。
      root: "Vue", // 如果库运行在Node.js环境中
      commonjs: "vue", // 如果运行在Node.js环境中
      commonjs2: "vue", // 如果运行在Node.js环境中
      amd: "vue" // 如果使用require.js等加载
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(["dist/" + childName], {
      root: config.directory.root
    }),
    new webpack.BannerPlugin({
      banner:
        "version:" +
        (utils.getSubSystemVersion(childName) ||
          process.env.npm_package_version) +
        ", creation time:" +
        utils.getDateTimeString() // 其值为字符串，将作为注释存在
    }),
    new CopyWebpackPlugin(copyPlugin),
    ...(config.build.bundleAnalyzerReport ? [new BundleAnalyzerPlugin()] : [])
  ]
};

if (config.build.manifest) {
  webpackConfig.plugins.push(
    new ManifestPlugin({
      fileName: path.resolve(
        __dirname,
        "..",
        "dist",
        childName,
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
