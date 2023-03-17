const WXAPI = require('../../../static/apifm-wxapi/index')
const IMUtil = require('../../../utils/IMUtil')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        defaultPatient: null,
        patientList: null,
        userInfo: null,
        baseInforData: null,
        tableListData:[],
        hidePatientShow:true,
        nameColumns:[],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
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
        this.getUserExternalInfoOut()
        this.getSavedUserTagsInfoOut()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log("更新界面")
        this.getUserExternalInfoOut(),
        this.getSavedUserTagsInfoOut()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },


    async getUserExternalInfoOut(e) {
        console.log("BBBF:",this.data.defaultPatient)
        //发起网络请求
        var that = this;
        const res = await WXAPI.getUserExternalInfo(that.data.defaultPatient.userId)
        if (res.code == 0) {
            var baseInfo = {
                birthday: res.data.birthday || '',
                height: res.data.height || '',
                weight: res.data.weight || '',
                bloodType: res.data.bloodType || '',
                ismarry: res.data.ismarry || null,
                havechild: res.data.havechild || null,
            }
            that.setData({
                baseInforData: baseInfo,
            })
        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }

        console.log("PPP:",that.data.baseInforData)
    },
    

    //获取健康标签
    async getSavedUserTagsInfoOut(e) {
        //发起网络请求
        var that = this;
        const res = await WXAPI.getSavedUserTagsInfo(that.data.defaultPatient.userId)
        if (res.code == 0) {
            that.setData({
                tableListData: res.data,
            })
        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }

        // console.log("HHH:",this.data.tableListData)
    },


    //跳转基本信息界面
    goBaseImformation() {
       var data = JSON.stringify(this.data.baseInforData)
       console.log("JJJ:",data)
        wx.navigateTo({
            url: './baseimformation?userId=' + this.data.defaultPatient.userId+'&data='+data,
        })
    },

    
    //跳转健康状况界面
    goHealthstatus() {
        // var data = JSON.stringify(this.data.baseInforData)
         wx.navigateTo({
             url: './healthstatus?userId=' + this.data.defaultPatient.userId,
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
        
          this.getUserExternalInfoOut()
          this.getSavedUserTagsInfoOut()
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
        this.setData({
          hidePatientShow: true
        })
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
})