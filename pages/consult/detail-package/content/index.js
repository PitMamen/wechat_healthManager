const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({
  /**
   * 问题答案页面
   */
  data: {
    contentId:'',
    content:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      contentId:options.contentId
    })
this.getSysKnowledgeById(options.contentId) 


  },
   //查询问题答案详情
   async getSysKnowledgeById(id) {
    const res = await WXAPI.getSysKnowledgeById(id)
    if (res.data && res.data.content) {
      
        wx.setNavigationBarTitle({
          title:  res.data.title,
        })
        this.setData({
          content: res.data.content
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})