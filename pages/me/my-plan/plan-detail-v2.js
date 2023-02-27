const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskDetail:{},
    longTaskList:[],
    shortTaskList:[],
    planId:'',
    userId:'',
    followMetaDataId:'',
    planName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      planId:options.planId,
      userId:options.userId,
      followMetaDataId:options.followMetaDataId,
      planName:options.planName,
      statusStr:options.statusStr
    })

    // var defaultPatient =getApp().getDefaultPatient()
    // defaultPatient.phone = defaultPatient.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')

   
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  this.getFollowUserPlanPhoneList()
},
  async getFollowUserPlanPhoneList() {
    var postdata={
        planId: this.data.planId,
        userId: this.data.userId,
        followMetaDataId:Number(this.data.followMetaDataId) ,
        pageNo: 1,    
        pageSize:9999
      }
    const res = await WXAPI.getFollowUserPlanPhoneList(postdata)
   var longTaskList=[]
    var shortTaskList=[]
    if (res.data && res.data.records ) {
        res.data.records.forEach(item=>{
           
            // item.messageType.description=item.messageType.description.replace('消息','')
            // item.messageType.description=item.messageType.description.replace('回访','')

            //状态1:未执行2长期任务执行中3:完成4:取消5:终止
            if(item.status.value ==2){
                item.status.description='未完成'
            }
           if(item.taskExecType.value ==1){
            shortTaskList.push(item)          
           }else{
            longTaskList.push(item) 
           }
        })
    }
    this.setData({
        longTaskList:longTaskList,
        shortTaskList:shortTaskList
      })
  },


  onTaskItemClick(e) {
    var task = e.currentTarget.dataset.item
    //1:问卷收集2:健康宣教3:消息提醒
    var type = task.taskType.value
   //状态1:未执行2长期任务执行中3:完成4:取消5:终止
    if(task.status.value==1){
      wx.showToast({
        icon:"none",
        title: '等待开启'
      })
      return
    }else if(task.status.value==4){
        wx.showToast({
          icon:"none",
          title: '该任务已取消'
        })
        return
      }else if(task.status.value==5){
        wx.showToast({
          icon:"none",
          title: '该任务已终止'
        })
        return
      }else{
        if (type == 1) {//问卷
            var url = task.jumpValue
            if(task.status.value==2){
                url = task.jumpValue + '?userId=' + task.userId + '&recordId=' +task.id+'&modifyTaskBizStatus=yes'
                url= url.replace("/s/","/r/")　
            }else{
                url= url.replace("/r/","/s/")　
            }
        
           this.goWenjuanPage(url)
          }else if (type == 2) {//文章
            wx.navigateTo({
              url: '/pages/home/news/news-detail?id=' + task.jumpId
            })
            // this.goWenjuanPage(task.jumpValue)
          } else if (type == 3) {//消息
            wx.navigateTo({
              url: '/pages/home/health-remind/detail?userId=' + this.data.userId+'&taskId='+task.id,
            })
      
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
  //问卷
  goWenjuanPage(url) {

    var encodeUrl = encodeURIComponent(url)
    console.log(encodeUrl)
    wx.navigateTo({
        url: '../../home/webpage/index?url=' + encodeUrl
    })
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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