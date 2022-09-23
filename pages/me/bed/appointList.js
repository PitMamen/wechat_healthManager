const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ////工单状态（0：申请；1：审核通过；2：审核失败；3：预约成功；4：预约失败；5：取消预约申请；6：取消预约成功；7：取消预约失败）
    appointList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      defaultPatient: getApp().getDefaultPatient()
    })
    this.qryTradeAppointList()
  },
  /**
      * 预约工单查询
      */
  async qryTradeAppointList() {
    var postData = {
      "userId": this.data.defaultPatient.userId,
      "pageNo": 1,
      "pageSize": 10000
    }

    const res = await WXAPI.qryTradeAppointList(postData)
  
    this.setData({
      appointList: res.data.rows
    })

  },
  /**
  * 取消预约
  */
  async cancelTradeAppoint(tradeId) {
    var postData = {
      "tradeId": tradeId
    }

    const res = await WXAPI.cancelTradeAppoint(postData)
    if (res.code === 0) {
      this.qryTradeAppointList()
      wx.showModal({
        title: '提示',
        content: '取消预约成功',
        showCancel: false,
        success(res) {
          
        }
      })

    }

  },
  //取消预约
  cancleAppoint(event) {
    console.log(event)
    var item = event.target.dataset.item
    this.cancelTradeAppoint(item.tradeId)
  },
  //补充资料
  furtherInformation(event) {
    var item = event.target.dataset.item
    wx.navigateTo({
      url: './upload?tradeId='+item.tradeId,
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


})