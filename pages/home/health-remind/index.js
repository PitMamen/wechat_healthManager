const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentData: {},
    doctor: {},
    patientName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    console.log(options)
  
    
    if(options.planType=='Evaluate'){
        wx.setNavigationBarTitle({
          title: '健康评估',
        })
        this.queryEvaluateContent(options.contentId, options.userId)
    }else if(options.planType=='Remind'){
      wx.setNavigationBarTitle({
        title: '健康提醒',
      })
      this.queryRemindContent(options.contentId, options.userId)
    }
  },
  
  async queryRemindContent(contentId, userId) {

    const res = await WXAPI.queryHealthPlanContent(contentId, "Remind", userId)
    if (res.data) {

      this.setData({
        content: res.data.remindContent,
        createTime:res.data.createTime
      })
      this.doctorDetailQuery(res.data.remindUser)
      this.updateUnfinishedTaskStatus(contentId)
    }
  },

    async queryEvaluateContent(contentId, userId) {

      const res = await WXAPI.queryHealthPlanContent(contentId, "Evaluate", userId)
      if (res.data) {
  
        this.setData({
          content: res.data.evalContent,
          createTime:res.data.evalTime
        })
        this.doctorDetailQuery(res.data.evalUser)
        this.updateUnfinishedTaskStatus(contentId)
      }
    },
      //获取医生信息
  async doctorDetailQuery(doctorId) {

    var postData1 = [doctorId]
    const docRes = await WXAPI.queryDoctorAndCaseManagerByUserIds(postData1)
    if (docRes.code == 0) {
      this.setData({
        doctor: docRes.data[0]
      })
    }

  },
//更新内容成已完成
async updateUnfinishedTaskStatus(contentId) {
  await WXAPI.updateUnfinishedTaskStatus(contentId)
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