// pages/me/editUser.js
const WXAPI = require('../../../static/apifm-wxapi/index')
const UserManager = require('../../../utils/UserManager')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isDefault: '',
        userId: '',
        userName: '',
        userSex: '',
        userAge: '',
        identificationType: '',
        identificationNo: '',
        relationship: '',
        phone: '',
        oldPhone: '',
        cardNo: '',
        code: '',
        time: '获取验证码',
        currentTime: 60,
        btn: false,
        disabled: false,
        switchStatue: false,
        patientsNum: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            userId: options.userId,
            patientsNum: options.patientsNum
        })
        this.patientDetailQuery();
        if (options.type === 'ADD_CARDNO') {
            wx.showModal({
                title: '提示',
                content: '业务需要，请添加患者就诊卡号',
                showCancel: false
            })
        }
    },
    getPhoneValue(e) {
        this.setData({
            phone: e.detail.value
        })
    },
    getCardNoValue(e) {
        this.setData({
            cardNo: e.detail.value
        })
    },
    getVScodeValue(e) {
        this.setData({
            code: e.detail.value
        })
    },
    async codeLoginedQuery(e) {
        //发起网络请求
        var that = this;
        const res = await WXAPI.codeLoginedQuery({ phone: that.data.phone, appId: wx.getAccountInfoSync().miniProgram.appId })
        console.log(res)
        if (res.code == 0) {
            that.daojishi();
            wx.showToast({
                title: '发送成功',
                icon: 'success',
                duration: 2000
            })
        } else {
            wx.showToast({
                title: '发送失败',
                icon: 'error',
                duration: 2000
            })
        }
    },
    //患者详情
    async patientDetailQuery(e) {
        //发起网络请求
        var that = this;
        const res = await WXAPI.patientDetailQuery({ userId: that.data.userId })
        console.log(res)
        if (res.code == 0) {
            console.log(res.data)
            var identificationType = '';
            if (res.data.user.identificationType == '01') {
                identificationType = '身份证';
            } else if (res.data.user.identificationType == '03') {
                identificationType = '护照';
            } else if (res.data.user.identificationType == '04') {
                identificationType = '军官证';
            } else {
                identificationType = '港澳通行证';
            }
            that.setData({
                userName: res.data.user.userName,
                userAge: res.data.user.userAge,
                userSex: res.data.user.userSex,
                cardNo: res.data.user.cardNo,
                relationship: res.data.user.relationship,
                phone: res.data.user.phone,
                oldPhone: res.data.user.phone,
                identificationNo: res.data.user.identificationNo,
                identificationType: identificationType,
                switchStatue: res.data.user.isDefault,
                isDefault: res.data.user.isDefault
            })
            if (this.data.isDefault) {
                wx.showModal({
                    title: '提示',
                    content: '默认就诊人不能修改默认状态和删除，您可切换默认就诊人后进行这些操作',
                    showCancel: false,
                })
            }


        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }
    },

    //deleteAction
    deleteAction: function () {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '确认删除该就诊人？',
            success: function (res) {
                if (res.confirm) {//这里是点击了确定以后
                    console.log('用户点击确定')
                    that.deletePatientQuery();
                } else {//这里是点击了取消以后
                    console.log('用户点击取消')
                }
            }
        })
    },
    //删除就诊人
    async deletePatientQuery() {
        //发起网络请求
        var that = this;
        const res = await WXAPI.deletePatientQuery({ userId: that.data.userId, accountId: wx.getStorageSync('userInfo').account.accountId })
        console.log(res)
        if (res.code == 0) {
            console.log(res.data)
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
            })
            UserManager.savePatientInfoList(res.data)
            wx.navigateBack({
                delta: 1,
            })
        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }
    },
    saveAction: function () {
        let that = this
        var code = that.data.code
        var phone = that.data.phone
        var oldPhone = that.data.oldPhone
        if (!that.data.cardNo || that.data.cardNo.length <= 0) {
            wx.showToast({
                title: '请输入就诊卡号',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (phone.length != 11) {
            wx.showToast({
                title: '手机号有误！',
                icon: 'error',
                duration: 1500
            })
            return;
        }
        if (phone.substr(0, 3) < 130 || phone.substr(0, 3) > 199) {
            wx.showToast({
                title: '手机号码有误',
                icon: 'error',
                duration: 1500
            })
            return;
        }
        if (oldPhone != phone) {
            if (code.length < 6) {
                wx.showToast({
                    title: '请输入验证码',
                    icon: 'error',
                    duration: 1500
                })
                return;
            }
        }
        that.editPatientQuery();
    },
    //修改就诊人
    async editPatientQuery(e) {
        //发起网络请求
        var that = this;
        var isDefault = that.data.switchStatue
        var code = that.data.code
        var phone = that.data.phone
        var relationship = that.data.relationship
        const res = await WXAPI.editPatientQuery({ userId: that.data.userId, accountId: wx.getStorageSync('userInfo').account.accountId, phone: phone, code: code, relationship: relationship, isDefault: isDefault, cardNo: that.data.cardNo })
        console.log(res)
        if (res.code == 0) {
            console.log(res.data)
            wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 2000
            })
            UserManager.savePatientInfoList(res.data)
            wx.navigateBack({
                delta: 1,
            })
        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }
    },
    //获取验证码 
    getCode: function () {
        this.codeLoginedQuery();
    },
    //倒计时
    daojishi: function (options) {
        var that = this;
        var currentTime = that.data.currentTime
        var interval = setInterval(function () {
            currentTime--;
            that.setData({
                time: currentTime + '秒后重新发送',
                btn: true
            })
            if (currentTime <= 0) {
                clearInterval(interval)
                that.setData({
                    time: '重新发送',
                    btn: false,
                    currentTime: 60,
                    disabled: false
                })
            }
        }, 1000)
    },

    //切换默认状态
    switchTap: function (e) {
        var that = this;
        var switchStatue = that.data.switchStatue;
        that.setData({
            switchStatue: !switchStatue
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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

    onShareAppMessage: function () {
        // 页面被用户转发
      },
      onShareTimeline: function () {
        // 页面被用户分享到朋友圈
      },
})