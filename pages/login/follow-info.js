const WXAPI = require('../../static/apifm-wxapi/index')
const UserManager = require('../../utils/UserManager')
const Util = require('../../utils/util')
Page({
    data: {
        showPositiveDialog: false,
        info: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            info: getApp().followInfo
        })
        console.log(this.data.info)
    },
    getIDCardNoValue(e) {
        this.setData({
            identificationNo: e.detail.value
        })
    },
    getPhoneValue(e) {
        this.setData({
            emergencyPhone: e.detail.value
        })
    },
    bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            relationship: this.data.relationArray[e.detail.value].name
        })
    },
    backAction: function () {
        wx.navigateBack({
            delta: 0,
        })
    },
    //提交
    nextAction: function () {

        var patientInfoList = UserManager.getPatientInfoList()
        console.log(patientInfoList)
        var user = null
        if (patientInfoList && patientInfoList.length > 0) {
            patientInfoList.forEach(item => {
                if (item.identificationNo === this.data.info.idno) {
                    user = item

                }
            })
        }
        if (user) {
            this.addPatientMedicalRecords(user.userId)

        } else {
            this.addPatientQuery()
        }


    },

    addPatientQuery() {

        var that = this;
      
        var idInfo = Util.getBirthdayAndSex(that.data.info.idno)
        var user = wx.getStorageSync('userInfo').account
        const postData = {
            accountId: user.accountId,
            userName: that.data.info.name,
            identificationNo: that.data.info.idno,
            identificationType: '01',//默认身份证
            phone: that.data.info.mobile,
            code: '1',
            birthday: idInfo.birthDay,
            relationship: that.data.info.relationship,
            isDefault: true,
            cardNo: that.data.info.cardNum,//就诊卡号
            userSex: idInfo.sex == 0 ? '女' : '男',
            ipNo: that.data.info.adm,//住院号
            contactTel: that.data.info.urgentTel,//紧急联系电话
        }
        WXAPI.addPatientQuery(postData).then(res => {
            if (res.code == 0) {
                var patientInfoList = res.data
                UserManager.savePatientInfoList(patientInfoList)

                if (patientInfoList && patientInfoList.length > 0) {
                    patientInfoList.forEach(item => {
                        if (item.isDefault) {

                            that.addPatientMedicalRecords(item.userId)
                        }
                    })
                }
            } else {
                wx.showModal({
                    title: '系统提示',
                    content: res.message,
                    showCancel: false,
                })


            }
        }).catch(e => {
            wx.showModal({
                title: '系统提示',
                content: '请求失败，请重试',
                showCancel: false,
            })

        })

    },
    /**
       * 提交
       */
    async addPatientMedicalRecords(userId) {
      
        var postData=this.data.info
        postData.userId=userId

        const res = await WXAPI.addFollowMedicalRecords(postData)

        if (res.code === 0) {
            this.setData({
                showPositiveDialog:true
            })
        }

    },

    onDialogConfirm() {
        wx.reLaunch({
            url: '/pages/home/main',
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})