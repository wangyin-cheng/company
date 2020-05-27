const chalk = require("chalk");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const ora = require("ora");
const { genSeePackage } = require("hui-deploy");
const { getSubSystemVersion } = require("./utils");

const {
  npm_package_name: defaultAppName,
  npm_package_version: defaultAppVerison,
  npm_config_package_name: seePackageName,
  npm_config_system_type: seeSystemType,
  npm_config_app_name: seeAppName,
  npm_config_app_version: seeAppVersion,
  npm_config_sub_app_list: subAppList,
  npm_config_yes: skipPrompt
} = process.env;

module.exports = pack;

function pack(type) {
  const {
    SEE_SUBSYSTEM_APP_NAME // 支持在子系统打包时以环境变量的方式指定应用名称
  } = process.env;

  let default_system_type, default_app_name, default_app_version;

  if (type === "bizframe") {
    default_system_type = seeSystemType || defaultAppName;
    default_app_name = seeAppName || defaultAppName;
    default_app_version = seeAppVersion || defaultAppVerison;
  } else if (type === "subsystem") {
    default_system_type = seeSystemType || defaultAppName;
    default_app_name = seeAppName || SEE_SUBSYSTEM_APP_NAME || "";
    default_app_version =
      seeAppVersion || getSubSystemVersion(SEE_SUBSYSTEM_APP_NAME) || "";
  }

  let p;

  if (skipPrompt) {
    if (!default_system_type || !default_app_name || !default_app_version) {
      p = Promise.reject();
    } else {
      p = Promise.resolve({
        system: default_system_type,
        name: default_app_name,
        version: default_app_version
      });
    }
  } else {
    p = inquirer.prompt([
      {
        type: "input",
        name: "system",
        message: "请确认系统类型:",
        default: default_system_type,
        validate(input) {
          return input === "" ? "系统类型不能为空" : true;
        }
      },
      {
        type: "input",
        name: "name",
        message: "请确认应用名称:",
        default: default_app_name,
        validate(input) {
          return input === "" ? "应用名称不能为空" : true;
        }
      },
      {
        type: "input",
        name: "version",
        message: "请确认应用版本:",
        default: default_app_version,
        validate(input) {
          return input === "" ? "应用版本不能为空" : true;
        }
      }
    ]);
  }

  p.then(answers => {
    const { system, name, version } = answers;

    const onPackFinished = ora(
      `发布物制作完成，您可以在 SEE 平台上传并部署应用。注意：${chalk.yellow(
        "子系统发布物的安装目录需要指定到具体的应用目录"
      )}。比如/home/hsiar/hsiar-green/html/hui-pro。\n`
    );

    genSeePackage(
      seePackageName || `${system}-${name}-${version}`,
      { system, type, name, version },
      done => {
        const { manifest, manifestjson } = genManifest(type, name);

        // 发布物中的源码部分统一放到 source 目录下
        for (const file in manifestjson) {
          if (manifestjson.hasOwnProperty(file)) {
            const { path, root, dir } = manifestjson[file];
            fs.ensureDirSync(`./tmp/source/${dir}`);
            fs.copyFileSync(`./dist/${path}`, `./tmp/source/${path}`);
          }
        }

        fs.outputJSONSync(
          `./tmp/scripts/${name}/conf/${manifest}`,
          manifestjson
        );

        done();
        console.log();
        onPackFinished.succeed();
      }
    );
  }).catch(err => {
    ora(
      `${chalk.red(
        "发布物制作失败。"
      )}基于统一框架制作 SEE 平台发布物需要指定三个关键参数，即系统类型、应用名称和应用版本。请参考文档 ${chalk.cyan(
        "http://hui.hundsun.com/community/topic/80/%E5%9F%BA%E4%BA%8E-see-%E5%B9%B3%E5%8F%B0%E7%9A%84%E7%B3%BB%E7%BB%9F%E9%83%A8%E7%BD%B2"
      )}\n`
    ).fail();
  });
}

function genManifest(type, name) {
  let manifest, manifestjson;

  if (type === "bizframe") {
    manifest = fs
      .readdirSync(`./dist`)
      .find(file => /manifest\.[0-9]+\.json/.test(file));

    manifestjson = fs.readJsonSync(`./dist/${manifest}`);

    if (subAppList) {
      const subsystems = subAppList.split(",");
      if (subsystems.length) {
        for (const subsystem of subsystems) {
          const submanifest = fs
            .readdirSync(`./dist/${subsystem}`)
            .find(file => /manifest\.[0-9]+\.json/.test(file));

          manifestjson = {
            ...manifestjson,
            ...fs.readJSONSync(`./dist/${subsystem}/${submanifest}`)
          };

          fs.removeSync(`./dist/${subsystem}/${submanifest}`);
        }
      }
    }
  }

  if (type === "subsystem") {
    manifest = fs
      .readdirSync(`./dist/${name}`)
      .find(file => /manifest\.[0-9]+\.json/.test(file));
    manifestjson = fs.readJsonSync(`./dist/${name}/${manifest}`);
  }

  return { manifest, manifestjson };
}
