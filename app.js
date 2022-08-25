// app.js
import TIM from 'tim-wx-sdk';
import TIMUploadPlugin from 'tim-upload-plugin';
const WXAPI = require('./static/apifm-wxapi/index')
App({
  onLaunch() {



    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      success: function (res) {
        console.log('开启静音模式下播放音乐的功能');
      },
      fail: function (res) {
        console.log('静音设置失败');
      }
    });

 
   
 
   

    // ---------------检测navbar高度
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    console.log("小程序胶囊信息", menuButtonObject)
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2; //导航高度
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.menuButtonObject = menuButtonObject;
        console.log("navHeight", navHeight);
      },
      fail(err) {
        console.log(err);
      }
    })

    this.qryRightsTypeCodeValue()
  },



  //声明周期函数--监听页面显示
  onShow: function (ret) {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })

    if (ret.path !== 'pages/login/auth' && ret.path !== 'pages/home/main') {
      //非正常进入小程序
      var urlWithArgs = ret.path + '?';
      for (var key in ret.query) {
        var val = ret.query[key]
        urlWithArgs += key + '=' + val + '&'
      }
      urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
      console.log('app.js-onShow:' + urlWithArgs)



      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo && userInfo.account && userInfo.account.accountId) {
        if (!userInfo.account.user || userInfo.account.user.length === 0) {
          //保存转发页面
          wx.setStorageSync('routPage-w', urlWithArgs);
          //如果没有就诊人就跳转到添加就诊人
          wx.navigateTo({
            url: '/pages/me/patients/addPatient',
          })
        }

      } else {
        //保存转发页面
        wx.setStorageSync('routPage-w', urlWithArgs);
        //如果没有用户信息就跳转登录
        wx.navigateTo({
          url: '/pages/login/auth',
        })
      }
    }

  },

   //获取权益类别集合
   async qryRightsTypeCodeValue() {
    const res= await WXAPI.qryCodeValue('GOODS_SERVICE_TYPE')
     if(res.code === 0 && res.data.length>0){
       getApp().globalData.rightTypeList=res.data
     }
   },

  //获取用户信息
  getAccountInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.account && userInfo.account.accountId) {
      if (!userInfo.account.user || userInfo.account.user.length === 0)  {
        wx.navigateTo({
          url: '/pages/me/patients/addPatient'
        })
       
      }
      return userInfo
    } else {
      //如果没有用户信息就跳转登录
      wx.navigateTo({
        url: '/pages/login/auth',
      })
      return null
    }
  },
  //获取就诊人列表
  getPatientInfoList() {
    const userInfo= this.getAccountInfo()
    if(userInfo){
      return userInfo.account.user
    }
    
  },
  //获取默认就诊人
  getDefaultPatient() {
    const defaultPatient= wx.getStorageSync('defaultPatient')
    if(!defaultPatient){
     //如果没有用户信息就跳转登录
     wx.navigateTo({
      url: '/pages/login/auth',
    })
    }
    return defaultPatient
  },

  //获取权益类型和名称
  getRightsType(type){
    var rithtType=''
    
    if(getApp().globalData.rightTypeList.length > 0){
      getApp().globalData.rightTypeList.forEach(item=>{
        if(item.code===type){
          rithtType= item
        }
      })
    }
    return rithtType
  },
// 监听全局变量变化
watch: function (variate, method) {
    var obj = this.globalData;
    let val = obj[variate];// 单独变量来存储原来的值
    Object.defineProperty(obj, variate, {
      configurable: false,
      enumerable: true,
      set: function (value) {
        val = value;// 重新赋值
        method(variate,value);// 执行回调方法
      },
      get: function () {
        // 在其他界面调用getApp().globalData.variate的时候，这里就会执行。
        return val; // 返回当前值
      }
    })
  },

 

  globalData: {
    //腾讯云IM
    //线上 appid: 1400547247  
    //测试 appid: 1400613243   
    //演示 appid: 1400684981   
    sdkAppID: '',
    IMuserID: '',
    IMuserSig: '',
    sdkReady: false,
    unreadServerMessageCount:0,//个案和客服未读消息数
    unreadDocoterMessageCount:0,//护士未读消息数

    yljgdm: '444885559',//医疗机构代码
    remindedRights:[],//提醒过的权益
    rightTypeList:[],//权益类型列表
  },
  bedApplyInfo: null,//床位预约申请
  technologyAppointInfo:null,//医技预约申请
  tim: null,//腾讯云IM实例
  jyxq: null,//检验详情
  jcxq: null,//检查详情
  rightsDetail:null,//权益详情
  extraData:null,//使用权益跳转互联网医院小程序的参数（风湿科提交成功）
})  