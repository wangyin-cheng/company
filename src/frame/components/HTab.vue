<template>
    <div>
        <h-row>
            <h-col span="24">
                <div ref="scrollBody">
                    <div class="tabs-view">
                        <h-tag :name="tag.name" v-for="(tag, index) in visitedViews" v-show='canShow[index]==undefined?true:canShow[index]' :key="index" @click.native="handleChangeCom($event, index)" :color="isActive(index)">
                            {{tag.title}}
                        </h-tag>
                    </div>
                    <div class="tabs-content">
                        <keep-alive>
                            <component :is="curComponent"  v-if="curComponent!=''"></component>
                        </keep-alive>
                    </div>
                </div>
            </h-col>
        </h-row>
    </div>
</template>
<script>
export default {
  name: 'htab',
  data () {
    return {
      curComponent: '',
      name: ''
    }
  },
  props: {
    visitedViews: {
      type: Array,
      default () {
        return []
      }
    },
    keyObj: {
      type: Object,
      default () {
        return {}
      }
    },
    canShow: {
      type: Array,
      default () {
        return []
      }
    }
  },
  watch: {
    visitedViews: {
      handler (val, old) {
        console.log(val)
      },
      deep: true
    }
  },
  methods: {
    handleChangeCom (event, index) {
      this.curComponent = this.visitedViews[index].component
      this.name = this.visitedViews[index].name
      this.$nextTick(() => {
        // this.broadcast(this.name,'likeAStar',this.keyObj);
      })
    },
    isActive (index) {
      if (this.name == this.visitedViews[index].name) {
        return 'active'
      }
      return 'default'
    },
    changeTabHeight (val) {
      this.$nextTick(function () {
        this.tabHeight = Number(val)
        // this.broadcast(this.name,'resizeTable',this.tabHeight);
      })
    }
  },
  mounted () {
    let that = this
    this.$nextTick(() => {
      if (that.name == '' && that.visitedViews.length > 0) {
        that.curComponent = that.visitedViews[0].component
        that.name = this.visitedViews[0].name
      }
    })
  }
}
</script>
