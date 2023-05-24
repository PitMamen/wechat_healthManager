//上线前修改成release  每一个版本会对应不同的接口地址和常量
//develop:开发测试版  trial:演示版   release:正式版
export const ProgramEnvVersion = 'develop'


/**
 * 获取常量
 * 会根据小程序的版本来适配
 */
export function getConstantData() {

    var obj = {
      
        JingshenQuestionnaire: '', //精神科问卷问卷 
        YouzanAPPID : 'wx369e143bb6dadc2b',//有赞商城小程序APPID
        envVersion: 'trial', //跳转互联网医院小程序、有赞商城小程序的版本 trial：体验版  develop：开发板
    }
    if (ProgramEnvVersion === 'develop') { //开发版 测试版
      
        obj.JingshenQuestionnaire = '/s/8acbbc95559c45518ea8225176f12912'
        obj.envVersion = 'trial'
    } else if (ProgramEnvVersion === 'trial') { //演示版
      
        obj.JingshenQuestionnaire = '/s/668eb8e4ca8f468cbab066e963919dc5'
        obj.envVersion = 'trial'
    } else if (ProgramEnvVersion === 'release') { //正式版
       
        obj.JingshenQuestionnaire = '/s/dd548f53476443d599c1bec5ea33961e'
        obj.envVersion = 'release'
    }
    return obj
}

/**
 * 无需登录的页面 
 */
export function checkNoLoginPage(routPage) {
    console.log('routPage',routPage)
  var pages=[
      'pages/home/main',
      'pages/me/main',
      'pages/health/service/index',
      'pages/health/detail/index',
      'pages/doctor/search/index',
      'pages/doctor/info/index',
      'pages/doctor/detail/index',
      'pages/home/news/news-list',
      'pages/home/news/news-detail',
      'pages/home/hospital-select/index',
      'pages/doctor/guide/index',
      'pages/login/confirm-patient'
  ]
  var b=false
  pages.forEach(item=>{
      if(routPage.indexOf(item) > -1){
          b= true
      }
  })
  console.log("checkNoLoginPage",b)
  return b
}

/**
 * 首页菜单 点击需要判断是否登录的页面合集 
 */
export function checkMenuLoginPage(routPage) {
    console.log('routPage',routPage)
  var pages=[
      '/packageIM', //聊天相关页面
  ]
  var b=false
  pages.forEach(item=>{
      if(routPage.indexOf(item) > -1){
          b= true
      }
  })
  return b
}