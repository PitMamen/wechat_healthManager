const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentData: {},
    doctor: {},
    patientName: '',
    userId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    console.log(options)
    this.followhistoryDetail(options.taskId)
  },
  
  async followhistoryDetail(taskId) {

    const res = await WXAPI.followhistoryDetail(taskId)
    if (res.data) {

      this.setData({
        content: res.data.contentText
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