const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')
const Config = require('../../utils/config')
Page({
    data: {

        hidePatientShow: true,
        userInfo: null,
        defaultPatient: null,
        myOrderCount: {}
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

        this.getRightsCount()
    },
    checkLoginStatus() {
        if (getApp().globalData.loginReady) {
            return true
        } else {
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
    avatarBinderror(e) {

        this.data.userInfo.avatarUrl = '/image/avatar.png'
        this.setData({
            userInfo: this.data.userInfo
        })

    },
    goHealthRecords() {
        wx.navigateTo({
            url: '../home/health-records/index',
        })
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
    goPlanPage(e) {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: './my-plan/index',
                })
            }
        }

    },
    goMyEvalPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: './my-eval/index',
                })
            }
        }

    },
    goMyConsultPage() {
        wx.switchTab({
            url: '/pages/consult/index',
        })
    },
    goMorePage() {
        wx.navigateTo({
            url: './more/index',
        })
    },

    goOrderListPage(e) {

        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                var type = e.currentTarget.dataset.type
                wx.navigateTo({
                    url: './order/order-list-new?broadClassify=' + type,
                })
            }
        }

    },
    goTechnologyListPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
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
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: './patients/index',
                })
            }

        }
    },
    testBtn(){
wx.navigateTo({
//   url: '/pages/home/rate/doctor?rightsId='+708,
  url: '/pages/home/rate/package?rightsId='+699,
})
    },
 //跳转到商城小程序订单页
 goStoreOrderListPage(){
    wx.navigateToMiniProgram({
        appId: 'wx369e143bb6dadc2b',
        envVersion: Config.getConstantData().envVersion,
        path: 'packages/trade/order/list/index',
    })
  },
    goMyHealthRecords() {
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: './health/healthrecords',
            })
        }

    },


    //预约床位
    goBedPage() {
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
    //获取订单数量
    getRightsCount() {
        WXAPI.getRightsCount().then(res => {
            if (res.code == 0) {
                this.setData({
                    myOrderCount: res.data
                })


            }
        })


    },
    //AI咨询
    goAIPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/packageIM/pages/chat/AIChat',
                    })

                }
            }
        }

    },
    addPatientTap: function () {
        console.log('addPatientTap')
        if (this.checkLoginStatus()) {
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