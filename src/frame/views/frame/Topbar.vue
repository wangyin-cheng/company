<style lang="scss" scoped>
.icon-lock:before {
  font-size: 24px;
}
.h-topbar-msgbox {
  .h-form-row {
    .h-form-item {
      padding-right: 8px;
      .h-input-wrapper {
        vertical-align: top;
      }
      .h-select {
        vertical-align: top;
      }
    }
  }
}
</style>

<template>
  <div class="h-topbar">
    <div class="h-topbar-logo">
      <span class="h-topbar-logo-img" :style="logoStyle"></span>
      <span class="h-topbar-logo-span">{{sysName || $t("m.i.topBar.BusiInfraStru")}}</span>
    </div>
    <div class="h-topbar-nav">
      <template v-if="!isMergeMenu && menusRoot.length > 1">
        <div class="h-system-list">
          <div class="h-system-item" ref="systemItem">
            <h-menu theme="dark" :active-name="activeIndex" mode="horizontal">
              <draggable v-model="menusRoot" @start="drag=true" @end="onEnd" :move="onMove">
                <h-menu-item :name='index' @click.native.prevent.stop="activeSidebar(index,item.id)" v-for="(item, index) in menusRoot" :key="item.index" class="h-topbar-subMenu">{{item.title}}</h-menu-item>
              </draggable>
            </h-menu>
          </div>
        </div>
        <div class="h-system-more-sort" @mouseleave="hideSystemList" v-show="systemHeight>60">
          <div class="h-system-more" @click="showSystemList">
            <h-icon name="xf-more" size="24" v-show="systemHeight>60"></h-icon>
          </div>
          <transition name="slide-up">
            <div class="h-system-sort-list" v-show="showSystem && systemHeight>60">
              <ul>
                <draggable v-model="menusRoot" @start="drag=true" @end="onEnd" :move="onMove">
                  <h-menu-item :name='index' v-for="(item, index) in menusRoot" v-if="index >= showSysLen" :key="item.name" @click.native.prevent.stop="activeSidebar(index,item.id)">
                    <span class="h-system-title" @mouseenter="showDragColl(index)" @mouseleave="hideDragColl">
                      <b>{{item.title}}</b>
                      <h-icon name="xf-move" class="h-drag-icon" v-show="index==dragItemIndex"></h-icon>
                    </span>
                  </h-menu-item>
                </draggable>
              </ul>
            </div>
          </transition>
        </div>
      </template>
    </div>
    <div class="h-topbar-tool">
      <!--顶部搜索框 options菜单数据-->
      <HSearchselect v-if="showMenuSearch" :options="options" @select="onSelectMenu" ref="select"></HSearchselect>
      <h-menu theme="dark" mode="horizontal">
        <h-menu-item name='1' class="h-message-remind" v-if="isShowMsg">
          <h-msg></h-msg>
        </h-menu-item>
        <h-menu-item name='2' v-if="!isHidePwdAndLockScreen && !freeLogin" style="z-index: 10">
          <lock-screen :lockTime='locktime'></lock-screen>
        </h-menu-item>
        <h-menu-item name='3' v-if="isShowLocalLang && localLangs.length > 0">
          <h-dropdown @on-click="changeLocale">
            <h-icon name="earth" class="lang-icon"></h-icon>
            <h-dropdown-menu slot="list">
              <h-dropdown-item name="zh-CN" :selected="$i18n.locale==='zh-CN'" v-if="localLangs.indexOf('zh-CN') != -1">简体中文（中国）</h-dropdown-item>
              <h-dropdown-item name="zh-TW" :selected="$i18n.locale==='zh-TW'" v-if="localLangs.indexOf('zh-TW') != -1">繁体中文（中国台湾）</h-dropdown-item>
              <h-dropdown-item name="en-US" :selected="$i18n.locale==='en-US'" v-if="localLangs.indexOf('en-US') != -1">English</h-dropdown-item>
              <!-- <h-dropdown-item v-for="item in BIZ_SYSTEM_LANGUAGE" :value="item.code" :key="item.code" :name="item.code" :selected="$i18n.locale===item.code">{{item.text}}</h-dropdown-item> -->
            </h-dropdown-menu>
          </h-dropdown>
        </h-menu-item>
        <!-- 当前租户 -->
        <h-menu-item name='4' v-if="currTenantId != null && currTenantId != ''&& currTenantId != 'null'">
          <span>{{$t('m.i.topBar.curTenanter')+currTenantName}}</span>
        </h-menu-item>
        <!-- 当前空间 -->
        <h-menu-item name='5' v-if="isShowSpace">
          <span>{{$t('m.i.topBar.curSpace')}}{{curSpaceName ? curSpaceName : $t('m.i.topBar.defaultSpace')}}</span>
        </h-menu-item>
        <!-- 分割线 -->
        <h-menu-item name='6' style="z-index: 10" class="toolSplit">
          <span class="h-topbar-split"></span>
        </h-menu-item>
        <!-- 下拉面板 -->
        <h-submenu name='7' class="toolLast">
          <template slot='title'>
            <h-icon name="xf-user-L" size="24" color="#9BABBF;"></h-icon>
            <span class="nick-name">{{nickName}}</span>
          </template>
          <!--基本信息-->
          <h-menu-item name='7-5'>
            <div class="h-topbar-tool-personal">
              <h-row class="h-topbar-tool-personalInfo">
                <h-col span="6">
                  <!--头像-->
                  <div class="h-topbar-tool-personalInfo-pic">
                    <h-icon name="xf-user-L" size="68" color="#9BABBF"></h-icon>
                  </div>
                </h-col>
                <h-col span="18">
                  <!--右边个人信息-->
                  <div class="h-topbar-tool-personalInfo-view">
                    <span class="h-info-user">{{nickName}}<span v-if="currTenantId!=null&&currTenantId!=''&&currTenantId!='null'">{{'(' + currTenantName + ')'}}</span></span>
                    <span class="h-info-org">{{orgName}}</span>
                    <span class="h-info-time">{{$t('m.i.common.lastLoginTime') + lastLoginDateTime}}</span>
                    <span class="h-info-time">{{$t('m.i.common.curVersion') + version}}</span>
                  </div>
                </h-col>
              </h-row>
              <!--换肤-->
              <h-row class="h-topbar-tool-personalSkin" v-if="isShowTheme">
                <h-col span="5">
                  <!--标题-->
                  <div class="h-topbar-tool-personalSkin-title">
                    <span>{{$t('m.i.common.sysTheme')}}</span>
                  </div>
                </h-col>
                <h-col span="19">
                  <!--换肤-->
                  <div class="h-topbar-tool-personalSkin-active">
                    <span @click="handleChangeTheme('lightblue')" :title="$t('m.i.topBar.lightblueTheme')" style="border:1px solid rgba(2, 169, 249, 0.4)">
                      <h-icon name="u-a-skin-default" color="#02A9F9" :class="{'active-theme':this.theme=='lightblue'}"></h-icon>
                    </span>
                    <!-- <span class="disable-span" :title="$t('m.i.topBar.deafultTheme')" style="border:1px solid rgba(72, 85, 102, 0.4)">
                        <h-icon name="u-a-skin-default" color="#485566" :class="{'active-theme':this.theme=='default'}"></h-icon>
                      </span>
                      <span class="disable-span" :title="$t('m.i.topBar.redTheme')" style="border:1px solid rgba(195, 46, 51, 0.4)">
                        <h-icon name="u-a-skin-default" color="#C32E33" :class="{'active-theme':this.theme=='red'}"></h-icon>
                      </span> -->
                    <span @click="handleChangeTheme('black')" :title="$t('m.i.topBar.blackTheme')" style="border:1px solid rgba(0,0,0,0.4)">
                      <h-icon name="u-a-skin-default" color="#000000" :class="{'active-theme':this.theme=='black'}"></h-icon>
                    </span>
                    <!-- <span class="disable-span" :title="$t('m.i.topBar.violetTheme')" style="border:1px solid rgba(126, 82, 180, 0.4)">
                        <h-icon name="u-a-skin-default" color="#7E52B4" :class="{'active-theme':this.theme=='violet'}"></h-icon>
                      </span>
                      <span class="disable-span" :title="$t('m.i.topBar.yellowTheme')" style="border:1px solid rgba(255, 117, 41, 0.4)">
                        <h-icon name="u-a-skin-default" color="#FF7529" :class="{'active-theme':this.theme=='yellow'}"></h-icon>
                      </span> -->
                  </div>
                </h-col>
              </h-row>
            </div>
          </h-menu-item>
          <!--修改个人信息-->
          <h-menu-item name='7-1' class="h-top-perOpt" @click.native="handleChangePersonInfo">
            <h-icon name="u-a-user"></h-icon>
            <span>{{$t('m.i.topBar.perCenter')}}</span>
          </h-menu-item>
          <!--修改密码-->
          <h-menu-item name='7-2' class="h-top-perOpt" v-if="!isHidePwdAndLockScreen && !freeLogin" @click.native="handleResetPass">
            <h-icon name="u-a-key"></h-icon>
            <span>{{$t('m.i.common.modifyPwd')}}</span>
          </h-menu-item>
          <!--切换租户-->
          <h-menu-item name='7-3' class="h-top-perOpt" v-if="isShowTenant" @click.native="changeTenant">
            <h-icon name="t-b-setting"></h-icon>
            <span>{{$t('m.i.topBar.changeTenant')}}</span>
          </h-menu-item>
          <!--切换空间-->
          <h-menu-item name='7-3' class="h-top-perOpt" v-if="isShowSpace" @click.native="changeSpace">
            <h-icon name="backspace-outline"></h-icon>
            <span>{{$t('m.i.topBar.changeSpace')}}</span>
          </h-menu-item>
          <!--退出登录-->
          <h-menu-item v-if="!freeLogin" name='7-4' class="h-top-perOpt" @click.native="logout">
            <h-icon name="u-a-export"></h-icon>
            <span>{{$t('m.i.topBar.signOut')}}</span>
          </h-menu-item>
        </h-submenu>
      </h-menu>
    </div>
    <!-- 修改密码 -->
    <h-msg-box v-if="!freeLogin" v-model="setPassword" :title="$t('m.i.common.pwdModify')" height="200" :closable="closable" :mask-closable="false" @on-close="handleCancle" style="text-align:left" class="h-topbar-msgbox">
      <span v-if="!closable" style="font-size: 14px;color: red;">{{msgInfo}}</span>
      <h-form ref="setPassForm" :model="setPassForm" cols="1" :label-width="116">
        <h-form-item prop="oldPassword" :label="$t('m.i.common.curPwd')" :labelTitle="$t('m.i.common.curPwd')" required>
          <h-input type="password" v-model="setPassForm.oldPassword" :placeholder="$t('m.i.common.enterCurPwd')"></h-input>
        </h-form-item>
        <h-form-item prop="newPassword" :label="$t('m.i.common.newPwd')" :labelTitle="$t('m.i.common.newPwd')" required>
          <h-input type="password" v-model="setPassForm.newPassword" :placeholder="$t('m.i.common.enterNewPwd')" @on-change="onkeypress"></h-input>
        </h-form-item>
        <h-form-item prop="newPasswordCheck" :label="$t('m.i.common.newPwdConf')" :labelTitle="$t('m.i.common.newPwdConf')" required :rules="validNewPassCheck">
          <h-input type="password" v-model="setPassForm.newPasswordCheck" :placeholder="$t('m.i.common.enterNewPwdAgain')" strengthTip :tipState="tipState" @keyup.enter.native="handleSetPassword"></h-input>
        </h-form-item>
      </h-form>
      <div slot="footer" style="margin-top:20px">
        <h-button v-if="closable" @click="handleCancle">{{$t('m.i.common.cancle')}}</h-button>
        <h-button type="primary" @click="handleSetPassword">{{$t('m.i.common.confirm')}}</h-button>
      </div>
    </h-msg-box>
    <h-msg-box v-model="comfirmBox" :title="$t('m.i.common.hint')" @on-ok="ok" @on-cancel="cancel" class="h-topbar-msgbox">
      <p>{{comfirmMsg}}</p>
    </h-msg-box>
    <!-- 修改个人资料 -->
    <h-msg-box v-model="changePerspnInfo" :title="$t('m.i.topBar.modifyUserInfo')" :mask-closable="false" width="800" class="h-topbar-msgbox">
      <h-form :model="setUser" :label-width="116" ref="setUserModi" cols="2">
        <h-form-item :label="$t('m.i.topBar.userName')" :labelTitle="$t('m.i.topBar.userName')" prop="userName" required>
          <h-input v-model="setUser.userName" :maxlength="16"></h-input>
        </h-form-item>
        <!-- 可以选择所属组织 -->
        <h-form-item :label="$t('m.i.topBar.relOrg')" :labelTitle="$t('m.i.topBar.relOrg')" prop="orgId" required>
          <h-input v-model="setUser.orgName" readonly></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.mobile')" :labelTitle="$t('m.i.topBar.mobile')" prop="mobile" :validRules="['mobile']">
          <h-input v-model="setUser.mobile"></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.phone')" :labelTitle="$t('m.i.topBar.phone')" prop="phone" :validRules="['tel']">
          <h-input v-model="setUser.phone"></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.fax')" :labelTitle="$t('m.i.topBar.fax')" prop="fax" :validRules="userfaxRule">
          <h-input v-model="setUser.fax" :maxlength="200"></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.email')" :labelTitle="$t('m.i.topBar.email')" prop="email" :validRules="['email']">
          <h-input v-model="setUser.email"></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.certiType')" :labelTitle="$t('m.i.topBar.certiType')" prop="cIdentitytype">
          <h-select v-model="setUser.cIdentitytype">
            <h-option v-for="item in BIZ_CIDENTTYPE" :value="item.code" :key="item.code">{{item.text}}</h-option>
          </h-select>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.certiNum')" :labelTitle="$t('m.i.topBar.certiNum')" prop="cIdentityno" :validRules="userCIdentitynoRule">
          <h-input v-model="setUser.cIdentityno" :maxlength="40"></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.qualiCerti')" :labelTitle="$t('m.i.topBar.qualiCerti')" prop="cCredentials">
          <h-input v-model="setUser.cCredentials" :maxlength="40"></h-input>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.workStatus')" :labelTitle="$t('m.i.topBar.workStatus')" prop="workStatus">
          <h-select v-model="setUser.workStatus">
            <h-option v-for="item in SYS_USER_WORK_STATE" :value="item.code" :key="item.code">{{item.code}}:{{item.text}}</h-option>
          </h-select>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.filterMsgType')" :labelTitle="$t('m.i.topBar.filterMsgType')" prop="msgType">
          <h-checkbox-group v-model="setUser.msgType">
            <h-checkbox v-for="(item,index) in BIZ_MSG_TYPE" :value="item.code" :label="item.code" :key="index" style="margin-right:5px;margin-top:5px;" :disabled="item.code === '1'">{{item.text}}</h-checkbox>
          </h-checkbox-group>
        </h-form-item>
        <h-form-item :label="$t('m.i.topBar.comments')" :labelTitle="$t('m.i.topBar.comments')" cols="2" prop="remark" style="height:72px;">
          <h-input v-model="setUser.remark" :maxlength="127" :canResize="false" type="textarea" style="height:72px;" class="h-topbar-userInfo-textarea"></h-input>
        </h-form-item>
      </h-form>
      <div slot="footer">
        <h-button type="ghost" style="margin:0 8px" @click="userFormReset()">{{$t('m.i.common.reset')}}</h-button>
        <h-button type="primary" :disabled="submitDisabled" @click="setuserSubmit()">{{$t('m.i.common.commit')}}</h-button>
      </div>
    </h-msg-box>
    <!--切换租户-->
    <h-msg-box v-model="setTenantModel" :title="$t('m.i.topBar.changeTenant')" :mask-closable="false" width="400" height="200" @on-ok="submitTenant" class="h-topbar-msgbox">
      <h-form :mode="tenantData" :label-width="116" ref="setTenant" cols="1">
        <h-form-item :label="$t('m.i.common.chooseTenant')" :labelTitle="$t('m.i.common.chooseTenant')" prop="tenantId">
          <h-select v-model="tenantData.tenantId" label-in-value @on-change="selectTenant">
            <h-option v-for="item in tenantDataList" :value="item.code" :key="item.code">{{item.code}}:{{item.text}}</h-option>
          </h-select>
        </h-form-item>
      </h-form>
    </h-msg-box>
    <!-- 切换空间 -->
    <h-msg-box v-model="setSpaceModel" :title="$t('m.i.topBar.changeSpace')" :mask-closable="false" class="h-topbar-msgbox h-topbar-space">
      <h-tree :data="spaceData" :show-checkbox="false" @on-select-change="selectSpace" :style="{height: '250px',overflow: 'auto'}" ref="orgTreeModi">
      </h-tree>
      <div slot="footer">
        <h-button type="ghost" size="large" @click="setSpaceModel = !setSpaceModel">取消</h-button>
        <h-button type="primary" size="large" @click="submitSpace">确定</h-button>
      </div>
    </h-msg-box>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { changePwd, checkDefPwd, checkPwdExpired, expiredDays, getCurrUserInfo, getPwdCheckStandard, getSystemParm } from '@frame/api/login'
