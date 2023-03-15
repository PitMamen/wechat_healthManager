const WXAPI = require('../../../static/apifm-wxapi/index')


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
        this.getUserExternalInfoOut()
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
        // console.log("BBBF:",this.data.defaultPatient)
        //发起网络请求
        var that = this;
        const res = await WXAPI.getUserExternalInfo(this.data.defaultPatient.userId)

        if (res.code == 0) {
            that.setData({
                baseInforData: res.data,
            })
        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }
    },
    

    async getSavedUserTagsInfoOut(e) {
        //发起网络请求
        var that = this;
        const res = await WXAPI.getSavedUserTagsInfo(this.data.defaultPatient.userId)
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
    },


    //跳转基本信息界面
    goBaseImformation() {
       var data = JSON.stringify(this.data.baseInforData)
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
})