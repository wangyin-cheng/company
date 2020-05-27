let tmpId = "";

/**
 * @description resolve routes from menus
 * @param {array} menus - menus from server or local config
 * @param {object} routeComponents - async route components defined by subsystem, mostly like id => import()
 */
export function resolveRoutesFromMenus(menus = [], routeComponents) {
  const routes = [];
  const walk = menus => {
    menus.forEach(
      ({
        url,
        url: originalUrl,
        id,
        title,
        children,
        app_code,
        kind_code,
        menu_type,
        menu_arg,
        icon,
        is_hidden,
        is_keep_alivea,
        parent_id,
        operator_code
      }) => {
        if (parent_id === LOCAL_CONFIG.MENUS_ROOT_NAME) {
          tmpId = id;
        }

        if (children && children.length) {
          walk(children);
          return;
        }

        let route = {
          path: resolveRoutePath(url, menu_type),
          component: resolveRouteComponent(id, menu_type, routeComponents),
          name: title,
          meta: {
            id,
            subSysName: app_code || kind_code,
            originalUrl,
            menuArgs: resolveMenuArgs(menu_arg),
            menu_type,
            icon,
            hidden: resolveHidden(is_hidden),
            isKeepAlive: resolveKeepAlive(is_keep_alivea),
            comName: id,
            rootId: tmpId,
            kindCode: kind_code,
            operatorCode: operator_code
            // param: "",
            // newparam: "",
            // otherPrefix: "",
            // system_code: "",
            // optRight: "",
            // hasCollect: ""
          }
        };

        if (isIframeMenu(menu_type)) {
          route.props = {
            url
          };
        }

        routes.push(route);
      }
    );
  };

  walk(Array.isArray(menus) ? menus : [menus]);

  tmpId = "";

  return routes;
}

function resolveRoutePath(url, menu_type) {
  if (isIframeMenu(menu_type)) {
    const a = document.createElement("a");

    // gotta be standard url, means search first
    a.href = url;

    // make sure url is unique under any circumstances
    return `/${a.host}${a.pathname}${uniqueId()}`;
  }

  return url;
}

function resolveRouteComponent(id, menu_type, routeComponents) {
  if (isIframeMenu(menu_type)) {
    return () =>
      import(/* webpackChunkName: "frame/viewframe" */ `@frame/views/frame.vue`);
  }

  return {
    name: id + "",
    template: "<route-component></route-component>",
    components: {
      routeComponent: () => {
        if (routeComponents && routeComponents.hasOwnProperty(id)) {
          return routeComponents[id]();
        }

        return import(/* webpackChunkName: "frame/noPage" */ `@frame/views/noPage.vue`);
      }
    }
  };
}

function resolveMenuArgs(menu_arg) {
  let args = {};

  // json string
  if (typeof menu_arg === "string" && menu_arg !== "") {
    try {
      args = { menu_arg: JSON.parse(menu_arg), ...JSON.parse(menu_arg) };
    } catch (error) {
      console.warn("menu_arg must be a json string");
    }
  }

  // json object
  if (typeof menu_arg === "object") {
    args = { menu_arg, ...menu_arg };
  }

  return args;
}

function resolveHidden(is_hidden) {
  if (typeof is_hidden === "undefined") {
    return false;
  }

  return Boolean(is_hidden);
}

function resolveKeepAlive(is_keep_alive) {
  if (typeof is_keep_alive === "undefined") {
    if (typeof LOCAL_CONFIG.isAllKeepAlive === "undefined") {
      return false;
    } else {
      return Boolean(LOCAL_CONFIG.isAllKeepAlive);
    }
  }

  return Boolean(is_keep_alive);
}

function isIframeMenu(menu_type) {
  return menu_type === "iframe";
}

/** Used to generate unique IDs. */
const idCounter = {};

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @since 0.1.0
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @see random
 * @example
 *
 * uniqueId('contact_')
 * // => 'contact_104'
 *
 * uniqueId()
 * // => '105'
 */
function uniqueId(prefix = "$lodash$") {
  if (!idCounter[prefix]) {
    idCounter[prefix] = 0;
  }

  const id = ++idCounter[prefix];
  if (prefix === "$lodash$") {
    return `${id}`;
  }

  return `${prefix + id}`;
}
