// 目前支持的键值集合
const keyInfoMap = new Map([
  ["Esc", { code: "Escape", which: 27, keyCode: 27 }],
  ["Enter", { code: "Enter", which: 13, keyCode: 13 }],
  ["Space", { code: "Space", which: 32, keyCode: 32 }],
  ["Up", { code: "ArrowUp", which: 38, keyCode: 38 }],
  ["Right", { code: "ArrowRight", which: 39, keyCode: 39 }],
  ["Down", { code: "ArrowDown", which: 40, keyCode: 40 }],
  ["Left", { code: "ArrowLeft", which: 37, keyCode: 37 }],
  ["A", { code: "KeyA", which: 65, keyCode: 65 }],
  ["D", { code: "KeyD", which: 68, keyCode: 68 }]
]);

/**
 * @description 校验触发键盘事件的按键是否与某个键值相匹配
 * @param event {KeyboardEvent} 键盘事件对象
 * @param key {String} 指定的键值
 * @example isKeyMatch(event, "Enter")
 * @author yangyc21550@hundsun.com
 */
function isKeyMatch(event, key) {
  if (key && typeof key === "string" && keyInfoMap.has(key)) {
    if (
      (event["code"] && event["code"] === keyInfoMap.get(key)["code"]) ||
      (event["which"] && event["which"] === keyInfoMap.get(key)["which"]) ||
      (event["keyCode"] && event["keyCode"] === keyInfoMap.get(key)["keyCode"])
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export default isKeyMatch;
