
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList1: [],
    userId: '',
    diagnosis:'',
    btnText: '上传',
    loading: false,
    disabled: false,
    success: false,
    taskInfo:{}, 
    planTaskDetail:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.userId && options.taskInfo) {
      this.setData({  
        taskInfo:JSON.parse(options.taskInfo),
      })
      if(this.data.taskInfo.planType == 'Exam'){
        //检验
        wx.setNavigationBarTitle({
          title: '上传检验单',
        })
      }else if(this.data.taskInfo.planType == 'Check'){
        //检查
        wx.setNavigationBarTitle({
          title: '上传检查单',
        })
      }
      this.queryHealthPlanTask(this.data.taskInfo.planId,this.data.taskInfo.taskId,this.data.taskInfo.userId)

    } else {
      wx.showToast({
        title: '参数为空',
        icon: "none"
      })
      
      return
    }

  },
  //获取任务详情
  async queryHealthPlanTask(planId,taskId,userId) {

    const res = await WXAPI.queryHealthPlanTask(planId,taskId,userId)
    if (res.data) {

      this.setData({
        planTaskDetail:res.data
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
  selectDate() {

  },
  
  afterRead(event) {
    console.log(event.detail)
   var file = event.detail.file;
    const fileList = this.data.fileList1;


    this.setData({ fileList1: fileList.concat(file) });
    console.log(this.data.fileList1)
  },

  oversize() {
    wx.showToast({ title: '文件超出大小限制', icon: 'none' });
  },

  delete(event) {
    const { index, name } = event.detail;
    const fileList = this.data[`fileList${name}`];
    fileList.splice(index, 1);
    this.setData({ [`fileList${name}`]: fileList });
  },

  checkNull() {
    if (this.data.fileList1.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请添加图片',
      })
      return false
    }
    return true
  },

 //防抖动
 debounced:false,

 uploadAll() {
   let that=this
     if(that.debounced){
         return
     }
     that.debounced=true
   setTimeout(()=>{
       that.debounced=false
   }, 3000 )
    if (this.data.success) {
      //已上传成功
      wx.navigateBack({

        delta: 1

      })
      return
    }
    if (!this.checkNull()) {
      return
    }
    this.setData({
      loading: true,
    })


    const uploadTasks = this.data.fileList1.map((file) => this.uploadImgFile(file.url));
    Promise.all(uploadTasks)
      .then(data => {

        const healthImagesVoList = []
        data.map((file) => {
          var fileInfo = {
            fileId: file.id,
            fileUrl: file.fileLinkUrl,
            previewFileId: file.previewFileId,
            previewFileUrl: file.previewUrl
          }
          healthImagesVoList.push(fileInfo)
        })
        this.setData({
          healthImagesVoList:healthImagesVoList
        })
      
        this.outHospitalVisitsDataUpload()
      })
      .catch(e => {
        wx.showToast({ title: '上传失败,请重试', icon: 'error' });
        this.setData({
          loading: false,
        })
        console.log(e);
      });



  },
  async uploadImgFile(filePath) {
    return await WXAPI.uploadImgFile(filePath, "DEFAULT")
  },
  async outHospitalVisitsDataUpload() {
    let that=this
    this.setData({
      visitTime: Util.formatTime2(new Date()),
    })
    var postData = {
      "dept": '-',
      "diagnosis": this.data.diagnosis,
      "healthImagesVoList": this.data.healthImagesVoList,
      "hospital": '-',
      "userGoodsId": this.data.planTaskDetail.goodsId,
      "userId": this.data.taskInfo.userId,
      "visitTime": this.data.visitTime,
      "visitType": this.data.taskInfo.planType,
    }
    console.log("postdata", postData)
    WXAPI.outHospitalVisitsDataUpload(postData).then(res => {
      if (res.code == 0) {
        
         that.submit()
      
   
       
      }
    }).catch(e => {
      wx.showToast({ title: '上传失败,请重试', icon: "none" });
      this.setData({
        loading: false,
      })
      console.log(e);

    });



  },
  async submit() {
    let that=this
    var postData = {

      "contentId": this.data.taskInfo.contentId,
      "goodsId": this.data.planTaskDetail.goodsId,
      "examType": this.data.taskInfo.planDescribe,
      "examName": this.data.taskInfo.planDescribe,
      "healthImages": this.data.healthImagesVoList,
      "userId": this.taskInfo.userId,

    }
    console.log("postdata", postData)
    var res;
    if(this.data.taskInfo.planType == 'Exam'){
       res= await WXAPI.submitExam(postData)
    }else if(this.data.taskInfo.planType == 'Check'){
       res= await WXAPI.submitCheck(postData)
    }
   

    if(res.code==0){
     this.updateUnfinishedTaskStatus( this.data.taskInfo.contentId)
     wx.showModal({
      title: '提示',
      content: '上传成功！',
      showCancel:false,
      success (res) {
        if (res.confirm) {
         wx.redirectTo({
           url: 'recordList?userId='+that.data.userId,
         })
        } 
      }
    })
    that.setData({
      loading: false,
      success: true,
      disabled: true,
      btnText: '上传成功，点击返回',
    })
    }

  },
//更新内容成已完成
async updateUnfinishedTaskStatus(contentId) {
  await WXAPI.updateUnfinishedTaskStatus(contentId)
},
})