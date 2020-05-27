<template>
  <div class="app-login">
    <div class="login-bg">
      <img src="../assets/login-header2.png" height="510px" width="845px"/>
      <!-- <lottie :options="defaultOptions" :height="492" :width="845" v-on:animCreated="handleAnimation"/> -->
    </div>
    <div class="login-wrapper">
      <div class="login-body">
        <!-- <div class="link-reg"><a href="#">{{$t('m.i.common.register')}}</a></div> -->
        <div class="login-wel">
          <div class="login-wel-title">{{$t('m.i.common.welcom')+'~'}}</div>
          <div class="login-wel-plantform">{{sysName}}</div>
        </div>
        <div class="login-form">
          <h-form autocomplete="off" :model="loginForm" ref="loginForm" label-position="left" class="card-box login-form">
            <div class="login-form-wrapper" >
                <h-form-item prop="username" :class="{'userFocus':userFocusStatus}">
                  <h-input name="username"  type="text"  v-model="loginForm.username" :placeholder="$t('m.i.common.username')"  @on-focus="handlefocus('user')"  @on-blur="handleblur('user')" @on-change="handleChange('user')" @on-enter="handleEnter('user')" ref='username'>
                    <h-icon name="icon-u-a-login-user" size="large" slot="prepend"></h-icon>
                  </h-input>
                  <div class="verify-tip verify-bottom" v-show='userError'>
                    <div class="verify-tip-arrow"></div>
                    <div class="verify-tip-inner">{{userErrorInfo}}</div>
                  </div>
                </h-form-item>
                <h-form-item prop="password" :class="{'pwdFocus':pwdFocusStatus}">
                  <h-input type="password" v-model="loginForm.password" autocomplete="new-password"
                    :placeholder="$t('m.i.common.password')"  @on-focus="handlefocus('pwd')" @on-blur="handleblur('pwd')" @on-enter="handleEnter('pwd')" ref='password'>
                    <h-icon name="u-a-pwd" slot="prepend"></h-icon>
                  </h-input>
                  <div class="verify-tip verify-bottom"  v-show='passError'>
                    <div class="verify-tip-arrow"></div>
                    <div class="verify-tip-inner">{{passErrorInfo}}</div>
                  </div>
                </h-form-item>
                <!-- 多租户 -->
                <h-form-item prop="tenantId" :class="{'tenantFocus':tenantFocusStatus}" v-if="isShowTenant">
                  <h-input name="tenantId" type="text" v-model="loginForm.tenantName" autocomplete="on"
                    :placeholder="$t('m.i.common.chooseTenant')"  @on-focus="handlefocus('tenant')" @on-blur="handleblur('tenant')" @on-enter="handleEnter('tenant')" @on-change="handleChange('tenant')" ref='tenantPut'>
                    <h-icon name="person-stalker" slot="prepend"></h-icon>
                  </h-input>
                  <div class="tenant-wrap" v-show='tenantListShow' ref='tenant'>
                    <div v-for="(item,index) in tenantData" :key="index" class="tenant-wrap-item" tabindex="1" @keyup.enter="handleEnter('tenantChecked')">
                      <span class="tenant-wrap-item-span" @click.prevent="handleTenant(item)" >{{item.tenant_name}}</span>
                    </div>
                  </div>
                </h-form-item>
                <!-- 验证码 -->
                <h-form-item prop="checkcode" :class="{'checkFocus':checkFocusStatus}" v-if="loginHasValidateCode">
                  <h-input name="checkcode" type="text" v-model="loginForm.checkcode" autocomplete="on"
                    :placeholder="$t('m.i.common.checkcode')" class="checkInput" style="width: 258px;" @on-focus="handlefocus('check')" @on-blur="handleblur('check')" @on-enter="handleEnter('check')" ref='check'>
                     <h-icon name="u-a-chk" slot="prepend"></h-icon>
                    </h-input>
                  <div class="checkcode" >
                    <!-- <canvas  id="codeimg" style="width:70px;height: 36px;cursor: pointer;" @click="refreshCode" :title="$t('m.i.common.refreshCode')"></canvas> -->
                    <a href="javascript:void(0)" @click="createCode"><img  id="codeimg" :src="checkCodeUrl" style="width:100px;height: 36px;cursor: pointer;" :title="$t('m.i.common.refreshCode')"></a>
                  </div>
                  <div class="verify-tip verify-bottom"  v-show='codeError'>
                    <div class="verify-tip-arrow"></div>
                    <div class="verify-tip-inner">{{codeErrorInfo}}</div>
                  </div>
                </h-form-item>
                <!-- 邮件 -->
                <h-form-item prop="emailcode" :class="{'emailFocus':emailFocusStatus}" v-if="isShowEamilVerify">
                  <h-input name="emailcode" type="text" v-model="loginForm.emailcode" autocomplete="on"
                    :placeholder="$t('m.i.common.emailcode')" class="checkInput" style="width: 258px;" @on-focus="handlefocus('email')" @on-blur="handleblur('email')" @on-enter="handleEnter('email')" ref='email'>
                     <h-icon name="u-a-chk" slot="prepend"></h-icon>
                    </h-input>
                  <div class="emailcode" >
                    <span v-if="show" @click="getEmailCheckCode(60,true)">{{$t('m.i.login.getCode')}}</span>
                    <span v-else  class="count" >{{count + $t('m.i.login.rGetCode')}}</span>
                  </div>
                  <div class="verify-tip verify-bottom"  v-show='emailError'>
                    <div class="verify-tip-arrow"></div>
                    <div class="verify-tip-inner">{{emailErrorInfo}}</div>
                  </div>
                </h-form-item>
            </div>
            <!-- <div class="form-item-checkbox">
                <h-form-item>
                  <h-checkbox v-model="remePswd">{{$t('m.i.common.remePswd')}}</h-checkbox>
                  <a href="#">{{$t('m.i.common.forgetPswd')}}</a>
                </h-form-item>
            </div> -->
            <div class="form-item-submit">
                <h-form-item style="margin-bottom: 0">
                  <h-button type="primary" style="width:100%;" :loading="loading" @click.native.prevent="handleLogin" ref="submit">
                    {{$t('m.i.common.login')}}
                  </h-button>
                </h-form-item>
            </div>
          </h-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Lottie from './frame/Lottie.vue'
