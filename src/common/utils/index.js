import Cookies from "js-cookie";
import store from "../entry/store";

const { URLSearchParams } = require("./url-search-params.min");

/**
 * @description 合并 url 指定的语言包文件, 要求必须符合 requirejs 的模块规范 https://github.com/requirejs/requirejs
 * @param {String} url 语言文件路径, 应该是相对于根目录的一个路径地址, 如 “./static/locale/demo.js”
 * @param {Function} cb 回调函数
 * @returns {Promise}
 */
export function mergeLocaleFromUrl(url) {
  return new Promise((resolve, reject) => {
    if (url) {
      requirejs(
        [url],
        data => {
          for (let key in data) {
            if (["zh-CN", "en-US", "zh-TW"].includes(key)) {
              window.i18n.mergeLocaleMessage(key, data[key]);
            }
          }

          resolve();
        },
        error => {
          reject(error);
        }
      );
    } else {
      reject("url is empty");
    }
  });
}

/**
 * @description 主题切换, 支持 INCLUDE_APP_MAIN_ON_THEME_CHANGE 运行时配置, 默认切换包含子系统内容
 * @param {String} theme 主题名称
 */
export function switchTheme(theme) {
  const { INCLUDE_APP_MAIN_ON_THEME_CHANGE } = LOCAL_CONFIG;

  document.getElementsByTagName("html")[0].className = "";

  store.commit("SWITCH_CURRENT_SYSTEM_THEME", theme);

  if (INCLUDE_APP_MAIN_ON_THEME_CHANGE) {
    document.getElementsByTagName("html")[0].classList.add(theme);
  } else if (document.getElementsByClassName("app-wrapper").length) {
    document.getElementsByClassName("app-wrapper")[0].className = "app-wrapper";
    document.getElementsByClassName("app-wrapper")[0].classList.add(theme);

    document.getElementsByClassName("main-container")[0].className =
      "main-container";
    document
      .getElementsByClassName("main-container")[0]
      .classList.add("lightblue");
  }
}

/**
 * @description 在 ucf 模式下获取菜单信息, 适应 HOW_TO_GET_MENU_INFO_IN_UCF 为 cookie 模式或 search 模式
 * @param {String} key 菜单信息字段
 * @example Search 模式下页面地址如 http://127.0.0.1:8091/?app_code=BIZFRAME&&menu_code=bizSetUser#/bizMenu/bizUserManager/bizSetUser
 */
export function getMenuInfoInUcf(key) {
  const {
    LOCAL_CONFIG: { HOW_TO_GET_MENU_INFO_IN_UCF }
  } = window;

  const { search } = parseUrl();

  const searchParams = new URLSearchParams(search);

  if (HOW_TO_GET_MENU_INFO_IN_UCF === "cookie") {
    return Cookies.get(key) || "";
  } else if (HOW_TO_GET_MENU_INFO_IN_UCF === "search") {
    return searchParams.has(key)
      ? decodeURIComponent(searchParams.get(key))
      : "";
  }
}

export function prefetch(subsystem) {
  if (process.env.NODE_ENV === "development") {
    return new Promise(resolve => {
      import(`@src/biz/${subsystem}/prefetch.js`).then(({ default: func }) => {
        resolve(func);
      });
    });
  }

  if (process.env.NODE_ENV === "production") {
    return new Promise(resolve => {
      requirejs([`./${subsystem}/prefetch.js`], ({ default: func }) => {
        resolve(func);
      });
    });
  }
}

/**
 * @description 判断当前页面是否在 ucf 客户端加载
 */
export function isUcf() {
  const {
    LOCAL_CONFIG: { isUcf: is_ucf }
  } = window;

  const { search } = parseUrl();

  const searchParams = new URLSearchParams(search);
  const key = "browser";
  const value = "ucf";

  if (searchParams.get(key) === value) {
    return true;
  }

  if (Cookies.get(key) === value) {
    return true;
  }

  if (is_ucf) {
    return true;
  }

  return false;
}

/**
 * @description 判断当前页面是否在 iframe 加载
 */
export function isFrame() {
  const {
    LOCAL_CONFIG: { isFrame: is_frame }
  } = window;

  const { search } = parseUrl();

  const searchParams = new URLSearchParams(search);
  const key = "browser";
  const value = "iframe";

  if (searchParams.get(key) === value) {
    return true;
  }

  if (is_frame) {
    return true;
  }

  return false;
}

/**
 * @description simple url parser
 * @param {string} path
 */
export function parseUrl() {
  let { search, hash } = location;

  if (hash && hash.includes("?")) {
    search = hash.replace(hash.split("?")[0], "");
    hash = hash.split("?")[0];
  }

  return { search, hash };
}
