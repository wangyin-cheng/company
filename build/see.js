const {
  npm_config_type: seeAppType,
  npm_config_app_name: seeAppName
} = process.env;

if (seeAppType === "subsystem") {
  process.env.SEE_SUBSYSTEM_APP_NAME = seeAppName || "";
}

require("./package")(seeAppType || "bizframe");
