const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
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
      planTaskDetailId:options.planTaskDetailId,
      planName:options.planName,
    })

    var defaultPatient =getApp().getDefaultPatient()
    defaultPatient.phone = defaultPatient.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    this.setData({
      planId: options.planId,
      userInfo: wx.getStorageSync('userInfo').account,
      defaultPatient: defaultPatient
    })

   
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  this.qryMyFollowDetail()
},
  async qryMyFollowDetail() {
    var postdata={
        planId: this.data.planId,
        planTaskDetailId: this.data.planTaskDetailId,    
        userId: this.data.userId
      }
    const res = await WXAPI.qryMyFollowDetail(postdata)
    if (res.data) {
        res.data.forEach(item=>{
            item.executeTime2= item.executeTime.substring(0,10) 
        })
      this.setData({
        taskDetail:res.data
      })

    }
  },


  onTaskItemClick(e) {
    var task = e.currentTarget.dataset.item
    //1:问卷收集2:健康宣教3:消息提醒
    var type = task.taskType.value
    //1未执行 2成功 3失败
    if(task.taskBizStatus.value==17){
      wx.showToast({
        icon:"none",
        title: '等待开启'
      })
      return
    }else{
        if (type == 1) {//问卷
            var url = task.jumpValue
            if(task.taskBizStatus.value==2){
                url = task.jumpValue + '?userId=' + task.userId + '&recordId=' +task.id+'&modifyTaskBizStatus=yes'
                url= url.replace("/s/","/r/")　
            }else{
                url= url.replace("/r/","/s/")　
            }
        
           this.goWenjuanPage(url)
          }else if (type == 2) {//文章
            // wx.navigateTo({
            //   url: '/pages/home/news/news-detail?id=' + task.jumpId
            // })
            this.goWenjuanPage(task.jumpValue)
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