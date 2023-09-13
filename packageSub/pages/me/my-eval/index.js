
const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planList:[],
    defaultPatient:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      defaultPatient: getApp().getDefaultPatient()
    })
    this.qryUserEvaluateList()
 
  },

    async qryUserEvaluateList() {
      var data={
        userId:this.data.defaultPatient.userId
      }
      const res = await WXAPI.qryUserEvaluateList(data)

      if (res.data && res.data.length > 0) {
        this.setData({
          planList: res.data,
        })
      }
      
    },
    goDetailPage(event){
    var msgDetailId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../home/evaluate/index?msgDetailId=' + msgDetailId,
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