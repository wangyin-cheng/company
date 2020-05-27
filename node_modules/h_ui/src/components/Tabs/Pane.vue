<template>
  <div v-if="nolazy" :class="prefixCls" v-show="show"><slot></slot></div>
</template>
<script>
  const prefixCls = 'h-tabs-tabpane';

  export default {
    name: 'TabPane',
    props: {
      name: {
        type: String
      },
      label: {
        type: [String, Function],
        default: ''
      },
      icon: {
        type: String
      },
      disabled: {
        type: Boolean,
        default: false
      },
      closable: {
        type: Boolean,
        default: null
      }
    },
    data () {
      return {
        prefixCls: prefixCls,
        show: true,
        currentName: this.name,
        nolazy:false,
      };
    },
    methods: {
      updateNav () {
        this.$parent.updateNav();
      }
    },
    watch: {
      name (val) {
        this.currentName = val;
        this.updateNav();
      },
      label () {
        this.updateNav();
      },
      icon () {
        this.updateNav();
      },
      disabled () {
        this.updateNav();
      }
    },
    mounted () {
      this.updateNav();
      if(!this.$parent.lazy||this.$parent.animated){
        this.nolazy = true
      }
    }
  };
</script>
