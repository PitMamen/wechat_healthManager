// pages/me/bed/input.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    yblx:'',
    hideLXShow:true,
    nameColumns:['湖南省医保','长沙市医保','湖南省城乡居民医保（原新农合）','省内异地医保','跨省医保','长沙县医保（含职工与居民）','浏阳市医保（含职工与居民）']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      phone:getApp().bedApplyInfo.patient.phone
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
  bindLXTap(){
    this.setData({
      hideLXShow:false
    })
  },
  closeLXTap(){
    this.setData({
      hideLXShow:true
    })
  },
  onLXConfirm(event){
    console.log(event)
    var value = event.detail.value
    this.setData({
      yblx:value,
      hideLXShow:true
    })
  },
  confrim(){
    if(!this.data.yblx){
      wx.showToast({
        title: '请选择医保类型',
        icon: 'none',
        duration: 2000
        })
        return
    }
    if(!this.data.phone){
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none',
        duration: 2000
        })
        return
    }
    getApp().bedApplyInfo.patient.phone=this.data.phone
    getApp().bedApplyInfo.patient.yblx=this.data.yblx
    wx.navigateTo({
      url: './apply',
    })
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