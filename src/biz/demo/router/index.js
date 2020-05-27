export default {
  bizSetDict: () => import(/* webpackChunkName: "demo/bizSysManager/bizSetDict" */`@demo/views/bizMenu/bizSysManager/bizSetDict`),
  bizSetCache: () => import(/* webpackChunkName: "demo/bizSysManager/bizSetCache" */`@demo/views/bizMenu/bizSysManager/bizSetCache`),
  bizEmailInbox: () => import(/* webpackChunkName: "demo/bizMsgManager/bizEmailInbox" */`@demo/views/bizMenu/bizMsgManager/bizEmailInbox`),
  manyToOne: () => import(/* webpackChunkName: "demo/views/ManyToOne" */`@demo/views/ManyToOne.vue`),
  test: () => import(/* webpackChunkName: "demo/views/test" */'@demo/views/test.vue'),
  huiTest: () => import(/* webpackChunkName: "demo/views/huiTest" */'@demo/views/huiTest.vue')
}
