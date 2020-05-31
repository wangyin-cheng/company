<template>
  <div>
    <h-msg-box v-model="isShow"
                width="1100" 
                height="420"
                :styles="{top: '50px'}" 
                :mask-closable="false" 
                :scrollable="false" 
                :canDrag="false"
                :closable="closable"
                @on-close="handleAction" >
          <div slot="header" class="h-modal-setUser-header"></div> 
          <!-- <div slot="close" class="h-modal-setUser-close"></div> -->
          <div class="modal-body">
            <h-dialog-body ref="body"
                           :title="title"
                           @handleAction="handleAction">
            </h-dialog-body>  
          </div>     
          <div slot="footer" class="h-modal-setUser-footer"></div>  
      </h-msg-box>
  </div>
</template>

<script>
import Bus from './bus.js'
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    closable: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      loading: false,
      isShow: false,
    }
  },

  methods: {
    handleAction(button) {
      this.$emit('action', button)
      Bus.$emit('handleMsg', '')
    },

    open() {
      this.isShow = !this.isShow
    },

    close() {
      this.isShow = !this.isShow
    }
  }
}
</script>

<style scoped>
.h-modal-setUser-header {
  height: 21px;
}
.overlay {
  text-align: center;
  height: 30px;
  line-height: 30px;
}

.overlay .glyphicon-refresh {
  animation: spin 2s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
</style>
