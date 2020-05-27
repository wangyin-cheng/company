<template>
  <div>
    <div @click="lockScreen">
      <h-icon name="lock"></h-icon>
    </div>
    <h-msg-box v-model = "isShow"
            :title="$t('m.i.topBar.lockScreenTitle')"
            :closable = "closable"
            transfer
            :mask-closable="false"
            width=400
            @keyup.enter.native="lockValid"
            ref = "msgbox">
      <h-input :placeholder="$t('m.i.topBar.lockScreenMsg')" v-model="password" type="password" autocomplete="new-password"></h-input>
      <div slot="footer" style="margin-top:-8px;">
        <h-button type="primary" @click="lockValid">{{$t('m.i.common.confirm')}}</h-button>
        <!-- <h-button type="primary"  v-if="submitingFlag" disabled>{{$t('m.i.common.submiting')}}</h-button>
        <h-button type="primary" v-else @click="lockValid">确定</h-button> -->
      </div>
    </h-msg-box>
  </div>
</template>
<script>
import {reLogin} from '@frame/api/login'
import {mapGetters, mapState} from 'vuex'
import Cookies from 'js-cookie'
export default {
  name: 'LockScreen',
  data () {
    return {
      password: '',
      disabled: true,
      errorTip: '',
      closable: false,
      isShow: false,
      timer: null,
      submitingFlag: false,
      isHidePwdAndLockScreen: false
    }
  },
  props: {
    lockTime: {
      type: Number,
      default: 1
    }
  },
  computed: {
    ...mapGetters([
      'lock'
    ]),
    ...mapState({
      lock: function (state) {
        let sLockscreen = Cookies.get('lock')
        if (state.app.lock == '' && sLockscreen == 'true') {
          this.$store.dispatch('lockscreen')
        }
        return state.app.lock
      }
    }),
    lockTimes () {
      return this.lockTime * 60 * 1000
    }
  },
  methods: {
    lockTimer () {
      // if (this.timer != 'null') {
      clearTimeout(this.timer)
      // }
      if(!this.submitingFlag){
        if (this.isShow) {//解决锁屏后，会话失效未弹出会话超时问题 20200316 add by zhouzx
          this.$http.post(window.LOCAL_CONFIG.OMC_GSV + '/lock.json' + '?time=' + new Date().getTime()).then(res => {})
        }
      }
      let that = this
      if (!this.isShow) {
        this.timer = setTimeout(function () {
          that.lockScreen()
        }, that.lockTimes)
      }
    },
    lockScreen () {
      this.$store.dispatch('lockscreen')
      this.isShow = true
      if(!this.submitingFlag){
          this.$http.post(window.LOCAL_CONFIG.OMC_GSV + '/lock.json' + '?time=' + new Date().getTime()).then(res => {})
      }
      
    },
    setTip (tip) { // 消息提示，1.5秒后自动关闭
      this.errorTip = tip
      // this.disabled = false
      // setTimeout(() => {
      //   this.disabled = true
      //   this.errorTip = ''
      // }, 1500)
      this.$hMessage.info({content:tip,duration: 3,closable: true});
    },
    lockValid () {
      if (!this.password) {
        //密码不能为空
        this.setTip(this.$t('m.i.common.passwordMsg_1'))
      } else {
        if (this.$store.getters.token) {
          let username = window.sessionStorage.getItem('userName')
          let tenantId = window.sessionStorage.getItem('tenantId')
          let kindCode = window.sessionStorage.getItem('kindCode')
          this.submitingFlag = true
          if (username) {
            reLogin(username, this.password, tenantId, kindCode).then(res => {
              this.submitingFlag = false
              if (res.data && res.data.return_code == '0') {
                this.isShow = false
                this.password = ''
                // this.$hMessage.success({content:'重新登录成功',duration: 3,closable: true});
                this.$hMessage.success({content:this.$t('m.i.topBar.lockReLoginSuccess'),duration: 3,closable: true});
                this.$store.dispatch('unlockscreen')
                let isRefresh = window.LOCAL_CONFIG.isRefreshLockedScreen + ''
                if(isRefresh == 'true'){
                  this.$nextTick(() => {
                    setTimeout(() => {
                      location.reload()
                    }, 500)
                  })
                }
              } else {
                this.$hMessage.info({content:res.data.return_info,duration: 3,closable: true});
                this.password = ''
              }
            }).catch(error => {
              this.submitingFlag = false
              // this.$hMessage.info({content:'当前系统登录出错,请重新登录',duration: 3,closable: true});
              this.$hMessage.info({content:this.$t('m.i.topBar.reloginError'),duration: 3,closable: true});
              this.$store.dispatch('ReLogin')
            })
          } else {
            this.submitingFlag = false
            // this.$hMessage.error({content:'当前未登录，系统出错！',duration: 3,closable: true});
            this.$hMessage.error({content:this.$t('m.i.topBar.nologinError'),duration: 3,closable: true});
            this.$store.dispatch('ReLogin')
          }
        } else {
          this.isShow = false
        }
      }
    }
  },
  created () {
    let isHidePwdAndLockScreen = window.LOCAL_CONFIG.isHidePwdAndLockScreen + ''
    if (isHidePwdAndLockScreen === 'true') {
      this.isHidePwdAndLockScreen = true
    }
    if (this.lock && !this.isHidePwdAndLockScreen) {
      this.isShow = true
    }
  },
  mounted () {
    document.addEventListener('mousemove', this.lockTimer)
    document.addEventListener('mousedown', this.lockTimer)
  },
  beforeDestory () {
    document.removeEventListener('mousemove', this.lockTimer)
    document.removeEventListener('mousedown', this.lockTimer)
  }
}
</script>
