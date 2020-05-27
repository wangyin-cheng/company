const omcGsv = window.LOCAL_CONFIG.OMC_GSV
const whiteList = [
  '/cas/user/logout',
  '/getSecurityKey',
  '/unlock.json',
  '/submitLogin',
  '/updatePwd',
  '/lock.json',
  '/insertUserMenuFavorite',
  '/deleteByMenuCodeAndUserId',
  '/getCurrUserInfo',
  '/updateUserInfo',
  '/checkUserNameOrPwd.json',
  '/getCheckCode',
  '/logout',
  '/checkDefaultPwd',
  '/checkPwdExpired',
  '/expiredDays',
  '/getUserInfo',
  '/getSubsystem',
  '/getUserAuthMenus',
  '/dragAndDropMenu',
  '/getCustomGroupConfigListByPage',
  '/getCurrUser',
  '/getIndexInfo',
  '/getParamterById',
  '/getTenantList',
  '/getUserTenantInfo',//获取租户信息
  '/saveUserBehaviorLog',//记录用户行为分析
  '/getInboxNoReadMsgList',
  '/getInboxMsgListByPage',
  '/updateIsReadSataus',
  '/userTenantChange',
  '/getSpaceTreeByUserId'
]
const regExpList = whiteList.map(url => new RegExp(`${omcGsv + url}(\\\\?\\S*)?$`, 'i'))

export default function (url) {
  return regExpList.some(re => re.test(url))
}
