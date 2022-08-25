const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
   showTip:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var flag=wx.getStorageSync('orderFlag')
    if(flag){
      this.setData({
        showTip:false
      })
    }
    this.getOrderById(options.id)

  },
  async getOrderById(id) {

   
    const res = await WXAPI.getOrderById(id,0)
    if(res.code == 0){
      this.setData({
        order:res.data
      })
     
        this.queryUserInfo(res.data.patientId)
    }

   
  },
  async queryUserInfo(userId) {

   
    const res = await WXAPI.queryUserInfo(userId)
    if(res.code == 0){
      this.setData({
        patient:res.data.user
      })
    }

   
  },
  cancelTip(){
    wx.setStorageSync('orderFlag', '1')
    this.setData({
      showTip:false
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})