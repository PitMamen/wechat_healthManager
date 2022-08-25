const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskList: [1, 1, 1, 1],
    planId: '',
    healthPlan: {},
    taskList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var defaultPatient = wx.getStorageSync('defaultPatient')
    defaultPatient.phone = defaultPatient.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    this.setData({
      planId: options.planId,
      userInfo: wx.getStorageSync('userInfo').account,
      defaultPatient: defaultPatient
    })
    this.queryHealthPlan(this.data.planId)
  },

  async queryHealthPlan(planId) {

    const res = await WXAPI.queryHealthPlanTaskList(planId)
    if (res.data) {
      // this.setData({
      //   healthPlan:res.data
      // })
       const arr= this.mapTaskList(res.data)

      this.setData({
        taskList: arr
      })


    }
  },

  //按时间分组 并计算状态
  mapTaskList(arr) {

    var nowTime = Date.parse(new Date());
    arr.forEach(item => {
      // var execTime = Date.parse(new Date(item.execTime));
      //1：已完成 0：未完成 2:未启动     
      if (nowTime < item.exec_time) {
        item.execFlag = 2
      } else {
        var noFinished = false
        item.taskInfo.forEach(task => {
          if (task.execFlag == 0) {
            noFinished = true
            return
          }
        })
        item.execFlag = noFinished ? 0 : 1
      }
    })

    return arr;
  },
  //获取医生信息
  async doctorDetailQuery(doctorId) {

    var postData1 = [doctorId]
    const docRes = await WXAPI.doctorInfoQuery(postData1)
    if (docRes.code == 0) {
      this.setData({
        doctor: docRes.data[0]
      })
    }

  },

  goTaskDetailPage(event) {
    var planid = event.currentTarget.dataset.planid
    var taskid = event.currentTarget.dataset.taskid
    var userid = event.currentTarget.dataset.userid
    var taskname = event.currentTarget.dataset.taskname

    
    wx.navigateTo({
      url: './task-detail?planId='+planid+'&taskId='+taskid+'&userId='+userid+'&taskname='+taskname,
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