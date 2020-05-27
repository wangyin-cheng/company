<template>
  <section class="app-main">
    <!-- Vue page -->
     <keep-alive  :include="needKeepAlive">
        <router-view v-if="(isUcf() || isFrame()) ? $route.meta.isKeepAlive : needKeepAlive.includes($route.meta.comName)" ref="" :key="$route.path"></router-view>
     </keep-alive>
     <router-view v-if="!$route.meta.isKeepAlive" :key="key"></router-view>

    <!-- iframe page -->
    <template v-if="LOCAL_CONFIG.KEEP_IFRAME_PAGE_ALIVE">
      <component
        v-for="item in iframeComponentSet"
        v-show="item.url === $route.path"
        :key="item.originalUrl"
        :is="iframeComponent"
        :url="item.originalUrl"
      ></component>
    </template>
  </section>
</template>
<script>
import { mapGetters } from 'vuex'
import { switchTheme, prefetch, isUcf, isFrame } from "@common/utils"
import { saveUserBehaviorLog } from '@frame/api/login/index'
import { getCurrUserInfo } from '@frame/api/login'
import Cookies from 'js-cookie'
import IframeComponent from "../frame"
export default {
  name: 'AppMain',
  data() {
    return {
      iframeComponent: "iframe-component",
      iframeComponentSet: [] // https://programmer.help/blogs/keep-alive-no-refresh-for-iframe-in-vue.html
    };
  },
  components: {
    IframeComponent
  },
  computed: {
    ...mapGetters([
      'needKeepAliveList'
    ]),
    needKeepAlive () {
      return this.needKeepAliveList.join(',')
    },
    key () {
      return this.$route.name !== undefined ? this.$route.name + new Date() : this.$route + new Date()
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler(route) {
        // update iframe component set
        const { menusMap } = this.$store.state.permission;
        if (menusMap.has(this.$route.path)) {
          const { menu_type, url, originalUrl } = menusMap.get(this.$route.path);
          if (menu_type === "iframe" && this.iframeComponentSet.every(item => item.url !== url && item.originalUrl !== originalUrl)) {
            this.iframeComponentSet.push({ url, originalUrl });
          }
        }

        if (route.meta && (route.meta.subSysName === 'BIZFRAME' || route.meta.id === 'mainIndex')) {
          document.body.classList.add('bizframe')
        } else {
          document.body.classList.remove('bizframe')
        }
        //记录用户行为分析--菜单
        let recordUserBehavior = window.LOCAL_CONFIG.isRecordUserBehavior
        if(recordUserBehavior){
          let tempActionId = ''
          let many = this.findall(this.$routerHistory._history,route.meta.id)
          tempActionId = many > 1 ? 'altermenu' : 'openmenu'
          let obj = {
            actionId:tempActionId,
            menuName:route.meta.id,
            consumerId: route.meta.operatorCode ? route.meta.operatorCode : window.sessionStorage.getItem('currUserId')
          }
          if(obj.consumerId == null){
            getCurrUserInfo().then(res => {
              if (res && res.data) {
                let data = res.data instanceof Array ? res.data[0] : res.data
                obj.consumerId = data.user_id ? data.user_id : data.userId
                saveUserBehaviorLog(obj).then(res =>{
                  if (res && res.data) {
                    return true
                  }
                })
              }
            })
          }else{
            saveUserBehaviorLog(obj).then(res =>{
              if (res && res.data) {
                return true
              } 
            })
          }
        }
      }
    }
  },
  methods: {
    isUcf, isFrame,
    findall(arr,x){
      let pos=0
      arr.forEach(element => {
        if(element == x) {
          pos++;
        }
      });
      return pos
    }
  },
  mounted () {
    if (isUcf() || isFrame()) {
      switchTheme(Cookies.get("theme") ? Cookies.get("theme") : window.LOCAL_CONFIG.THEME);
    }

    // prefetch
    setTimeout(() => {
      const { PREFETCH_SUBAPP_LIST } = LOCAL_CONFIG;
      if (PREFETCH_SUBAPP_LIST) {
        for (const app of PREFETCH_SUBAPP_LIST) {
          prefetch(app).then(func => func.call(this));
        }
      }
    });
  }
}
</script>
