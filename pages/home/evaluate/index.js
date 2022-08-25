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
if (options.msgDetailId) {//知道评估ID
      this.getUserEevaluate(options.msgDetailId)
    }else {//从计划  知道任务id
      this.queryHealthPlanContent(options.contentId, options.userId)
    }




  },
  //通过id获取评估详情
  async getUserEevaluate(id) {
    const res = await WXAPI.getUserEevaluate(id)
    if (res.data) {

      this.setData({
        contentData: res.data
      })

      this.queryUserInfo(res.data.evalUser)

    }
  },
  //通过任务id获取任务详情
  async queryHealthPlanContent(contentId, userId) {

    const res = await WXAPI.queryHealthPlanContent(contentId, "Evaluate", userId)
    if (res.data) {
      this.setData({
        contentData: res.data
      })

      this.queryUserInfo(res.data.evalUser)
      this.updateUnfinishedTaskStatus(contentId)

    }
  },
  //获取医生信息
  async queryUserInfo(doctorId) {

    //获取医生信息
    var postData1 = [Number(doctorId) ]
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