export default {
  router: {
    "style-skin-isolate-index": () =>
      import(
        /* webpackChunkName: "style-skin-isolate/index" */ `@style-skin-isolate/views/index`
      )
  },

  i18n: false
};
