const fs = require("fs-extra");
const path = require("path");
const config = require("../config");
const packageConfig = require("../package.json");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

exports.resolve = function(dir) {
  return path.join(__dirname, "..", dir);
};

exports.spJsPath = function(_path) {
  if (_path.indexOf("manifest") >= 0 && _path.indexOf("chunk-manifest") < 0) {
    console.log(_path);
    return path.posix.join(config.build.spDirectory, "manifest.js");
  }
  return path.posix.join(config.build.spDirectory, _path);
};

exports.assetsPath = function(_path) {
  const assetsSubDirectory =
    process.env.NODE_ENV === "production"
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory;
  return path.posix.join(assetsSubDirectory, _path);
};

exports.createNotifierCallback = () => {
  const notifier = require("node-notifier");

  return (severity, errors) => {
    if (severity !== "error") return;

    const error = errors[0];
    const filename = error.file && error.file.split("!").pop();

    notifier.notify({
      title: packageConfig.name,
      message: severity + ": " + error.name,
      subtitle: filename || "",
      icon: path.join(__dirname, "imgs/logo-bak.png")
    });
  };
};

exports.getDateTimeString = function() {
  const date = new Date();
  const splitter = "-";
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  return `${year}${splitter}${month}${splitter}${day} ${hour}:${min}:${sec}`;
};

exports.getSubSystemVersion = function(sysName) {
  let version;
  try {
    const meta = require(path.resolve(
      __dirname,
      "../src/biz/" + sysName + "/meta.json"
    ));
    version = meta.version;
  } catch (err) {}
  return version;
};

/**
 * @description generate webpack style modules
 * @param {boolean} extract - css extract
 * @param {boolean} sourceMap - css source map
 * @param {string} localIdentName - localIdentName for css-loader options
 */
exports.generateStyleModules = function({
  extract,
  sourceMap,
  localIdentName = "[local]_[hash:base64:5]"
}) {
  return [
    {
      test: /\.css$/i, // 这里匹配 `<style module>`
      oneOf: [
        {
          resourceQuery: /module/,
          use: [
            generateStyleLoader({ extract }),
            generateCssLoader({
              sourceMap,
              modules: true,
              localIdentName
            }),
            generatePostcssLoader({ sourceMap, modules: true })
          ]
        },
        {
          // 这里匹配普通的 `<style>` 或 `<style scoped>`
          use: [
            generateStyleLoader({ extract }),
            generateCssLoader({ sourceMap, modules: false }),
            generatePostcssLoader({ sourceMap, modules: false })
          ]
        }
      ]
    },
    {
      test: /\.less$/i, // 这里匹配 `<style module>`
      oneOf: [
        {
          resourceQuery: /module/,
          use: [
            generateStyleLoader({ extract }),
            generateCssLoader({
              sourceMap,
              modules: true,
              localIdentName
            }),
            generatePostcssLoader({ sourceMap, modules: true }),
            generateLessLoader({ sourceMap })
          ]
        },
        {
          // 这里匹配普通的 `<style>` 或 `<style scoped>`
          use: [
            generateStyleLoader({ extract }),
            generateCssLoader({ sourceMap, modules: false }),
            generatePostcssLoader({ sourceMap, modules: false }),
            generateLessLoader({ sourceMap })
          ]
        }
      ]
    },
    {
      test: /\.s[ac]ss$/i, // 这里匹配 `<style module>`
      oneOf: [
        {
          resourceQuery: /module/,
          use: [
            generateStyleLoader({ extract }),
            generateCssLoader({
              sourceMap,
              modules: true,
              localIdentName
            }),
            generatePostcssLoader({ sourceMap, modules: true }),
            generateSassLoader({ sourceMap })
          ]
        },
        {
          // 这里匹配普通的 `<style>` 或 `<style scoped>`
          use: [
            generateStyleLoader({ extract }),
            generateCssLoader({ sourceMap, modules: false }),
            generatePostcssLoader({ sourceMap, modules: false }),
            generateSassLoader({ sourceMap })
          ]
        }
      ]
    }
  ];
};

function generateLessLoader({ sourceMap }) {
  return {
    loader: "less-loader",
    options: {
      sourceMap
    }
  };
}

function generateSassLoader({ sourceMap }) {
  return {
    loader: "sass-loader",
    options: {
      sourceMap
    }
  };
}

function generatePostcssLoader({ sourceMap, modules }) {
  const options = {
    sourceMap,
    plugins: loader => {
      const plugins = [
        require("postcss-import")({ root: loader.resourcePath }),
        require("autoprefixer")({
          overrideBrowserslist: ["defaults", "ie 10", "last 2 versions", "> 1%"]
        })
      ];

      if (modules && loader.resourcePath.includes("biz")) {
        const subsystem = loader.resourcePath
          .split("biz")[1]
          .split(path.sep)[1];

        const meta = fs.readJsonSync(`./src/biz/${subsystem}/meta.json`, {
          throws: false
        });

        if (meta && meta["style-isolate"]) {
          plugins.push(
            require("postcss-wrap-selector")({
              selector: ":local",
              skipRootSelector: [".lightblue", ".black", ".uf3"]
            })
          );
        }
      }

      return plugins;
    }
  };

  return {
    loader: "postcss-loader",
    options
  };
}

function generateCssLoader({ sourceMap, modules, localIdentName }) {
  const options = { sourceMap };

  if (modules) {
    options.modules = false; // make sure style-isolate works right now
    options.localIdentName = localIdentName;
  }

  return {
    loader: "css-loader",
    options
  };
}

function generateStyleLoader({ extract }) {
  if (extract) {
    return {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: "../"
      }
    };
  } else {
    return "vue-style-loader";
  }
}
