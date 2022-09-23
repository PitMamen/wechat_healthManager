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
    this.queryHealthPlanList(this.data.defaultPatient.userId)
 
  },
    //获取健康管理列表
    async queryHealthPlanList(userId) {
      const res = await WXAPI.queryHealthPlanList(userId)
      if (res.code !== 0) {
        wx.showToast({
          icon: "none",
          title: res.message,
          duration: 2000
        })
        return
      }
      var timestamp = Date.parse(new Date());
      if (res.data && res.data.length > 0) {
        res.data.forEach(item=>{
         if(item.endTime>timestamp){
           item.status=1
           item.statusText='进行中'
         }else{
          item.status=2
          item.statusText='已结束'
         }
          
        })
        this.setData({
          planList: res.data,
        })
      } else {
        this.setData({
          planList: [],       
        })
      }
  
      
    },
  goPlanDetailPage(event){
    var planid = event.currentTarget.dataset.planid
    wx.navigateTo({
      url: './plan-detail?planId=' + planid,
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