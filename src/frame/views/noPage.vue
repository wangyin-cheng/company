<template>
  <div>
    没有配置.vue相应的url地址，叶子节点必须配置url，请检查
    'activeIndex'-{{activeIndex}}
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
export default {
  name: 'noPage',
  computed: {
    ...mapGetters([
      'activeIndex'
    ])
  },
  created () {
    console.log(this.$store)
  }
}
</script>
