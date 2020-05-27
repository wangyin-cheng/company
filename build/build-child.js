process.env.NODE_ENV = "production";
// process.env.NODE_ENV = 'development'
const webpack = require("webpack");
// 优雅的终端器
const ora = require("ora");
const chalk = require('chalk')
const builds = require("./config.child").getAllBuilds();
const pack = require('./package');

const spinner = ora("building for production...");
const build = function (builds) {
  return Promise.all(
    builds.map(
      config =>
        new Promise((resolve, reject) => {
          spinner.start();
          webpack(config, function(err, stats) {
            spinner.stop();
            if (err) reject(err);
            process.stdout.write(
              stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
              }) + "\n"
            );
            resolve();
          });
        })
    )
  );
}

build(builds)
  .then(async () => {
    console.log(chalk.cyan("  Build complete.\n"));

    // generate see deploy package
    const { npm_config_package, npm_config_child } = process.env;
    if (npm_config_package === "true") {
      process.env.SEE_SUBSYSTEM_APP_NAME = npm_config_child;
      pack("subsystem");
    }
  })
  .catch(err => {
    console.log(chalk.red("Build failed with errors.\n"));
    console.log(err)
  });
