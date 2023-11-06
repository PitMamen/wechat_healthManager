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
        this.setData({
            navHeight: getApp().globalData.navHeight,

        })
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
   
 
    goMyConsultPage() {
        //把参数保存至全局变量
        getApp().globalData.consultPageActive = '2'
        wx.switchTab({
            url: '/pages/consult/index',
        })
    },
    goMorePage() {
        wx.navigateTo({
            url: '/packageSub/pages/me/more/index',
        })
    },

 
    goOrderListChatPage(e) {
        var type = e.currentTarget.dataset.type
        wx.navigateTo({
            url: '/packageSub/pages/me/order/order-list-chat?broadClassify=' + type,
        })
    },
    goOrderListSpecialPage(e) {
        var type = e.currentTarget.dataset.type
        wx.navigateTo({
            url: '/packageSub/pages/me/order/order-list-special?broadClassify=' + type,
        })
    },

    // 跳转至处方列表界面
    goChufangListPage(){
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: '/packageSub/pages/me/prescription/index',
                })
            }
        }
    },


    goMyHealthRecords() {
        if(this.checkLoginStatus()){
            if(getApp().getDefaultPatient()){
               
                wx.navigateTo({
                    url: '/packageSub/pages/me/health/healthrecords',
                  })
            }
    
        }

    },
   
    goAddPage() {
        wx.navigateTo({
            url: '/packageSub/pages/me/patients/addPatient',
        })
    },
    goMyPatientPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: '/packageSub/pages/me/patients/index',
                })
            }

        }
    },
    //选择头像
    onChooseAvatar(e) {
        if (!this.checkLoginStatus()) {
            return
        }
        console.log(e)
        const { avatarUrl } = e.detail 
        WXAPI.uploadImgFile(avatarUrl, "DEFAULT").then((fileInfo) => {          
            if(fileInfo.previewUrl){

                WXAPI.updateCustomAccount({avatarUrl:fileInfo.previewUrl}).then(res=>{
                    if(res.code == 0){
                        this.data.userInfo.avatarUrl=fileInfo.previewUrl
                        this.setData({
                            userInfo:this.data.userInfo
                        })
                    }else {
                        wx.showToast({
                            title: '头像上传失败',
                            icon:'none'
                          }) 
                    }
                   
                })

              
            }else {
                wx.showToast({
                  title: '头像上传失败',
                  icon:'none'
                })
            }
            
        })
      },
    testBtn() {
        wx.navigateTo({
            //   url: '/pages/home/rate/doctor?rightsId='+708,
            url: '/pages/home/rate/package?rightsId=' + 699,
        })
    },
    //跳转到商城小程序订单页
    goStoreOrderListPage() {
        wx.navigateToMiniProgram({
            appId: Config.getConstantData().YouzanAPPID,
            envVersion: Config.getConstantData().envVersion,
            path: 'packages/trade/order/list/index',
        })
    },



    goEmptyPage() {
        wx.showToast({
            title: '正在开发中',
            icon: 'none',
            duration: 2000
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
            url: '/packageSub/pages/me/patients/addPatient',
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
    goMyDoctorPage(){
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: '/packageSub/pages/me/my-doctor/index',
            })
        }
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
                url: '/packageSub/pages/me/patients/addPatient',
            })
        }

    },
    testBtn() {

        // wx.navigateTo({
        //     url: '/pages/login/confirm-patient?ks=2350058&tenantId=100000&hospitalCode=444885559'
        // })
        wx.navigateTo({
            url: `/pages/home/package-detail/packagedetail?cmdId=203&docId=631&tenantId=100000&hospitalCode=444885559`
        })
    },
    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },

})