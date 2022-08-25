
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    visitType: 'Check',//检查单上传类型
    uploadTypeNum: 0,
    fileList1: [],
    fileList2: [],
    fileList3: [],
    fileList4: [],
    userId: '',
    diagnosis: '',
    btnText: '上传',
    loading: false,
    disabled: false,
    success: false,
    healthImagesVoList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.userId) {
      this.setData({
        id:options.id,
        planId: options.planId,
        userId: options.userId,
        planDescribe:options.planDescribe,
        contentId:options.contentId,
        goodsId:options.goodsId
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

  afterRead(event) {
    console.log(event.detail)
    const { index, name } = event.detail;
    var file = event.detail.file;
    const fileList = this.data[`fileList${name}`];


    this.setData({ [`fileList${name}`]: fileList.concat(file) });

  },

  delete(event) {
    const { index, name } = event.detail;
    const fileList = this.data[`fileList${name}`];
    fileList.splice(index, 1);
    this.setData({ [`fileList${name}`]: fileList });
  },



  checkNull() {
    if (this.data.fileList1.length == 0 ) {
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
    var postData = {
      "dept": '-',
      "diagnosis": this.data.diagnosis,
      "healthImagesVoList": this.data.healthImagesVoList,
      "hospital": '-',
      "userGoodsId": this.data.goodsId,
      "userId": this.data.userId,
      "visitTime": this.data.visitTime,
      "visitType": this.data.visitType,
    }
    console.log("postdata", postData)
    WXAPI.outHospitalVisitsDataUpload(postData).then(res => {
      if (res.code == 0) {
      
        this.submitCheck()
       
      }
    }).catch(e => {
      wx.showToast({ title: '上传失败,请重试', icon: "none" });
      this.setData({
        loading: false,
      })
      console.log(e);

    });



  },
  async submitCheck() {
    let that=this
    var postData = {
   
      "contentId": this.data.contentId,
      "goodsId": this.data.goodsId,
      "checkType": this.data.planDescribe,
      "checkName": this.data.planDescribe,
      "healthImages": this.data.healthImagesVoList,
      "userId": this.data.userId,

    }
    console.log("postdata", postData)
    const res= await WXAPI.submitCheck(postData)

    if(res.code==0){
     this.updateUnfinishedTaskStatus( this.data.contentId)
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