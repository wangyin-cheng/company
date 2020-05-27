<template>
  <div class="accept-container">
    <iframe ref="iframe" frameborder="0" scrolling="auto" :src="iframeSrc"></iframe>
  </div>
</template>

<script>
const { URLSearchParams } = require("@common/utils/url-search-params.min");
export default {
  name: "IframeComponent",
  props: ["url"],
  computed: {
    iframeSrc() {
      const searchParams = new URLSearchParams();

      const {
        meta: {
          menuArgs: { menu_arg }
        }
      } = this.$route;

      if (menu_arg) {
        for (const key in menu_arg) {
          if (menu_arg.hasOwnProperty(key)) {
            searchParams.append(key, menu_arg[key]);
          }
        }
      }

      if (searchParams.toString()) {
        return this.url + "?" + searchParams.toString();
      }

      return this.url;
    }
  },
  methods: {
    setIframeWidth() {
      const deviceWidth = document.getElementsByClassName("app-main")[0].clientWidth;
      const deviceHeight = document.documentElement.clientHeight - document.getElementsByClassName("h-topbar-wrapper")[0].clientHeight - document.getElementsByClassName("h-navbar-wrapper")[0].clientHeight - 16;
      this.$nextTick(() => {
        if (this.$refs.iframe) {
          this.$refs.iframe.style.width = deviceWidth + "px";
          this.$refs.iframe.style.height = deviceHeight + "px";
        }
      });
    }
  },
  mounted() {
    const that = this;
    that.setIframeWidth();
    window.addEventListener("resize", function() {
      that.setIframeWidth();
    });
  }
};
</script>

<style scoped>
.accept-container {
  font-size: 0;
}
</style>
