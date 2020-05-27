export default {
  router: {
    "style-isolate-index": () =>
      import(
        /* webpackChunkName: "style-isolate/index" */ `@style-isolate/views/index`
      )
  },

  i18n: false
};
