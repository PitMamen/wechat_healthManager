const WXAPI = require('../../../static/apifm-wxapi/index.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       var info= getApp().technologyAppointInfo
       info.bookExam.IDCardNo = info.bookExam.IDCardNo.substring(0, 4) + '**********' +info.bookExam.IDCardNo.substring(info.bookExam.IDCardNo.length-4)
        this.setData({
            info: info
        })
        console.log(this.data.info)
    },

    //确认预约
    async doConfirmBook() {
        wx.navigateBack({
            delta: 2
          })
        // var postInfo={
        //     OEORowid:this.data.info.bookExam.OEORowid,
        //     appointInfo:this.data.info.appointInfo
        // }

        // const res = await WXAPI.doConfirmBook(postInfo)
        // if (res.code === 0) {
        //     wx.showModal({
        //         title: '提示',
        //         content: '预约成功！',
        //         showCancel: false,
        //         success(res) {
        //             if (res.confirm) {
        //                 wx.navigateBack({
        //                     delta: 2
        //                   })
        //             }
        //         }
        //     })
        // }
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


})