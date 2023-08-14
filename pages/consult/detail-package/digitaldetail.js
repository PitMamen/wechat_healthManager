const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        rightsId:0,
        info:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId:options.rightsId
        })
        this.getSzlfUseDetail(options.rightsId)
    },
    async getSzlfUseDetail(id) {
        const res = await WXAPI.getSzlfUseDetail({ rightsId: id })

        this.setData({
            info:res.data || {}
        })

    },
    gosmspage(){
        wx.navigateTo({
            url: './content/index?rightsId=' + this.data.rightsId
        })
    },
    goAPP(){
        //系统类型1APP2小程序3网站
        if(this.data.info.systemType == 1){
            var encodeUrl = encodeURIComponent(this.data.info.systemAddress)
            wx.navigateTo({
                url: '../webpage/index?url=' + encodeUrl
            })
        }else if(this.data.info.systemType == 2){
            wx.navigateToMiniProgram({
                appId: this.data.info.systemAddress,
                path: this.data.info.sysPath || undefined,
            })
        }else if(this.data.info.systemType == 3){
            var encodeUrl = encodeURIComponent(this.data.info.systemAddress)
            wx.navigateTo({
                url: '../webpage/index?url=' + encodeUrl
            })
        }
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