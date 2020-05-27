import { t } from '../locale'
export default {
  methods: {
    // 可变参数，用方法t来替代this
    t(...args) {
      return t.apply(this, args)
    }
  }
}