// import animationData from '@frame/assets/pinjump.json'
import { saveUserBehaviorLog,encryptParam } from '@frame/api/login/index'
import { switchTheme } from "@common/utils"
import Cookies from 'js-cookie'
export default {
  name: 'login',
  // components: {
  //   'lottie': Lottie
  // },
  data () {
    return {
      // 系统名
      sysName: window.LOCAL_CONFIG.SYS_NAME,
      remePswd: '',
      loginHasValidateCode: false,
      checkCodeUrl: '',
      loginForm: {
        username: '',
        password: '',
        tenantId: '',
        tenantName: '',
        kindCode:'',
        checkcode: '',
        emailcode:''
      },
      randomCode: '',
      loading: false,
      showDialog: false,
      userError: false,
      userErrorInfo: '',
      codeError: false,
      codeErrorInfo: '',
      passError: false,
      passErrorInfo: '',
      userFocusStatus: false,
      pwdFocusStatus: false,
      checkFocusStatus: false,
      tenantFocusStatus: false,
      // defaultOptions: {animationData: animationData},
      animationSpeed: 1,
      tenantData: [],
      tenantListShow: false,
      isShowTenant: false,
      tenantIdx:-1,
      isShowEamilVerify:false,
      emailFocusStatus :false,
      emailError: false,
      emailErrorInfo:'',
      show:true,
      timer:null,
      count:1,
      isOpenFirstPwd:'',
      isHidePwdAndLockScreen:'',
      freeLogin:''
    }
  },
  watch: {
    loginForm: {
      handler: function () {
        this.userError = false
        this.passError = false
        // this.loading = false
        this.codeError = false
      },
      deep: true
    }
  },
  methods: {
    bodyClick (event) {
      this.tenantListShow = !!this.tenantFocusStatus
    },
    handleTenant (param) {
      this.loginForm.tenantId = param.tenant_id
      this.loginForm.tenantName = param.tenant_name
      this.loginForm.kindCode = param.kind_code
      this.tenantListShow = false
      this.tenantFocusStatus = false
    },
    up(){
      if(this.tenantIdx >= 1){
        this.tenantIdx --
        this.update('up')
      }
    },
    down(){
      if(this.tenantIdx < this.tenantData.length-1){
        this.tenantIdx ++
        this.update('down')
      }
    },
    update(param){
      let obj = document.getElementsByClassName('tenant-wrap-item')
      if(this.tenantIdx >= 0){
        if(this.tenantIdx > 0) obj[this.tenantIdx].focus()
        obj[this.tenantIdx].style.background = '#eee'
        if(param == 'up'){
          if(this.tenantIdx>-1) obj[this.tenantIdx+1].style.removeProperty("background")
        }else{
          if(this.tenantIdx>0) obj[this.tenantIdx-1].style.removeProperty("background")
        }
      }
    },
    handleAnimation (anim) {
      this.anim = anim
    },

    stop () {
      this.anim.stop()
    },

    play () {
      this.anim.play()
    },

    pause () {
      this.anim.pause()
    },

    onSpeedChange () {
      this.anim.setSpeed(this.animationSpeed)
    },
    handleEnter(param){
      switch (param) {
        case 'user' : 
          if(this.loginForm.username == ''){
            this.userError = true
            this.userErrorInfo = this.$t('m.i.login.userErr')
          }else{
            this.$refs.password.focus()
          }
          break
        case 'pwd' : 
          if(this.loginForm.password == ''){
            this.passError = true
            this.passErrorInfo = this.$t('m.i.login.pwdErr')
          }else{
            if(this.isShowTenant){
              this.$refs.tenantPut.focus()
              this.handlefocus('tenant')
            }else if(this.loginHasValidateCode){
              this.$refs.check.focus()
            }else if(this.isShowEamilVerify){
              this.$refs.email.focus()
            }else{
              this.handleLogin()
            }
          }
          break
        case 'tenant' : 
          if(this.loginHasValidateCode){
            this.$refs.check.focus()
            this.tenantListShow = false
          }else{
            this.$refs.tenantPut.blur()
            if(this.tenantData && this.tenantData.length > 0 ) this.handleTenant(this.tenantData[0])
            this.tenantListShow = false
            this.handleLogin()
          }
          break
        case 'tenantChecked':
          if(this.loginHasValidateCode){
            this.$refs.check.focus()
            this.handleTenant(this.tenantData[this.tenantIdx])
            this.tenantListShow = false
          }else{
            this.handleTenant(this.tenantData[this.tenantIdx])
            this.tenantListShow = false
            this.handleLogin()
          }
          break
        case 'check' : 
          if(this.loginHasValidateCode){
            if(this.loginForm.checkcode == ''){
              this.codeError = true
              this.codeErrorInfo = this.$t('m.i.login.checkErr')
            }else{
             this.handleLogin()
            }
          }else{
            this.handleLogin()
          }
          break
        case 'email' :
          if(this.isShowEamilVerify){
            if(this.loginForm.emailcode == ''){
              this.emailError = true
              this.emailErrorInfo = this.$t('m.i.login.emailErr')
            }else{
             this.handleLogin()
            }
          }else{
            this.handleLogin()
          }
          break
      }
    },
    handlefocus (type) {
      if (type === 'user') this.userFocusStatus = true
      if (type === 'pwd') this.pwdFocusStatus = true
      if (type === 'check') this.checkFocusStatus = true
      if (type === 'tenant') {
        this.tenantFocusStatus = true
        this.tenantListShow = true
        document.body.addEventListener('click', this.bodyClick, true)
      }
      if(type === 'email') this.emailFocusStatus = true
    },
    handleblur (type) {
      if (type === 'user') {
        this.userFocusStatus = false 
        let isTenantMode = window.LOCAL_CONFIG.isTenantMode + ''
        if (isTenantMode === 'true') {
          if(this.loginForm.username == 'admin') {
            this.isShowTenant = false 
          }else{
            this.isShowTenant = true 
          }
        }
      }
      if (type === 'pwd') this.pwdFocusStatus = false
      if (type === 'check') this.checkFocusStatus = false
      if (type === 'tenant') {
        this.tenantFocusStatus = false
      }
      if(type === 'email') this.emailFocusStatus = false
    },
    handleChange(type){
      let isTenantMode = window.LOCAL_CONFIG.isTenantMode + ''
      let isTwoFactorCheck = window.LOCAL_CONFIG.isTwoFactorCheck + ''
      if (isTenantMode === 'true') {
        if(this.loginForm.username == 'admin') {
          this.isShowTenant = false 
        }else{
          this.isShowTenant = true 
        }
        //普通租户，登录时，选个租户（未找到租户或租户为非正常状态），再把租户文本框中值删掉，此时未选任何租户，继续提示“未找到租户或租户为非正常状态”
        if(type = 'tenant'){
          if (this.loginForm.tenantName == ""){
            this.loginForm.tenantId = ""
            this.loginForm.kindCode = ""
          }
        }
      }
      if(isTwoFactorCheck === 'true'){
        if(this.loginForm.username == 'admin') {
          this.isShowEamilVerify = false 
        }else{
          this.isShowEamilVerify = true 
        }
      }
    },
    handleLogin () {
      let that = this
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          if(this.loginForm.username=='') {
            this.handleEnter('user')
            return
          }
          if(this.loginForm.password==''){
            this.handleEnter('pwd')
            return
          }
          this.loading = true
          window.sessionStorage.setItem('currUserId', this.loginForm.username)
          this.$store.dispatch('Login', this.loginForm).then((res) => {
            // return_code: 0  登录成功
            this.loading = false
            if (res.return_code === '0') {
              if (res.nick_name && res.nick_name !== '') {
                let orgObj = {org_code: res.org_code, org_name: res.org_name}
                let isTenantMode = window.LOCAL_CONFIG.isTenantMode + ''
                let isOpenSpace = window.LOCAL_CONFIG.isOpenSpace + ''
                window.sessionStorage.setItem('nickName', res.nick_name)
                window.sessionStorage.setItem('user_type', res.user_type)
                window.sessionStorage.setItem('orgList', JSON.stringify(orgObj))
                //是否开启多租户
                if (isTenantMode == 'true' && res.operator_code != 'admin') {
                  let tenantCode = res.tenant_id == '' ? this.loginForm.tenantId : res.tenant_id
                  if(tenantCode == null || tenantCode == undefined || tenantCode=="null" || tenantCode == "undefined"){
                    tenantCode = ""
                  }
                  let tenantNameString = res.tenant_name == '' ? this.loginForm.tenantName : res.tenant_name
                  if(tenantNameString == null || tenantNameString == undefined || tenantNameString=="null" || tenantNameString == "undefined"){
                    tenantNameString = ""
                  }
                  let kindCodeString = res.kind_code == '' ? this.loginForm.kindCode : res.kind_code
                  if(kindCodeString == null || kindCodeString == undefined || kindCodeString=="null" || kindCodeString == "undefined"){
                    kindCodeString = ""
                  }
                  let systemNo = res.system_no
                  let systemNoString = systemNo ? systemNo : kindCodeString
                  window.sessionStorage.setItem('tenantId', tenantCode)
                  window.sessionStorage.setItem('tenantName', tenantNameString)
                  window.sessionStorage.setItem('kindCode', systemNoString)
                  Cookies.set('tenantId', tenantCode)
                  Cookies.set('tenantName', tenantNameString)
                  Cookies.set('kindCode', systemNoString)
                }
                //是否开启空间
                if(isOpenSpace == 'true'){
                  let envId = res.env_id ? res.env_id : res.envId
                  if(envId == null || envId == undefined || envId=="null" || envId == "undefined"){
                    envId = ""
                  }
                  let envName = res.env_name  ? res.env_name : res.envName
                  if(envName == null || envName == undefined || envName=="null" || envName == "undefined"){
                    envName = ""
                  }
                  window.sessionStorage.setItem('envId', envId)
                  window.sessionStorage.setItem('envName', envName)
                }
              } else {
                window.sessionStorage.setItem('nickName', this.loginForm.username)
              }
              window.sessionStorage.setItem('orgName', res.org_name)
              window.sessionStorage.setItem('lastLoginDateTime', res.last_login_date_time)
             
              //查询系统参数，判断密码是否符合校验强度
              if (that.freeLogin == 'false' && (that.isOpenFirstPwd == 'true' || that.isHidePwdAndLockScreen == 'false')) {
                let key1 = 'hs'
                let key2 = 'club'
                let key3 = '33#44'
                let password = BizSecurity.DES.encrypt(that.loginForm.password, key1, key2, key3)
                let url = '/isMeetPwdStrength'
                let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
                if (isUrlLowercase === 'true') {
                  url = url.toLowerCase()
                }
                url = url + '?time=' + new Date().getTime()+'&password='+password
                that.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(response => {
                  if (response.data) {
                    if(response.data.result){
                      window.sessionStorage.setItem('isMeetPwdStrength', response.data.result)
                    }else{
                      window.sessionStorage.setItem('isMeetPwdStrength', response.data)
                    }
                  }
                })
              }
              this.$router.push({ path: '/' })
              //记录用户行为分析--登录
              let recordUserBehavior = window.LOCAL_CONFIG.isRecordUserBehavior
              if(recordUserBehavior){
                let obj = {
                  actionId:'login',
                  consumerId:res.operator_code
                }
                saveUserBehaviorLog(obj).then(res =>{
                  if (res && res.data) {
                    return true
                  }
                })
              }
              // 清除定时器   
              clearInterval(this.timer)   
              this.timer = null
              this.show = true
              window.sessionStorage.removeItem('time') 
            } else {
              if (res.return_code === '-5' || res.return_code === '-6') {
              // return_code: -5 验证码为 -6 验证码错
                this.codeErrorInfo = res.return_info
                this.codeError = true
              } else {
                this.userErrorInfo = res.return_info
                this.$refs.username.focus()
                this.userError = true
              }
              if (this.loginHasValidateCode) {
                this.createCode()
              }
            }
          }).catch(err => {
            // 请求出错
            // this.$hMessage.error(this.$t('m.i.common.loginErr'));
            this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
            this.loading = false
            if (this.loginHasValidateCode) {
              this.createCode()
            }
          })
        } else {
          return false
        }
      })
    },
    refreshCode () {
      this.createCode()
    },
    codeBlur () {
      var checkCodeToken = this.randomCode
      if (this.loginForm.checkcode === '') {
        this.codeErrorInfo = this.$t('m.i.common.checkCodeMsg_1')
        this.codeError = true
      }
      if (this.loginForm.checkcode !== checkCodeToken) {
        this.codeErrorInfo = this.$t('m.i.common.checkCodeMsg_2')
        this.codeError = true
      }
    },
    nameBlur () {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      if (this.loginForm.username === '') {
        this.userErrorInfo = this.$t('m.i.common.userNameMsg_1')
        this.userError = true
      } else {
        let url = '/getSecurityKey.json' + '?time=' + new Date().getTime()
        if (isUrlLowercase === 'true') {
          url = url.toLowerCase()
        }
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(response => {
          if (response) {
            var key1 = response.data.key1
            var key2 = response.data.key2
            var key3 = response.data.key3
            var loginName = BizSecurity.DES.encrypt(this.loginForm.username, key1, key2, key3)
            let httpUrl = '/checkUserNameOrPwd.json' + '?time=' + new Date().getTime()
            if (isUrlLowercase === 'true') {
              httpUrl = httpUrl.toLowerCase()
            }
            this.$http.post(window.LOCAL_CONFIG.OMC_GSV + httpUrl, {flag: 1, loginName: loginName}).then(res => {
              if (res) {
                var data = res.data
                if (data[window.LOCAL_CONFIG.SUCCESS_KEY] != '0') {
                  this.userErrorInfo = data.return_info
                  this.userError = true
                }
              }
            })
          }
        })
      }
    },
    pwdBlur () {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      if (this.loginForm.password === '') {
        this.passErrorInfo = this.$t('m.i.common.passwordMsg_1')
        this.passError = true
      } else {
        if (this.loginForm.username === '') return
        let url = '/getSecurityKey.json' + '?time=' + new Date().getTime()
        if (isUrlLowercase === 'true') {
          url = url.toLowerCase()
        }
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(response => {
          if (response) {
            var key1 = response.data.key1
            var key2 = response.data.key2
            var key3 = response.data.key3
            var loginName = BizSecurity.DES.encrypt(this.loginForm.username, key1, key2, key3)
            var password = BizSecurity.DES.encrypt(this.loginForm.password, key1, key2, key3)
            let httpUrl = '/checkUserNameOrPwd.json' + '?time=' + new Date().getTime()
            if (isUrlLowercase === 'true') {
              httpUrl = httpUrl.toLowerCase()
            }
            this.$http.post(window.LOCAL_CONFIG.OMC_GSV + httpUrl, {flag: 2, loginName: loginName, password: password}).then(res => {
              if (res) {
                var data = res.data
                if (data[window.LOCAL_CONFIG.SUCCESS_KEY] != '0') {
                  this.passErrorInfo = data.return_info
                  this.passError = true
                }
              }
            })
          }
        })
      }
    },
    /* 随机干扰线条函数 */
    drawline (canvas, context) {
      // 若省略beginPath，则每点击一次验证码会累积干扰线的条
      context.beginPath()
      // 起点与终点在canvas宽高内随
      context.moveTo(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height))
      context.lineTo(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height))
      context.lineWidth = 1
      context.strokeStyle = '#275DB3'
      context.stroke()
    },
    getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
        //compatibility for firefox and chrome
        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if(!myPeerConnection){
          Cookies.set('clientIp', '127.0.0.1')
          return
        }
        var pc = new myPeerConnection({
          iceServers: []
        }),
        noop = function() {},
        localIPs = {},
        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
        key;
        function iterateIP(ip) {
            if (!localIPs[ip]) onNewIP(ip);
            localIPs[ip] = true;
        }
          //create a bogus data channel
        pc.createDataChannel("");
        // create offer and set local description
        pc.createOffer().then(function(sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
                if (line.indexOf('candidate') < 0) return;
                line.match(ipRegex).forEach(iterateIP);
            });
            pc.setLocalDescription(sdp, noop, noop);
        }).catch(function(reason) {
            // An error occurred, so handle the failure to connect
        });
        //sten for candidate events
        pc.onicecandidate = function(ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
            ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
        };
    },
    /* 生成验证 */
    createCode () {
      let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let url = '/getCheckCode' + '?time=' + new Date().getTime()
      let newUrl = '/getVerifyCode' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        url = url.toLowerCase()
        newUrl = newUrl.toLowerCase()
      }
      if (isUnderscore === 'true') {
        //先获取操作员中心提供的验证码，如果有权限就直接使用操作员中心的验证码，否则使用IAR提供的20200323 add by zhouzx
        newUrl = window.LOCAL_CONFIG.API_HOME + window.LOCAL_CONFIG.OMC_GSV + newUrl
        
        this.$http.get(newUrl).then(res => {
          if (res && res.data) {
            let data = res.data.img
            let uuid = res.data.id
            window.sessionStorage.setItem('uuid', uuid)
            // 后台生成验证码图
            this.checkCodeUrl = "data:image/png;base64,"+data
          }
        }, error => {
            url = window.LOCAL_CONFIG.API_HOME + window.LOCAL_CONFIG.OMC_GSV + url
            //url = window.LOCAL_CONFIG.API_HOME + url
            let xmlhttp = new XMLHttpRequest()
            xmlhttp.open('POST', url, true)
            xmlhttp.responseType = 'blob'
            xmlhttp.onload = function () {
              if (this.status === 200) {
                var blob = this.response
                var img = document.getElementById('codeimg')
                img.onload = function (e) {
                  window.URL.revokeObjectURL(img.src)
                }
                img.src = window.URL.createObjectURL(blob)
              }
            }
            xmlhttp.send()
        })

        /*url = window.LOCAL_CONFIG.API_HOME + window.LOCAL_CONFIG.OMC_GSV + url
        //url = window.LOCAL_CONFIG.API_HOME + url
        let xmlhttp = new XMLHttpRequest()
        xmlhttp.open('POST', url, true)
        xmlhttp.responseType = 'blob'
        xmlhttp.onload = function () {
          if (this.status === 200) {
            var blob = this.response
            var img = document.getElementById('codeimg')
            img.onload = function (e) {
              window.URL.revokeObjectURL(img.src)
            }
            img.src = window.URL.createObjectURL(blob)
          }
        }
        xmlhttp.send()*/
        
      } else {
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(res => {
          if (res && res.data) {
            let data = res.data
            let ranCode = data.code
            // 后台生成验证码图
            this.checkCodeUrl = window.LOCAL_CONFIG.API_HOME + window.LOCAL_CONFIG.OMC_GSV + '/resources/checkcode/' + ranCode + '.jpg'
          }
        })
      }
    },
    //获取邮箱验证码
    getEmailCheckCode(times,flag){
        if(this.loginForm.username == '' && flag){
          this.handleEnter('user')
          return
        }
        if(times == 60 && flag) {
          window.sessionStorage.setItem('time',new Date().getTime())
          let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
          let emailUrl = '/getEmailVerificationCode' + '?time=' + new Date().getTime()
          if (isUrlLowercase === 'true') {
            emailUrl = emailUrl.toLowerCase()
          }
          this.$http.post(window.LOCAL_CONFIG.OMC_GSV + emailUrl, {operatorCode: encryptParam(this.loginForm.username)}).then(res=>{})
        }
        this.show = false
        const TIME_COUNT = times
        if (!this.timer) {    
        this.count = TIME_COUNT  
        this.show = false
        this.timer = setInterval(() => {    
          if (this.count > 1 && this.count <= TIME_COUNT) {     
            this.count--
          } else {     
            this.show = true;     
            clearInterval(this.timer)   
            this.timer = null
            window.sessionStorage.removeItem('time')    
          }    
        }, 1000)    
      }  
    }
  },
  created () {
    // let logo = window.LOCAL_CONFIG.logo
    // if (logo) {
    //   let el = this.defaultOptions.animationData.assets[24]
    //   el.p = logo + '-login.png'
    //   el.u = './static/logo/'
    // }
    // document.getElementsByTagName('html')[0].className = Cookies.get('theme') ? Cookies.get('theme') : window.LOCAL_CONFIG.THEME
    switchTheme(Cookies.get('theme') ? Cookies.get('theme') : window.LOCAL_CONFIG.THEME);
    document.body.className = 'login'
    let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
    this.isOpenFirstPwd = window.LOCAL_CONFIG.isOpenFirstPwd + ''
    this.isHidePwdAndLockScreen = window.LOCAL_CONFIG.isHidePwdAndLockScreen + ''
    this.freeLogin = window.LOCAL_CONFIG.freeLogin + ''

    let url = '/loginHasValidateCode' + '?time=' + new Date().getTime()
    let tennatUrl = '/getTenantList' + '?time=' + new Date().getTime()
    if (isUrlLowercase == 'true') {
      url = url.toLowerCase()
      tennatUrl = tennatUrl.toLowerCase()
    }
    

    this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(response => {
      if (response && response.data) {
        let flag = response.data + ''
        let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
        if (isUnderscore === 'true') {
          if(response.data.result){
            flag = response.data.result
          }
        }
        if (flag === 'true') {
          this.loginHasValidateCode = true
          this.createCode()
        }
      }
    })
    // 获取租户
    let isTenantMode = window.LOCAL_CONFIG.isTenantMode + ''
    if (isTenantMode === 'true' && this.loginForm.username != 'admin') {
      this.isShowTenant = true
      this.$http.get(window.LOCAL_CONFIG.OMC_GSV + tennatUrl).then(response => {
        let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
        if(response && response.data){
          let data = (response.data instanceof Array) ? response.data : [response.data]
          if (isUnderscore === 'true') {
            this.tenantData = data
          } else {
            this.tenantData = data[0].rows
          }
        }
      })
    }
    this.getUserIP(function(ip){
        Cookies.set('clientIp', ip)
    });
    //邮箱
    if(window.LOCAL_CONFIG.isTwoFactorCheck + '' == 'true'){
      this.isShowEamilVerify = true
      let curTime = new Date().getTime()
      let lastTime = Number(window.sessionStorage.getItem('time'))
      if(lastTime){
        if( curTime < (lastTime + 60000)){
          let times = parseInt(60 - (curTime - lastTime)/1000)
          if(times > 0) this.getEmailCheckCode(times,false)
        }else{
          window.sessionStorage.removeItem('time')   
        }
      }
    }
    
  },
  mounted () {
    if (this.loginHasValidateCode) {
      this.createCode()
    }
    let _self = this
    document.onkeydown = function(e){
      let key = window.event.keyCode
      if(key == 38 )  _self.up()
      if(key == 40 )  _self.down()
    }
  },
  destroyed () {
    document.body.className = ''
  },
  beforeDestroy () { // 在组件生命周期结束的时候销毁。
    document.body.removeEventListener('click', this.bodyClick, false)
  },
  beforeCreate(){
    localStorage.setItem('lang', 'zh-CN')
    Cookies.set('lang', 'zh-CN')
    this.$i18n.locale = 'zh-CN'
  }
}
</script>
