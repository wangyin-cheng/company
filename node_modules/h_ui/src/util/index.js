import deepCloneAs from "./deepCloneAs";
import debounce from "./debounce";
import throttle from "./throttle";
import isArrayLike from "./isArrayLike";
import isArrayLikeObject from "./isArrayLikeObject";
import isKeyMatch from "./isKeyMatch";
import isObject from "./isObject";
import noop from "./noop";
import Popper from "./popper.min";

/**
 * @description 工具方法
 * @example import _ from "@/util"; _.isKeyMatch(event, "Enter");
 * @author yangyc21550@hundsun.com
 */
export default { deepCloneAs, debounce, throttle, isArrayLike, isArrayLikeObject, isKeyMatch, isObject, noop };
export { Popper };
