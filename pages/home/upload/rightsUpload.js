
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    upload1:{
      visitType:'BQJJ',//病情简介
      fileList: [],
    },
    upload2:{
      visitType:'HYJG',//化验结果
      fileList: [],
    },
    upload3:{
      visitType:'XG',//X光
      fileList: [],
    },
    upload4:{
      visitType:'CT',//CT
      fileList: [],
    },
    upload5:{
      visitType:'MRI',//MRI
      fileList: [],
    },

    userId: '',
    tradeId:'',
    checkFlag:-1,//0审核未通过 1通过
    checkInfo:'',//审核信息
    diagnosis:'',
    btnText: '上传',
    loading: false,
    disabled: false,
    success: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.userId || options.tradeId) {
      this.setData({  
        userId: options.userId,  
        tradeId: options.tradeId,  
        CaseManagerName: options.CaseManagerName,  
        checkFlag:Number(options.checkFlag) ,
        checkInfo:options.checkInfo
      })
    } else {
      wx.showToast({
        title: '参数为空',
        icon: "none"
      })
      
      return
    }
    this.setData({
      visitTime: Util.formatTime2(new Date()),
    })
    this.queryUserInfo(this.data.userId)
    this.qryUserLocalVisit()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //如何拍摄
  goContentPage(){
    this.qrySysKnowledgeAnswer()
  },
    //按关键字查询问题答案列表
    async qrySysKnowledgeAnswer() {
      var postData = {
          "knowledgeType": 'CZZN',
          "keyWord": '如何拍摄检查照片',
      }

      const res = await WXAPI.qrySysKnowledgeAnswer(postData)
      if (res.data && res.data.length > 0) {
        var atc=res.data[0]
        wx.navigateTo({
          url: '/pages/me/content/index?contentId='+atc.id,
        })
      }else{
        wx.showToast({
          title: '未找到如何拍摄教程',
          icon: 'none',
          duration: 2000
          })
      }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  async queryUserInfo(userId) {

   
    const res = await WXAPI.queryUserInfo(userId)
    if(res.code == 0){
      this.setData({
        defaultPatient:res.data.user
      })
    }

   
  },
  //添加图片
  afterRead(event) {
    console.log(event)
    const { file, name } = event.detail;

   let that=this
    const uploadTasks =file.map((file) => this.uploadImgFile(file.url));
    Promise.all(uploadTasks)
    .then(data => {

      const healthImagesVoList = []
      data.map((file) => {
        var fileInfo = {
          fileId: file.id,
          fileUrl: file.fileLinkUrl,
          url: file.fileLinkUrl,
          previewFileId: file.previewFileId,
          previewFileUrl: file.previewUrl
        }
        healthImagesVoList.push(fileInfo)
      })
      var upload = that.data[`upload${name}`];
      upload.fileList=upload.fileList.concat(healthImagesVoList)
      that.setData({ [`upload${name}`]: upload });
    })
    .catch(e => {
      wx.showToast({ title: '上传失败,请重试', icon: 'none' });
   
      console.log(e);

    });
  },

  //删除图片
  delete(event) {
    console.log(event)
    const { index, name } = event.detail;
    var upload = this.data[`upload${name}`];
    upload.fileList.splice(index, 1);
    this.setData({ [`upload${name}`]: upload });
  },

  checkNull() {
    if (this.data.upload1.fileList.length === 0) {
      wx.showToast({
        icon: "none",
        title: '请添加病情简介图片',
      })
      return false
    }
    if (this.data.upload2.fileList.length === 0) {
      wx.showToast({
        icon: "none",
        title: '请添加化验结果图片',
      })
      return false
    }
    return true
  },

   //获取记录
   async qryUserLocalVisit() {

    var postdata = {
      userId: this.data.userId,
      contentId: this.data.tradeId
    }

    const res = await WXAPI.qryUserLocalVisit(postdata)
    if (res.data && res.data.length > 0) {
      

      res.data.forEach(item=>{
        item.healthImagesList.forEach(pic=>{
          pic.type="image"
          pic.url=pic.fileUrl
        })
        if(item.visitType === 'BQJJ'){        
          var upload=this.data.upload1     
          upload.fileList=item.healthImagesList
          this.setData({
            upload1:upload
          })
        }else if(item.visitType === 'HYJG'){        
          var upload=this.data.upload2
          upload.fileList=item.healthImagesList
          this.setData({
            upload2:upload
          })
        }else if(item.visitType === 'XG'){        
          var upload=this.data.upload3
          upload.fileList=item.healthImagesList
          this.setData({
            upload3:upload
          })
        }else if(item.visitType === 'CT'){        
          var upload=this.data.upload4
          upload.fileList=item.healthImagesList
          this.setData({
            upload4:upload
          })
        }else if(item.visitType === 'MRI'){        
          var upload=this.data.upload5
          upload.fileList=item.healthImagesList
          this.setData({
            upload5:upload
          })
        }
      })
     
    }

  },

uploadSuccess(){
  if(this.data.checkFlag === 0){
    wx.navigateTo({
      url: '../rights/success?title=' + '重症会诊资料修改成功！' + '&des=' + '您的申请已提交到您专属的个案管理师[' + this.data.CaseManagerName +']，稍后个案管理师会尽快处理，请留意消息。',
    })
  }else{
    wx.navigateTo({
      url: '../rights/success?title=' + '重症会诊申请成功！' + '&des='+ '您的申请已提交到您专属的个案管理师[' + this.data.CaseManagerName +']，稍后个案管理师会尽快处理，请留意消息。',
    })
  }
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
     this.uploadSuccess()
      
      return
    }
    if (!this.checkNull()) {
      return
    }
    this.setData({
      loading: true,
    })


    var promiseArr=[]


    //上传  此处需要根据业务类型改变次数
    for(var i=0;i<5;i++){
      const upload = this.data[`upload${i+1}`];
      console.log(upload)
      if(upload.fileList.length>0){
        // const uploadTasks =upload.fileList.map((file) => this.uploadImgFile(file.url));
        var promise= this.outVisitsDataUpload(upload)
        promiseArr.push(promise)
      }
    }

     Promise.all(promiseArr).then(function (data) {    
      that.uploadSuccess()
    that.setData({
        
      loading: false,
      success: true,
      disabled: true,
      btnText: '上传成功，点击返回',
    })
}).catch(function (e){
    //catch方法将会被执行，输出结果为：2
    console.log("报错",e);
    wx.showToast({ title: '上传失败,请重试', icon: 'none' });
    that.setData({
      loading: false,
    })
});

},
  
  async uploadImgFile(filePath) {
    return await WXAPI.uploadImgFile(filePath, "DEFAULT")
  },
  async outVisitsDataUpload(upload) {
      var postData = {
        "contentId":this.data.tradeId,//权益申请的id  tradId
        "dept": '-',
        "diagnosis": this.data.diagnosis,
        "healthImagesVoList": upload.fileList,
        "hospital": '-',
        "userGoodsId": '1',
        "userId": this.data.defaultPatient.userId,
        "visitTime": this.data.visitTime,
        "visitType":  upload.visitType,
      }
      console.log("postdata", postData)
    return  WXAPI.outVisitsDataUpload(postData)
   

  },
  
 

})