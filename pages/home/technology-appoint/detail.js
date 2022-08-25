const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.qryTradeAppointList(options.userId, options.tradeId)
    },
  /**
      * 预约工单查询
      */
     async qryTradeAppointList(userId,tradeId) {
      var postData = {
       
        tradeTypeCode:"lis",
        tradeId:tradeId,
        pageNo: 1,
        pageSize: 10000
      }
  
      const res = await WXAPI.qryTradeAppointList(postData)
    
      this.setData({
        info: res.data.rows[0],
        reqImagesList:res.data.rows[0].tradeAppointLog[0].dealImages ? res.data.rows[0].tradeAppointLog[0].dealImages.split(",") : null,
      })
  
    },
         //图片预览
 toDetailsTap: function (e) {
  var url = e.currentTarget.dataset.url

  wx.previewImage({
    urls: this.data.reqImagesList,
    current: url
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