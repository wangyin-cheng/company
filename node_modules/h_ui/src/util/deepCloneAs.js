/**
 * @description return a deep clone copy of target as keys list
 * @param {Object} target
 * @param {Array} keys
 * @returns {Object}
 * @author yangyc21550@hundsun.com
 */
function deepCloneAs(target = {}, keys = []) {
  let obj = {};
  for (const key of keys) {
    obj[key] = target[key] === undefined ? "" : target[key];
  }
  return obj;
}

export default deepCloneAs;
