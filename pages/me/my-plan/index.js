// pages/me/my-plan/index.js
const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planList:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      defaultPatient:getApp().getDefaultPatient()
    })
    this.qryMyFollow()
 
  },
    //获取健康管理列表
    async qryMyFollow() {
      const res = await WXAPI.qryMyFollow({userId:this.data.defaultPatient.userId})
      if (res.code==0) {
        this.setData({
            planList: res.data,
          })
      }
  
      
    },
  goPlanDetailPage(event){
    var item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: './plan-detail-v2?planId=' + item.planId+'&followMetaDataId=' +item.followMetaDataId +'&userId=' + item.userId+'&planName='+item.planName+'&statusStr='+item.statusStr
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