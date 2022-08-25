const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
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
    var technologyAppointInfo =getApp().technologyAppointInfo

    this.setData({
      reqImagesList:technologyAppointInfo.reqImages ? technologyAppointInfo.reqImages.split(",") : null,
      info:technologyAppointInfo
    })

  },
  apply(){
    this.saveTradeAppoint(this.data.info) 
  },
  /**
     * 床位预约
     */
    async saveTradeAppoint(postData) {
      
      const res = await WXAPI.saveTradeAppoint(postData)
  
     if(res.code === 0){
      wx.redirectTo({
        url: './success',
      })
     }

  
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