import { allToggleClass } from '@common/utils/tools'
import { covertObj, on, off } from '@common/utils/commonUtil'
import { switchTheme } from "@common/utils"
import draggable from 'vuedraggable'
import HSearchselect from '@frame/components/searchselect/HSearchSelect.vue'
import LockScreen from '@frame/components/LockScreen'
import Cookies from 'js-cookie'
import { saveUserBehaviorLog } from '@frame/api/login/index'
export default {
  data() {
    let currUserId = window.sessionStorage.getItem('currUserId')// 操作员ID
    let nickName = window.sessionStorage.getItem('nickName')// 操作员昵称
    let currTenantId = window.sessionStorage.getItem('tenantId')// 租户ID
    let currTenantName = window.sessionStorage.getItem('tenantName')// 租户名称
    let curSpaceId = window.sessionStorage.getItem('envId')// 空间ID
    let curSpaceName = window.sessionStorage.getItem('envName')// 空间名称
    // let paramOrg = window.sessionStorage.getItem("orgList")
    let lastLoginDateTime = window.sessionStorage.getItem('lastLoginDateTime') || '--'// 最近登录时间
    let orgName = window.sessionStorage.getItem('orgName')
    // if (paramOrg) {
    //  orgName = JSON.parse(paramOrg).org_name;
    // }
    let version = window.LOCAL_CONFIG.VERSION + ''// 版本信息

    // 新密码框校验
    // 确认密码框校验
    const validatePassCheck = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('m.i.common.enterNewPwdAgain')))
      } else if (value !== this.setPassForm.newPassword) {
        callback(new Error(this.$t('m.i.common.pwdNoEquals')))
      } else if (value.length < this.minLength) {
        callback(this.$t('m.i.common.pwdEnterMsg_1') + this.minLength + this.$t('m.i.common.pwdEnterMsg_2'))
      } else if (this.bitCount(this.validatePwd(value)) < this.kindLength) {
        callback(this.$t('m.i.common.pwdEnterMsg_3') + this.kindLength + this.$t('m.i.common.pwdEnterMsg_5'))
      } else {
        callback()
      }
    }
    return {
      // 系统名
      sysName: window.LOCAL_CONFIG.SYS_NAME,
      currUserId: currUserId,
      nickName: nickName,
      currTenantId: currTenantId,
      currTenantName: currTenantName,
      orgName: orgName,
      lastLoginDateTime: lastLoginDateTime,
      version: version,
      closable: true,
      comfirmBox: false,
      comfirmMsg: '',
      msgInfo: this.$t('m.i.common.defaultPwdMsg'),
      setPassForm: {
        oldPassword: '',
        newPassword: '',
        newPasswordCheck: ''
      },
      validNewPassCheck: {
        validator: validatePassCheck, trigger: 'blur'
      },
      minLength: 8,
      kindLength: 3,
      setPassword: false,
      setTenantModel: false,
      submitLoading: true,
      // locktime: 100,
      // theme: 'black',
      locktime: 100,//锁屏时间,默认100分钟
      theme: Cookies.get('theme') ? Cookies.get('theme') : this.LOCAL_CONFIG.THEME,
      tipState: null,
      isMergeMenu: false,
      isOpenFirstPwd: false,
      isHidePwdAndLockScreen: false,
      freeLogin: false,
      isShowTenant: false,
      isShowLocalLang: false,
      isShowTheme: true,
      subSystem: [],
      changePerspnInfo: false,
      childRoute: [],
      search: '',
      // menusType: window.sessionStorage.getItem('menusType'),
      curMenu: '',
      showOptions: false,
      showSearchPanel: false,
      setUser: {
        userId: currUserId,
        userName: nickName,
        orgId: '',
        orgName: '',
        mobile: '',
        phone: '',
        fax: '',
        email: '',
        cIdentitytype: '',
        cIdentityno: '',
        cCredentials: '',
        remark: '',
        workStatus: '1',
        msgType: []
      },
      tenantData: {
        tenantId: '',
        tenantName: ''
      },
      tenantDataList: [],
      // BIZ_SYSTEM_LANGUAGE:[],
      BIZ_CIDENTTYPE: [],
      SYS_USER_WORK_STATE: [],
      BIZ_MSG_TYPE: [],
      submitFlag: false,
      submitDisabled: false,
      userfaxRule: [{ test: /^(\d{3,4}-)?\d{7,8}$/, trigger: 'blur', message: this.$t('m.i.common.faxMsg_1') }],
      userCIdentitynoRule: [{ test: /^[0-9a-zA-Z]*$/, trigger: 'blur', message: this.$t('m.i.common.cerNumMsg_1') }],
      // 数据格式同左侧导航栏菜单格式
      options: [],
      showSystem: false, // 是否显示全部子系统
      dragItemIndex: -1, // 菜单拖动项index
      isShowMsg: false,
      drag: false,
      isDragEnded: false,
      dragData: {},
      showMenuSearch: true,
      localLangs: [],
      isShowSpace: false,
      curSpaceId: curSpaceId,
      curSpaceName: curSpaceName,
      setSpaceModel: false,
      spaceData: [],
      spaceNode: [],
      showSysLen: 0
    }
  },
  components: {
    draggable, // 菜单拖动
    HSearchselect,
    LockScreen
  },
  computed: {
    ...mapGetters([
      'permission_routers',
      'activeIndex',
      'visitedViews',
      'searchRoute',
      'hasOpened',
      'leafTotal',
      'clickItemIndex',
      'systemHeight'
    ]),
    menusRoot: {
      get() {
        return this.$store.state.app.menusRoot
      },
      set(value) {
        this.$store.state.app.menusRoot = value
      }
    },
    logoStyle() {
      const { logo } = window.LOCAL_CONFIG;
      if (logo) {
        return {
          background: `url(./static/logo/${logo}-t.png) center center no-repeat`
        };
      } else {
        return null;
      }
    }
  },
  watch: {
    theme() {
      switchTheme(this.theme);
    },
    setPassword(val) {
      if (!val) {
        this.$refs.setPassForm.resetFields()
      }
    },
    isDragEnded(val) {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ""
      if (val) {
        let obj = this.dragData
        //超出区域不提交数据
        if (!obj.hasOwnProperty('placeMenuCode') && !obj.hasOwnProperty('placeKindCode')) {
          this.isDragEnded = false
          return
        }
        let dropurl = '/dragAndDropMenu' + '?time=' + new Date().getTime()
        if (isUrlLowercase === 'true') {
          dropurl = dropurl.toLowerCase()
        }
        this.$http.post(window.LOCAL_CONFIG.OMC_GSV + dropurl, obj).then(res => {
          if (res && res.data.return_code === '0') {
            this.$hMessage.success(this.$t('m.i.topBar.modiSysInfo_1'))
          } else {
            this.$hMessage.error(this.$t('m.i.topBar.modiSysInfo_2'))
          }
          // this.activeSidebar(obj.draggedIndex)
          //初始化拖拽数据
          this.dragData = {}
          this.isDragEnded = false
        })
      }
    }
  },
  methods: {
    changeLocale(locale) {
      this.$i18n.locale = locale
      localStorage.setItem('lang', locale)
      Cookies.set('lang', locale)
      let langUrl = '/languageChange' + '?time=' + new Date().getTime()
      if (window.LOCAL_CONFIG.isUrlLowercase + "" === 'true') {
        langUrl = langUrl.toLowerCase()
      }
      this.$http.post(window.LOCAL_CONFIG.OMC_GSV + langUrl, { lang: locale }).then(res => {
        if (res && res.data) {
          return
        }
      }).catch(error => {
        console.log(error)
      })
    },
    changeTenant() {
      // 获取租户信息
      this.handleTenant()
      this.setTenantModel = true
      let t_id = window.sessionStorage.getItem('tenantId')
      this.tenantData.tenantId = t_id
    },
    selectTenant(param) {
      this.tenantData.tenantId = param.value
      let tempTenantName = param.label
      this.tenantData.tenantName = tempTenantName && tempTenantName.split(":")[1] ? tempTenantName.split(":")[1] : param.label

    },
    submitTenant() {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ""
      let that = this
      let userName = window.sessionStorage.getItem('nickName')
      let kindCode = window.sessionStorage.getItem('kindCode')
      let tenantObj = {
        operatorCode: Cookies.get('operator_code'),
        userName: userName,
        userToken: Cookies.get('token'),
        kindCode: kindCode,
        tenantCode: that.tenantData.tenantId,
        userId: Cookies.get('operator_code')
      }
      let tenanturl = '/userTenantChange' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        tenanturl = tenanturl.toLowerCase()
      }
      that.$http.post(window.LOCAL_CONFIG.OMC_GSV + tenanturl, tenantObj).then(res => {
        if (res && res.data) {
          let data = res.data instanceof Array ? res.data : [res.data]
          let code = data[0].return_code
          if (code == '0') {
            that.currTenantId = that.tenantData.tenantId
            that.currTenantName = that.tenantData.tenantName
            window.sessionStorage.setItem('tenantId', that.tenantData.tenantId)
            window.sessionStorage.setItem('tenantName', that.tenantData.tenantName)
            Cookies.set('tenantId', that.tenantData.tenantId)
            Cookies.set('tenantName', that.tenantData.tenantName)
            that.$hMessage.success({ content: that.$t('m.i.topBar.changeTenantMsg_1'), duration: 3, closable: true })
            //切换租户成功后刷新跳转到首页 
            this.$router.replace('/mainIndex')
            let storedMenus = JSON.parse(window.sessionStorage.getItem('menus') || 'null')
            if (Array.isArray(storedMenus) && storedMenus.length === 0) {
              window.sessionStorage.removeItem('menus')
            }
            this.$nextTick(() => {
              setTimeout(() => {
                location.reload()
              }, 500)
            })
          } else {
            this.$hMessage.error({ content: data[0].return_info, duration: 3, closable: true });
          }
        }
      }).catch(error => {
        console.error(error)
        that.$hMessage.error(this.$t('m.i.common.netError'))
      })
    },
    setNodeSelected(arr, id) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
          this.$set(arr[i], 'selected', true)
          return
        } else {
          if (arr[i] && arr[i].children && arr[i].children.length > 0) {
            this.setNodeSelected(arr[i].children, id)
          }
        }
      }
    },
    // 获取空间信息
    handleSpace() {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let spaceUrl = '/getSpaceTreeByUserId' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        spaceUrl = spaceUrl.toLowerCase()
      }
      let that = this
      let obj = {
        userId: Cookies.get('operator_code')
      }
      that.spaceData = []
      that.$http.post(window.LOCAL_CONFIG.OMC_GSV + spaceUrl, obj).then(response => {
        if (response && response.data) {
          let resData = (response.data instanceof Array) ? response.data : [response.data]
          if (resData && resData.length > 0) {
            // let id = window.sessionStorage.getItem('spaceId')
            // that.setNodeSelected(resData,id)
            that.spaceData = resData
          }
        }
      })
    },
    changeSpace() {
      this.handleSpace()
      this.setSpaceModel = true
    },
    selectSpace(param) {
      this.spaceNode = param
    },
    //切换空间
    submitSpace() {
      if (this.spaceNode && this.spaceNode.length == 0) {
        let name = window.sessionStorage.getItem('envName')
        this.$hMessage.info({ content: this.$t('m.i.topBar.curSpace') + '【' + name + '】，' + this.$t('m.i.topBar.changeSpaceMsg_1'), duration: 3, closable: true });
        return false
      }
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let spaceUrl = '/reLogin' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        spaceUrl = spaceUrl.toLowerCase()
      }
      let that = this
      let obj = {
        userId: Cookies.get('operator_code'),
        envId: this.spaceNode[0].id,
        newEnvId: this.spaceNode[0].id,
        isChangeLogin: 'true'
      }
      that.$http.post(window.LOCAL_CONFIG.OMC_GSV + spaceUrl, obj).then(res => {
        if (res && res.data) {
          let data = res.data instanceof Array ? res.data : [res.data]
          let code = data[0].return_code ? data[0].return_code : data[0].returnCode
          if (code == '0') {
            that.setSpaceModel = false
            window.sessionStorage.setItem('envId', that.spaceNode[0].id)
            window.sessionStorage.setItem('envName', that.spaceNode[0].title)
            that.$hMessage.success({ content: that.$t('m.i.topBar.changeSpaceMsg'), duration: 3, closable: true })
            //切换空间成功后刷新跳转到首页 
            that.$router.replace('/mainIndex')
            let storedMenus = JSON.parse(window.sessionStorage.getItem('menus') || 'null')
            if (Array.isArray(storedMenus) && storedMenus.length === 0) {
              window.sessionStorage.removeItem('menus')
            }
            that.$nextTick(() => {
              setTimeout(() => {
                location.reload()
              }, 500)
            })
          } else {
            that.$hMessage.error({ content: data[0].return_info, duration: 3, closable: true });
          }
        }
      }).catch(error => {
        that.$hMessage.error(that.$t('m.i.common.netError'))
      })
    },
    onEnd(str) {
      let placeNodeInx = this.menusRoot.findIndex(item => item.kind_code === this.dragData.placeKindCode)
      if (this.dragData.draggedIndex > placeNodeInx) {
        this.dragData.action = '1'
      }
      this.isDragEnded = true
    },
    // 子系统排序
    onMove({ relatedContext, draggedContext }) {
      this.dragData = {
        draggedIndex: draggedContext.futureIndex,
        menuCode: draggedContext.element.id,
        kindCode: draggedContext.element.kind_code,
        placeMenuCode: relatedContext.element.id,
        placeKindCode: relatedContext.element.kind_code,
        action: '0'
      }
    },
    onSelectMenu(option) {
      this.search = ''
      // this.$refs.select.setQuery('')
      this.$nextTick(() => {
        setTimeout(() => {
          this.$router.push(option.url)
        }, 300)
      })
    },
    // 显示子系统排序框
    showSystemList() {
      this.showSystem = true
    },
    hideSystemList() {
      this.showSystem = false
    },
    // 鼠标经过菜单显示隐藏可拖动按钮
    showDragColl(index) {
      this.dragItemIndex = index
    },
    hideDragColl() {
      this.dragItemIndex = -1
    },
    // handlerSelect () {
    //   this.showOptions = true
    // },
    // handleSearch (path) {
    //   this.search = ''
    //   this.$refs.select.setQuery('')
    //   this.$nextTick(() => {
    //     setTimeout(() => {
    //       this.$router.push(path)
    //     }, 300)
    //   })
    // },
    // 修改个人信息
    handleChangePersonInfo() {
      this.$refs.setUserModi.resetFields()
      //获取数据字典
      this.handleDicts()
      let that = this
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let url = '/getCurrUser' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        url = url.toLowerCase()
      }
      this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(res => {
        if (res && res.data) {
          let userInfo = (res.data instanceof Array) ? res.data[0] : res.data
          if (userInfo) {
            covertObj(userInfo, that.setUser)
            let tempFilterMsgType = that.setUser.filterMsgType.split(',')
            let tempArr = []
            for (let tempMsgType of tempFilterMsgType) {
              if (tempMsgType !== '') {
                tempArr.push(tempMsgType)
              }
            }
            that.setUser.msgType = tempArr
            that.setUser.enBusiLineArr = (that.setUser.enBusiLine.indexOf(',') !== -1) ? that.setUser.enBusiLine.split(',') : [that.setUser.enBusiLine]
            that.setUser.enFieldKindArr = (that.setUser.enFieldKind.trim().length > 0) ? that.setUser.enFieldKind.split(',') : []
            that.changePerspnInfo = true
          }
        }
      })
    },
    setuserSubmit() {
      if (this.submitFlag) {
        this.$hMessage.info(this.$t('m.i.common.repeatSubmit'))
      } else {
        this.$refs['setUserModi'].validate(valid => {
          if (valid) {
            this.submitFlag = true
            this.submitDisabled = true
            let tempFilterMsgType = ''
            for (let tempMsgType of this.setUser.msgType) {
              tempFilterMsgType += tempMsgType
              tempFilterMsgType += ','
            }
            this.setUser.filterMsgType = tempFilterMsgType
            let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
            let url = '/updateUserInfo' + '?time=' + new Date().getTime()
            if (isUrlLowercase === 'true') {
              url = url.toLowerCase()
            }
            delete this.setUser.orgUserIds
            delete this.setUser.orgUserPaths
            delete this.setUser.userFilters
            delete this.setUser.tenantIdArr
            this.$http.post(window.LOCAL_CONFIG.OMC_GSV + url, this.setUser).then(res => {
              this.submitFlag = false
              this.submitDisabled = false
              if (res) {
                let code = res.data.return_code
                let info = this.$t('m.i.common.actionFailed')
                if (code === '0') {
                  this.$hMessage.success(this.$t('m.i.common.modifySuccess'))
                  window.sessionStorage.setItem('nickName', this.setUser.userName)// 操作员昵称
                  this.nickName = window.sessionStorage.getItem('nickName')
                  this.changePerspnInfo = false
                } else {
                  info = res.data.return_info
                  this.$hMessage.error(info)
                }
              } else {
                this.$hMessage.error(this.$t('m.i.common.unAuthOrUnNetwork'))
              }
            })
          }
        })
      }
    },
    userFormReset() {
      this.$refs.setUserModi.resetFields()
      this.handleChangePersonInfo()
    },
    // 换肤
    handleChangeTheme(color) {
      this.theme = color
      Cookies.set('theme', color)
    },
    handleResetPass() {
      this.handleResetForm('setPassForm')
      this.setPassword = true
      this.tipState = ''
    },
    handleResetForm(name) {
      this.$refs[name].resetFields()
    },
    handleCancle() {
      this.setPassword = false
      this.msgInfo = this.$t('m.i.common.defaultPwdMsg')
    },
    handleSetPassword() {
      this.$refs['setPassForm'].validate((valid) => {
        if (valid) {
          changePwd(this.setPassForm.oldPassword, this.setPassForm.newPassword).then(res => {
            if (res.data && res.data.return_code === '0') {
              this.setPassword = false
              this.closable = true
              this.$hMessage.success(this.$t('m.i.common.successModifyPwd'))
              window.sessionStorage.setItem('isMeetPwdStrength', true)
            } else {
              // this.$hMessage.success(this.$t('m.i.common.failResetPwd'));
              this.$hMessage.info(res.data.return_info)
              // this.msgInfo = res.data.return_info
            }
          }).catch(() => {
            this.$hMessage.error(this.$t('m.i.common.netError'))
          })
        } else {
          this.$hMessage.error(this.$t('m.i.common.enterRightPwd'))
        }
      })
    },
    logout() {
      //记录用户行为分析--登出
      let recordUserBehavior = window.LOCAL_CONFIG.isRecordUserBehavior
      if (recordUserBehavior) {
        let obj = {
          actionId: 'logout',
          consumerId: Cookies.get('operator_code')
        }
        saveUserBehaviorLog(obj).then(res => {
          if (res && res.data) {
            return true
          }
        })
      }
      // 判断是否为IAR单点登录，如果是调用casLogout
      let isIARCasLogin = window.LOCAL_CONFIG.isIARCasLogin + ''
      let isCasAdapter = window.LOCAL_CONFIG.isCasAdapter + ''
      if (isIARCasLogin === 'true') {
        this.$store.dispatch('casLogout').then(() => {
          if (isCasAdapter != 'true') {
            //非适配器时需要刷新页面重新加载，适配器时通过cas登出后的重定向回跳到首页
            location.reload()
          }
        })
      } else {
        this.$store.dispatch('Logout').then(() => {
          location.reload()
        }).catch(err => {
          console.error(err);
        })
      }
    },
    activeSidebar(index, id) {
      if (index >= 0) {
        this.menusRoot[index].children.forEach(item => {
          this.$set(item, 'isActived', false)
        })
        this.$store.dispatch('ActiveRootIndex', index)
      }
      this.handleLeafData(index)
      this.$store.dispatch('changeItemIndex', -1)
      // let item = this.menusRoot[this.activeIndex]
      // // 防止页面刷新时会跳转根页面
      // if(this.$route.matched[0].path !== item.url) {
      //   this.$router.push({path: item.url})
      // }
    },
    onkeypress() {
      this.validatePwd(this.setPassForm.newPassword)
    },
    // 验证密码强度
    validatePwd(s) {
      let len = s.length
      let flag = 0
      if (len == 0) {
        this.tipState = null
        return
      }
      for (let i = 0; i < len; i++) {
        let c = s.charAt(i)
        if (c >= 'a' & c <= 'z') { // 包含a-z
          flag |= 0b0001
        } else if (c >= 'A' & c <= 'Z') { // 包含A-Z
          flag |= 0b0010
        } else if (c >= '0' & c <= '9') { // 包含0-9
          flag |= 0b0100
        } else if ((c >= '!' & c <= '/') || (c >= ':' & c <= '@') || (c >= '[' & c <= '`') ||
          (c >= '{' & c <= '~')) { // 包含特殊字符
          flag |= 0b1000
        } else {
          return false
        }
      }
      this.tipState = this.bitCount(flag) === 1 ? 'weak' : (this.bitCount(flag) === 2 ? 'general' : 'complex')
      return flag
    },
    bitCount(i) {
      let count = 0
      while (i) {
        ++count
        i &= (i - 1)
      }
      return count
    },
    ok() {
      this.msgInfo = ''
      this.closable = false
      this.setPassword = true
    },
    cancel() {

    },
    compileFlatState(data, leafData, id) {
      function flattenChildren(node, leafData) {
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => flattenChildren(child, leafData))
        } else {
          node.search_id = id
          leafData.push(node)
        }
      }
      flattenChildren(data, leafData)
      return leafData
    },
    handleLeafData(index) {
      let child = []
      let leafData = []
      let isMergeMenu = window.LOCAL_CONFIG.isMergeMenu + ''
      // isMergeMenu为true时合并菜单
      child = isMergeMenu === 'true' ? this.menusRoot : this.menusRoot[index] == null ? null : this.menusRoot[index].children
      if (child && child.length > 0) {
        child.forEach((item, index) => {
          if (item && item.children && item.children.length > 0) {
            this.compileFlatState(item, leafData, item.id)
          }
        })
      }
      this.$store.dispatch('initLeafTotal', leafData)
      this.options = leafData
      // let temp = window.LOCAL_CONFIG.temp['bizMenu']
      // this.$store.dispatch('initLeafTotal', temp)
      // this.options = temp
    },
    handleResize() {
      this.$nextTick(() => {
        if (this.$refs.systemItem) {
          this.$store.dispatch('changeSystemHeight', this.$refs.systemItem.offsetHeight)
          let showSysWidth = document.getElementsByClassName('h-system-list')[0].offsetWidth
          let subSys = document.getElementsByClassName('h-topbar-subMenu')
          let width = 0
          for (let i = 0; i < subSys.length; i++) {
            width += subSys[i].offsetWidth
            if (width < showSysWidth) {
              this.showSysLen = i + 1
            }
          }
        }
      })
    },
    //获取多租户
    handleTenant() {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
      let tennatUrl = '/getUserTenantInfo' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        tennatUrl = tennatUrl.toLowerCase()
      }
      let that = this
      this.$http.get(window.LOCAL_CONFIG.OMC_GSV + tennatUrl).then(response => {
        if (response && response.data) {
          let resData = (response.data instanceof Array) ? response.data : [response.data]
          //多租户系统级管理员不需要显示切换租户
          if (resData && resData.length > 0) {
            if (resData[0].user_id == "admin" || resData[0].user_id == null) {
              that.isShowTenant = false
              return
            }
            if (resData[0].tenant_id == "" || resData[0].tenant_id == null) {
              that.isShowTenant = false
              return
            }
            that.tenantDataList = []
            resData.forEach(item => {
              let obj = {
                text: item.tenant_name,
                code: item.tenant_id
              }
              that.tenantDataList.push(obj)
            })
          }
        }
      })
      that.isShowTenant = true
    },
    //获取数据字典
    handleDicts() {
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let isUnderscore = window.LOCAL_CONFIG.isUnderscore + ''
      let lang = window.localStorage.getItem('lang')
      if (isUnderscore === 'true') { // 兼容微服务方式
        let url = '/getDict'
        let cidentTypeUrl = ''
        let userWorkStatusUrl = ''
        let msgTypeUrl = ''
        if (isUrlLowercase === 'true') {
          url = url.toLowerCase()
        }
        cidentTypeUrl = url + '?dict_name=BIZ_CIDENTTYPE' + "&lang=" + lang + '&time=' + new Date().getTime()
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + cidentTypeUrl).then(res => {
          let data = (res.data instanceof Array) ? res.data : [res.data]
          this.BIZ_CIDENTTYPE = data
        })
        userWorkStatusUrl = url + '?dict_name=SYS_USER_WORK_STATE' + "&lang=" + lang + '&time=' + new Date().getTime()
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + userWorkStatusUrl).then(res => {
          let data = (res.data instanceof Array) ? res.data : [res.data]
          this.SYS_USER_WORK_STATE = data
        })
        msgTypeUrl = url + '?dict_name=BIZ_MSG_TYPE' + "&lang=" + lang + '&time=' + new Date().getTime()
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + msgTypeUrl).then(res => {
          let data = (res.data instanceof Array) ? res.data : [res.data]
          this.BIZ_MSG_TYPE = data
        })
      } else {
        let url = '/getDicts'
        if (isUrlLowercase === 'true') {
          url = url.toLowerCase()
        }
        url += '?dict_names=BIZ_CIDENTTYPE,SYS_USER_WORK_STATE,BIZ_MSG_TYPE' + "&lang=" + lang + '&time=' + new Date().getTime()
        this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url).then(res => {
          if (res && res.data) {
            let data = res.data
            this.BIZ_CIDENTTYPE = data.BIZ_CIDENTTYPE
            this.SYS_USER_WORK_STATE = data.SYS_USER_WORK_STATE
            this.BIZ_MSG_TYPE = data.BIZ_MSG_TYPE
          }
        })
      }
    },
    //查询系统参数，获取锁屏时间
    handleSysParams() {
      getSystemParm('lockScreenInterval').then(res => {
        if (res && res.data) {
          let data = (res.data instanceof Array) ? res.data : [res.data]
          if (data.length > 0 && data[0].param_value) {
            this.locktime = parseInt(data[0].param_value)
          }
        }
      })
    },
    //查询系统参数，获取密码验证强度
    handlePwdCheckStandard() {
      getPwdCheckStandard().then(res => {
        if (res && res.data) {
          if (res.data.minLengthError && res.data.minLengthError === '0') {
            this.minLength = res.data.minLength
          }
          if (res.data.kindLengthError && res.data.kindLengthError === '0') {
            this.kindLength = res.data.kindLength
          }
        }
      })
    },
    //校验密码是否过期
    handleCheckPwdExpired() {
      checkPwdExpired().then(res => {
        if (res) {
          let flag = ''
          if (res.data && res.data.result) {
            flag = res.data.result + ''
          } else {
            flag = res.data + ''
          }
          if (flag === 'true') {
            this.msgInfo = this.$t('m.i.common.expiredPwd')
            this.closable = false
            if (this.isOpenFirstPwd) {
              this.setPassword = true
            } else {
              this.setPassword = false
            }
          } else {
            expiredDays().then(resp => {
              if (resp) {
                if (resp.data && resp.data.result) {
                  let days = resp.data.result
                  if (days !== '') {
                    days = parseInt(days)
                    if (days > 0 && days <= 3) {
                      this.comfirmBox = true
                      this.comfirmMsg = days + this.$t('m.i.common.expiredDays')
                    }
                  }
                }
              }
            })
          }
        }
      })
    },

    //检查当前登录用户密码是否为初始化密码，是则必须修改密码方可进入系统
    handleCheckDefPwd() {
      checkDefPwd().then(res => {
        if (res) {
          let flag = ''
          if (res.data && res.data.result) {
            flag = res.data.result + ''
          } else {
            flag = res.data + ''
          }
          if (flag === 'true') {
            // 第一次登录是否弹出修改密码框
            if (this.isOpenFirstPwd) {
              this.setPassword = true
              this.closable = false
            } else {
              this.setPassword = false
              this.closable = true
            }
          } else {
            let isMeetPwdStrength = window.sessionStorage.getItem('isMeetPwdStrength')
            if (isMeetPwdStrength && isMeetPwdStrength == 'false') {
              this.msgInfo = this.$t('m.i.common.changeValidatePwdMsg')
              this.setPassword = true
              this.closable = false
            }
          }
        }
      })
    }
  },
  created() {
    this.isShowMsg = window.LOCAL_CONFIG.isShowMsg
    this.isShowLocalLang = window.LOCAL_CONFIG.isShowLocalLang
    this.isShowTheme = window.LOCAL_CONFIG.isShowTheme
    this.localLangs = window.LOCAL_CONFIG.localLangs
    this.isShowSpace = window.LOCAL_CONFIG.isOpenSpace
    //根据系统参数配置
    let isMergeMenu = window.LOCAL_CONFIG.isMergeMenu + ''
    let isOpenFirstPwd = window.LOCAL_CONFIG.isOpenFirstPwd + ''
    let isHidePwdAndLockScreen = window.LOCAL_CONFIG.isHidePwdAndLockScreen + ''
    let isTenantMode = window.LOCAL_CONFIG.isTenantMode + ''
    let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
    let freeLogin = window.LOCAL_CONFIG.freeLogin + ''
    let showMenuSearch = window.LOCAL_CONFIG.showMenuSearch + ''
    //菜单叶子节点生成下拉数据
    this.handleLeafData(this.activeIndex)
    // 检查有无用户信息，若无用户信息表示重新进入页面，此时需要重新获取用户信息
    if (window.sessionStorage.getItem('currUserId')
      && window.sessionStorage.getItem('currUserId') != "undefined"
      && window.sessionStorage.getItem('nickName')
      && window.sessionStorage.getItem('nickName') != "undefined"
      && window.sessionStorage.getItem('currUserId') == Cookies.get('operator_code')
      && window.sessionStorage.getItem('kindCode') && window.sessionStorage.getItem('envId')) {
    } else {
      window.LOCAL_CONFIG.isToken && getCurrUserInfo().then(res => {
        if (res && res.data) {
          let userInfo = res.data
          userInfo = userInfo instanceof Array ? userInfo[0] : userInfo
          let userId = userInfo.user_id ? userInfo.user_id : userInfo.userId
          window.sessionStorage.setItem('currUserId', userId)
          window.sessionStorage.setItem('userName', userId)
          let userName = userInfo.user_name ? userInfo.user_name : userInfo.userName
          window.sessionStorage.setItem('nickName', userName)
          let userType = userInfo.user_type ? userInfo.user_type : userInfo.userType
          window.sessionStorage.setItem('userType', userType)
          let orgCode = userInfo.org_code ? userInfo.org_code : userInfo.orgCode
          let orgName = userInfo.org_name ? userInfo.org_name : userInfo.orgName
          let orgObj = { org_code: orgCode, org_name: orgName }
          window.sessionStorage.setItem('orgList', JSON.stringify(orgObj))
          let lastLoginDateTime = userInfo.last_login_time ? userInfo.last_login_time : userInfo.lastLoginTime
          window.sessionStorage.setItem('lastLoginDateTime', lastLoginDateTime)
          // 赋值到当前nickName、currUserId、lastLoginDateTime、orgName
          this.nickName = userName
          this.currUserId = userId
          this.lastLoginDateTime = lastLoginDateTime
          this.orgName = orgName
          // 是否是多租户模式
          if (isTenantMode == 'true' && this.currUserId != 'admin') {
            let tenant_id = userInfo.tenant_id ? userInfo.tenant_id : userInfo.tenantId
            if (tenant_id == null || tenant_id == undefined || tenant_id == "null" || tenant_id == "undefined") {
              tenant_id = ""
            }
            let tenant_name = userInfo.tenant_name ? userInfo.tenant_name : userInfo.tenantName
            if (tenant_name == null || tenant_name == undefined || tenant_name == "null" || tenant_name == "undefined") {
              tenant_name = ""
            }
            let kind_code = userInfo.kind_code ? userInfo.kind_code : userInfo.kindCode
            if (kind_code == null || kind_code == undefined || kind_code == "null" || kind_code == "undefined") {
              kind_code = ""
            }
            window.sessionStorage.setItem('tenantId', tenant_id)
            window.sessionStorage.setItem('tenantName', tenant_name)
            window.sessionStorage.setItem('kindCode', kind_code)
            // 赋值到当前currTenantId、currTenantName
            this.currTenantId = tenant_id
            this.currTenantName = tenant_name
          }
          //是否开启空间
          if (this.isShowSpace) {
            let spaceId = userInfo.env_id ? userInfo.env_id : userInfo.envId
            let spaceName = userInfo.env_name ? userInfo.env_name : userInfo.envName
            window.sessionStorage.setItem('envId', spaceId)
            window.sessionStorage.setItem('envName', spaceName)
            this.curSpaceId = spaceId
            this.curSpaceName = spaceName
          }
        }
      })
    }
    //是否合并菜单
    if (isMergeMenu === 'true') {
      this.isMergeMenu = true
    }
    //是否第一次打开时弹出修改密码弹出框
    if (isOpenFirstPwd === 'true') {
      this.isOpenFirstPwd = true
    }
    //是否隐藏锁屏按钮
    if (isHidePwdAndLockScreen === 'true') {
      this.isHidePwdAndLockScreen = true
    }
    // 免登录模式
    if (freeLogin === 'true') {
      this.freeLogin = true
    }
    // 是否显示顶部菜单检索框
    if (showMenuSearch === 'false') {
      this.showMenuSearch = false
    }
    // 是否是多租户模式(admin和系统不显示切换租户)
    if (isTenantMode === 'true' && Cookies.get('operator_code') != 'admin' && Cookies.get('tenantId') != '') {
      this.isShowTenant = true
    }
    //查询系统参数，获取锁屏时间
    if (freeLogin == 'false' && isHidePwdAndLockScreen == 'false') {
      this.handleSysParams()
    }
    //查询系统参数，获取密码验证登记
    if (freeLogin == 'false' && (isOpenFirstPwd == 'true' || isHidePwdAndLockScreen == 'false')) {
      this.handlePwdCheckStandard()
    }
    //检查当前登录用户密码是否为初始化密码，是则必须修改密码方可进入系统
    if (freeLogin == 'false' && (isOpenFirstPwd == 'true' || isHidePwdAndLockScreen == 'false')) {
      this.handleCheckDefPwd()
    }
    //检查密码是否过期
    if (freeLogin == 'false' && (isOpenFirstPwd == 'true' || isHidePwdAndLockScreen == 'false')) {
      this.handleCheckPwdExpired()
    }
  },
  mounted() {
    this.handleResize()
    on(window, 'resize', this.handleResize)
    // document.getElementsByTagName('html')[0].className = this.theme
    switchTheme(this.theme);
  },
  beforeDestroy() { // 在组件生命周期结束的时候销毁。
    clearInterval(this.timer)
    off(window, 'resize', this.handleResize)
  },
  activated() {
    this.handleResize()
    on(window, 'resize', this.handleResize)
  },
  deactivated() {
    off(window, 'resize', this.handleResize)
  },
  beforeCreate() {
    // 非IE下固定滚动条样式
    if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") < 0) {
      window.sessionStorage.setItem('scrollbarWidth', window.LOCAL_CONFIG.TABLE_SCROLLBAR_WIDTH || 7)
    }
  }
}
</script>
