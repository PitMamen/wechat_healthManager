const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    content:'',
    showbtn:false,//是否隐藏按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title:options.title,
      type:options.type,
      showbtn:options.showbtn
    })



   if (this.data.type == '1') {
     //购买授权协议
    this.getAgreementContent('P003')
   }else  if (this.data.type == '2') {
    //用户协议
    this.getAgreementContent('P001')
  }else  if (this.data.type == '3') {
    //隐私政策
    this.getAgreementContent('P002')
  }else  if (this.data.type == '5') {
    //关于我们
    this.getAgreementContent('P005')
  }

  },

  async getAgreementContent(id) {
    const res = await WXAPI.getAgreementContent(id)

    if(res.code==0){
      this.setData({
        content: res.data[0].content
      })
      wx.setNavigationBarTitle({
        title: res.data[0].categoryName
        })
    }

    
  },


  confirm(){
    if (this.data.type == '1') {
      //购买服务知情同意书
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2] // 上一页// 调用上一个页面的setData 方法，将数据存储
      prevPage.setData({
        checked: true,
      })
    }


    wx.navigateBack({
      delta: 1,
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