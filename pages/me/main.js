const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')

Page({
  data: {
    unMyMessageNum: 0,
    unMedcionRemindNum: 0,
    unfinishedTaskNum: 0,
    hidePatientShow: true,
    balance: 0.00,
    freeze: 0,
    score: 0,
    growth: 0,
    score_sign_continuous: 0,
    rechargeOpen: false, // 是否开启充值[预存]功能

    // 用户订单统计数据
    count_id_no_confirm: 0,
    count_id_no_pay: 0,
    count_id_no_reputation: 0,
    count_id_no_transfer: 0,

    // 判断有没有用户详细资料
    userInfoStatus: 0,// 0 未读取 1 没有详细信息 2 有详细信息
    unreadIMmessageCount: 0,//IM未读数
    userInfo: null,
    defaultPatient: null
  },
  onLoad() {
  },
  /**
* 生命周期函数--监听页面显示
*/
  onShow: function () {
    var userInfoSync = wx.getStorageSync('userInfo')
    if (!userInfoSync) {
        return 
    }
    var user = wx.getStorageSync('userInfo').account
    user.phone = user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    this.setData({
      defaultPatient: wx.getStorageSync('defaultPatient'),
      patientList: wx.getStorageSync('userInfo').account.user,
      userInfo: user,
    })

    var names = []
    this.data.patientList.forEach(item => {
      names.push(item.userName)
    })
    this.setData({
      nameColumns: names
    })

    // if (this.data.defaultPatient) {
    //   this.getNoticeNumber('MN', this.data.defaultPatient.userId)
    //   this.getNoticeNumber('MR', this.data.defaultPatient.userId)
    //   this.getNoticeNumber('HT', this.data.defaultPatient.userId)
    //   if (getApp().globalData.sdkReady) {
    //     this.getConversationList()
    //   }
    //   // this.onIMReceived()
    // }

  },
  checkLoginStatus() {
    if (getApp().globalData.loginReady) {
        return true
    }else {
        wx.showModal({
            title: '提示',
            content: '此功能需要登录',
            confirmText: '去登录',
            cancelText: '取消',
            success(res) {
                if (res.confirm) {
                   wx.navigateTo({
                     url: '/pages/login/auth',
                   })
                }
            }
        })
        return false
    }

},
avatarBinderror(e){

    this.data.userInfo.avatarUrl='/image/avatar.png'
    this.setData({
        userInfo:this.data.userInfo
    })
    
 },
  goHealthRecords() {
    wx.navigateTo({
      url: '../home/health-records/index',
    })
  },
  //健康记录
  goRecordListPage(){
      if(this.checkLoginStatus()){
        if(getApp().getDefaultPatient()){
            wx.navigateTo({
                url: '../home/upload/recordList?userId='+this.data.defaultPatient.userId,
              })
        }

      }
  },
  goRecordPage() {
    wx.navigateTo({
      url: '../record/index',
    })
  },
  goSetPage() {
    wx.navigateTo({
      url: './setting/index',
    })
  },
  goInfoPage() {
    wx.navigateTo({
      url: './info/index',
    })
  },
  goPlanPage(e){
    if(this.checkLoginStatus()){
        if(getApp().getDefaultPatient()){
        wx.navigateTo({
            url: './my-plan/index',
          })
        }
    }

  },
  goMyEvalPage(){
    if(this.checkLoginStatus()){
        if(getApp().getDefaultPatient()){
        wx.navigateTo({
            url: './my-eval/index',
          })
        }
    }

  },
  goMyConsultPage(){
    if(this.checkLoginStatus()){
        if(getApp().getDefaultPatient()){
        wx.navigateTo({
            url: './consult/index',
          })
        }
    }
  },
  goOrderListPage(e) {
    if(this.checkLoginStatus()){
        if(getApp().getDefaultPatient()){
        var type = e.currentTarget.dataset.type
        wx.navigateTo({
          url: './order/order-list?active=' + type,
        })
    }
    }

  },
  goTechnologyListPage(){
    if(this.checkLoginStatus()){
        if(getApp().getDefaultPatient()){
        wx.navigateTo({
            url: '../home/technology/record-list',
          })
        }
    }

  },
  goAddPage() {
    wx.navigateTo({
      url: './patients/addPatient',
    })
  },
  goMyPatientPage() {
      if(this.checkLoginStatus()){
        wx.navigateTo({
            url: './patients/index',
          })
      }

  },


  //预约床位
  goBedPage(){
wx.navigateTo({
  url: './bed/appointList',
})
  },

 
  goReservationPage() {
    wx.switchTab({
      url: '../cloud-doctor/index',
    })
  },
  goEmptyPage() {
    wx.showToast({
      title: '正在开发中',
      icon: 'none',
      duration: 2000
    })
  },
  goMessagePage() {
    wx.navigateTo({
      url: './message/index?userId=' + this.data.defaultPatient.userId,
    })
  },
  goRemindPage() {
    wx.navigateTo({
      url: './medication-list/index?userId=' + this.data.defaultPatient.userId,
    })
  },
  bindMedicalCard() {
    wx.navigateTo({
      url: './medical-card/card-list',
    })
  },

  onPatientPickerConfirm(event) {
    console.log(event)
    var index = event.detail.index
    var selectPatient = this.data.patientList[index]
    if (selectPatient.userId !== this.data.defaultPatient.userId) {
      this.setData({
        defaultPatient: this.data.patientList[index],
      });
      //保存默认就诊人
      wx.setStorageSync('defaultPatient', this.data.defaultPatient)
      IMUtil.LoginOrGoIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig)
      wx.showToast({
        title: '切换成功',
        icon: 'success',
        duration: 2000
      })
    }
    this.setData({
      hidePatientShow: true
    });

  },
  onPatientPickerCancel() {
    // this.setData({
    //   hidePatientShow: true
    // })
    wx.navigateTo({
      url: '/pages/me/patients/addPatient',
    })
  },
  bindPatientTap: function () {
    this.setData({
      hidePatientShow: false
    })
  },
  closePatientTap: function () {
    this.setData({
      hidePatientShow: true
    })
  },
  //获取我的消息/用药提醒/健康任务数量
  async getNoticeNumber(noticeType, userId) {
    const res = await WXAPI.getNoticeNumber(noticeType, userId)
    if (res.code == 0) {
      if (noticeType === 'MN') {//我的消息
        this.setData({
          unMyMessageNum: res.data
        })
      } else if (noticeType === 'MR') {//用药提醒
        this.setData({
          unMedcionRemindNum: res.data
        })
      } else if (noticeType === 'HT') {//健康任务
        this.setData({
          unfinishedTaskNum: res.data
        })
      }


    }

  },
  addPatientTap: function () {
      console.log('addPatientTap')
    if(this.checkLoginStatus()){
      wx.navigateTo({
          url: './patients/addPatient',
        })
    }

},

  onShareAppMessage: function () {
    // 页面被用户转发
  },
  onShareTimeline: function () {
    // 页面被用户分享到朋友圈
  },
  
})