// pages/login/login.js
const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        type:'',//类型  RELOGIN   TOKENFAIL  
        userInfo: {},
        registered: true,
        isLogining: true,
        isAuthed: true,//是否授权
        canIUseGetUserProfile: false,
        hasUserInfo: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }
        this.setData({
            type: options.type
        })
        if (this.data.type == 'TOKENFAIL') {
            wx.showToast({
                icon: "none",
                title: 'Token错误或失效，请重新登录',
                duration: 2000,
            })
        }
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
        this.WXloginForLogin()
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
        getApp().globalData.reLaunchLoginPage=false
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




    getUserProfile(e) {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        let that = this
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log('getUserProfile', res.userInfo)
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        })
    },
    getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        let that = this
        console.log('getUserInfo', e.detail.userInfo)
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },

    //获取到用户的手机号
    getPhoneNumber(e) {

        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
        this.decryptPhone(e.detail.iv, e.detail.encryptedData)
    },

    //登录时获取code
    WXloginForLogin() {
        // wx.showLoading({
        //   title: '登录中...',
        // })
        this.setData({
            isLogining: true
        })
        let that = this
        wx.login({
            success(res) {
                console.log("WXlogin", res)
                if (res.code) {
                    that.loginQuery(res.code);
                } else {
                    wx.showToast({
                        title: '获取微信code失败',
                        icon: "none",
                        duration: 2000
                    })
                    that.setData({
                        isLogining: false
                    })
                }
            }
        })
    },



    //登录
    async loginQuery(e) {



        const res = await WXAPI.loginQuery({
            code: e,
            appId: wx.getAccountInfoSync().miniProgram.appId
        })
        // wx.hideLoading()
        if (res.code == 0) {
            this.loginSuccess(res.data)

        } else if (res.code == 10003) { //用户不存在
            this.setData({
                registered: false
            })
            //获取手机号前先获取code
            this.WXloginForRegister()
        } else {
            wx.showToast({
                title: '登录失败,请重试',
                icon: "none",
                duration: 2000
            })
            this.setData({
                isLogining: false
            })
        }
    },

    //注册时获取code
    WXloginForRegister() {
        let that = this
        wx.login({
            success(res) {
                console.log("WXloginForRegister", res.code)
                if (res.code) {
                    that.getOpenId(res.code)

                } else {
                    wx.showToast({
                        title: '微信登录失败',
                        icon: "none",
                        duration: 2000
                    })
                }
            }
        })
    },
    //注册时获取openid
    async getOpenId(code) {
        const res = await WXAPI.getOpenId({ code: code, appId: wx.getAccountInfoSync().miniProgram.appId })

        if (res.code == 0) {

            this.setData({
                openid: res.data.openid,
                unionid: res.data.unionid,
                sessionKey: res.data.sessionKey,
                isAuthed: false
            })
        } else {
            wx.showToast({
                title: '获取openid失败',
                icon: "none",
                duration: 2000
            })
        }
    },
    //注册时获取解密手机号
    async decryptPhone(iv, encryptedData) {
        const res = await WXAPI.decryptPhone(
            {
                iv: iv,
                encryptedData: encryptedData,
                sessionKey: this.data.sessionKey,
                appId: wx.getAccountInfoSync().miniProgram.appId
            })

        if (res.code == 0) {
            this.registerQuery(res.data)
        } else {
            wx.showToast({
                title: '获取openid失败',
                icon: 'error',
                duration: 2000
            })
        }
    },
    //注册
    async registerQuery(phone) {
        //发起网络请求
        var that = this;
       
        var data = {
            appId: wx.getAccountInfoSync().miniProgram.appId,
            phone: phone,
            password: '123456',
            code: '123456',
            openId: this.data.openid,
            unionId: this.data.unionid,
            userName: phone,
            avatarUrl: '',
            nickName: phone,

        };
        const res = await WXAPI.registerQuery(data)

        if (res.code == 0) {
            wx.showToast({
                title: '登录成功！',
                icon: 'success',
                duration: 2000
            })

            that.loginSuccess(res.data)

        } else {
            wx.showToast({
                title: '注册失败',
                icon: 'error',
                duration: 2000
            })
        }
    },

    loginSuccess(userInfo) {

        //保存用户信息
        wx.setStorageSync('userInfo', userInfo)
          //保存此账户所有就诊人
        wx.setStorageSync('allPatientList', userInfo.account.user)
        //IM apppid
        getApp().globalData.sdkAppID = userInfo.account.imAppId
        getApp().globalData.loginReady=true


        if (userInfo.account.user && userInfo.account.user.length > 0) {
            var defaultPatient = userInfo.account.user[0]
            userInfo.account.user.forEach(item => {
                if (item.isDefault) {
                    defaultPatient = item
                }
            })
            //保存默认就诊人
            wx.setStorageSync('defaultPatient', defaultPatient)
            IMUtil.LoginOrGoIMChat(defaultPatient.userId, defaultPatient.userSig)
        }
       
        //登录成功后跳转
        this.routToPage()
    },


    //登录成功后跳转
    routToPage() {
        //获取缓存的路径地址      
        let routPage = wx.getStorageSync('routPage-w');
        if (routPage) { //如果是非正常路径进入的小程序 由于没有用户信息转登录页的  
            //跳转记录地址
            wx.reLaunch({
                url: '/' + routPage
            });
            //使用后删除
            wx.removeStorageSync('routPage-w');
        } else if (this.data.type == 'RELOGIN' || this.data.type == 'TOKENFAIL') {//token失效等情况重新登陆的 返回上一页
            wx.navigateBack({
                delta: 1,
            })
        } else {
            //页面跳转首页
            wx.switchTab({
                url: '../home/main'
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