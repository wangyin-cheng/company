import Vue from "vue";
import Vuex from "vuex";
// import frameStore from '@frame/store'
/* 开启vue-dev-tools */
if (process.env.NODE_ENV === "development") Vue.config.devtools = true;
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    currentSystemTheme: "lightblue"
  },
  mutations: {
    SWITCH_CURRENT_SYSTEM_THEME(state, theme) {
      state.currentSystemTheme = theme;
    }
  }
});
export default store;
