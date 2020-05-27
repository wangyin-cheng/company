<template>
  <div class='h-notice-bar'>
    <div class="h-notice-bar-status">
      <h-icon name='record'
        :color="status==='0'?'#1ede13':'red'">
      </h-icon>
      <span>{{ status_label }}</span>
    </div>
    <div class="h-notice-bar-time">
      <h-icon name='time'></h-icon>
      <span>时间：{{exch_date_time}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeBar',
  props: {},
  data () {
    return {
      'status': '0',
      'status_label': '就绪',
      'exch_date_time': new Date()
    }
  },
  computed: {
    // status_color () {
    //   return this.status==='0'?'green':'red'
    // }
  },
  mounted () {
    setInterval(() => { this.exch_date_time = new Date() }, 1000)
  }
}
</script>
