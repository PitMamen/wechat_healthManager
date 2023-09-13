const WXAPI = require('../../../../static/apifm-wxapi/index')
const Util = require('../../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskDetail:{},
    planId:'',
    userId:'',
    taskId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      planId:options.planId,
      userId:options.userId,
      taskId:options.taskId,
      taskname:options.taskname,
    })



   
  },
  async queryHealthPlanTask(planId,taskId,userId) {

    const res = await WXAPI.queryHealthPlanTask(planId,taskId,userId)
    if (res.data) {
      var nowTime = Date.parse(new Date());
      res.data.userPlanDetails.forEach(item => {
        if (nowTime < item.execTime) {
          item.execFlag = 2
        }
      })

      this.setData({
        taskDetail:res.data
      })

      wx.setNavigationBarTitle({
        title: res.data.planName,
      })
    }
  },


  onTaskItemClick(e) {
    var task = e.currentTarget.dataset.item
    var type = task.planType

    if(task.execFlag==2){
      wx.showToast({
        icon:"none",
        title: '等待开启'
      })
      return
    }


    if (type == 'Exam') {//检验单
      if(task.execFlag==0){
        wx.navigateTo({
          url: '/pages/home/upload/jy-record?userId=' + this.data.userId+'&planDescribe='+task.planDescribe+'&contentId='+task.contentId+'&goodsId='+this.data.taskDetail.goodsId+'&planId='+task.planId+'&id='+task.id,
        })
      }
    } else if (type == 'Check') {//检查单
      if(task.execFlag==0){
        wx.navigateTo({
          url: '/pages/home/upload/yc-record?userId=' + this.data.userId+'&planDescribe='+task.planDescribe+'&contentId='+task.contentId+'&goodsId='+this.data.taskDetail.goodsId+'&planId='+task.planId+'&id='+task.id,
        })
      }


    } else if (type == 'Quest') {//问卷
      var groupId = this.data.taskDetail.goodsId + this.data.taskDetail.owner + this.data.userId
      var url = task.contentInfo.questUrl + '?userId=' + this.data.userId + '&groupId=' + groupId + '&contentId=' + task.contentId + '&execTime=' +Util.formatTime2(new Date())+  '&title=' + task.planDescribe
      // var url = task.contentInfo.questUrl + '?userId=' + this.data.userId + '&execTime=' + Util.formatTime2(new Date())
     if(task.execFlag==0){//未完成
      url= url.replace("/r/","/s/")　
     }
     console.log(url)
      var encodeUrl = encodeURIComponent(url)
      console.log(encodeUrl)
      wx.navigateTo({
        url: '/pages/home/webpage/index?url=' + encodeUrl
      })
    }else if (type == 'Knowledge') {//文章
      wx.navigateTo({
        url: '/pages/home/news/news-detail?id=' + task.contentInfo.articleId
      })
      if (task.execFlag == 0) {
        this.updateUnfinishedTaskStatus(task.contentId)
      }
    } else if (type == 'Remind') {//消息
      wx.navigateTo({
        url: '/pages/home/health-remind/index?userId=' + this.data.userId+'&contentId='+task.contentId+'&planType='+task.planType,
      })

    }else if (type == 'Evaluate') {//评估
      wx.navigateTo({
        url: '/pages/home/evaluate/index?userId=' + this.data.userId+'&contentId='+task.contentId,
      })

    }else if (type == 'Rdiagnosis' || type == 'Ddiagnosis') {//复诊提醒 用药提醒
        this.updateUnfinishedTaskStatus(task.contentId)
        wx.showToast({
          title: '已完成',
        })
        this.onShow()
    }
  },

  //内容详情
  async queryHealthPlanContent(item) {
    var goodsId = item.goodsId
    var owner = item.owner

    const res = await WXAPI.queryHealthPlanContent(item.contentId, item.planType, this.data.userId)
    if (res.data) {

      var planType = item.planType
      if (planType === 'Quest') {//问卷   问卷需要提交之后由后台设置已完成状态
        var groupId = goodsId + owner + this.data.defaultPatient.userId
        var url = res.data.questUrl + '?userId=' + this.data.defaultPatient.userId + '&groupId=' + groupId + '&contentId=' + item.contentId + '&execTime=' + item.execTime + '&title=' + item.questName
        this.goWenjuanPage(url)
      } else if (planType === 'Knowledge') {//健康宣教

        wx.navigateTo({
          url: './news/news-detail?id=' + res.data.articleId
        })

        if (item.execFlag !== 1) {
          this.updateUnfinishedTaskStatus(item.contentId)
        }
      }
  



    }
  },
//更新内容成已完成
async updateUnfinishedTaskStatus(contentId) {
  await WXAPI.updateUnfinishedTaskStatus(contentId)
},

 //图片预览
 toDetailsTap: function (e) {
  var url = e.currentTarget.dataset.url
  var healthImagesList = e.currentTarget.dataset.item
  console.log(healthImagesList)
  var list=[]
  healthImagesList.forEach(item=>{
    list.push(item.fileUrl)
  })
  wx.previewImage({
    urls: list,
    current: url
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
    this.queryHealthPlanTask(this.data.planId,this.data.taskId,this.data.userId)
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