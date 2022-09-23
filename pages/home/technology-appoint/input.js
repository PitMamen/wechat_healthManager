
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidePatientShow:true,
    hideVlueShow:true,
    fileList: [],
    yylx:['检查', '检验'],
    jcList:['CT'],
    jyList:['血清'],
    lxType:'',
    lxValue:'',
    hideLXShow:true,
    date:'',
    timeList:['08:30-09:30','09:30-10:30','10:30-11:30','11:30-12:00','14:30-15:30','15:30-16:30','16:30-15:30'],
    timeActive:0,
    diagnosis:'',
    btnText: '提交',
    loading: false,
    disabled: false,
    success: false,
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var endTime=this.formatTimeNext(new Date())
    var startTime=Util.formatTime2(new Date())
    console.log(startTime)
    this.setData({
        startTime:startTime,
        endTime:endTime,
        date:startTime
      })

      this.getDictList('Check')
      this.getDictList('Exam')

  },
   formatTimeNext (date)  {
    const year = date.getFullYear()+1
    const month = date.getMonth() + 1
    const day = date.getDate()
  
  
    return year+'-'+month+'-'+day
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      defaultPatient:this.data.defaultPatient?this.data.defaultPatient: getApp().getDefaultPatient(),
      patientList: wx.getStorageSync('userInfo').account.user,
     
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

    /**
      * 获取检查检验配置表
      */
     async getDictList(type) {
      var postData = {
        pageSize: 10000,
      start: 1,
      type: type
      }
  
      const res = await WXAPI.getDictList(postData)
    if(type === 'Exam'){
      this.setData({
        jyList:res.data.rows
      })
    }else if(type === 'Check')
      this.setData({
        jcList:res.data.rows
      })
  
    },

  onPatientPickerConfirm(event) {
    console.log(event)
    var index = event.detail.index
    var selectPatient = this.data.patientList[index]
    if (selectPatient.userId !== this.data.defaultPatient.userId) {
        this.setData({
            defaultPatient: this.data.patientList[index],
        });
    }
    this.setData({
        hidePatientShow: true
    });

},
onPatientPickerCancel() {
    wx.navigateTo({
        url: '/pages/me/patients/addPatient',
    })
},
bindPatientTap: function () {
    this.setData({
        hidePatientShow: false
    })
},
closePatientTap: function () {
    this.setData({
        hidePatientShow: true
    })
},
  bindLXTap() {
    this.setData({
      hideLXShow: false
    })
  },
  closeLXTap() {
    this.setData({
      hideLXShow: true
    })
  },
  
  onLXConfirm(event) {
    console.log(event)
    var value = event.detail.value
    if(value === this.data.lxType){
      this.setData({
        hideLXShow: true
      })
      return
    }else{
      this.setData({
        lxType: value ,
        lxValue:'',
        hideLXShow: true
      })
    }

  },
  bindValueTap() {
    this.setData({
      hideVlueShow: false
    })
  },
  closeValueTap() {
    this.setData({
      hideVlueShow: true
    })
  },
  onValueConfirm(event) {
    console.log(event)
    var value = event.detail.value
    this.setData({
      lxValue: value.name ,
      hideVlueShow: true
    })
  },
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  checkTimeTap:function(event){
    var index = event.currentTarget.dataset.index
    if(index !== this.data.timeActive){
      this.setData({
        timeActive: index
      })
     
    }
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
     
    var fileList=  that.data.fileList.concat(healthImagesVoList)
     
      that.setData({  fileList:   fileList });
    })
    .catch(e => {
      wx.showToast({ title: '上传失败,请重试', icon: 'error' });
   
      console.log(e);

    });
  },

  //删除图片
  delete(event) {
    console.log(event)
    const { index, name } = event.detail;
   
    this.data.fileList.splice(index, 1);
    this.setData({  fileList:    this.data.fileList });
  },

  checkNull() {
    if (this.data.defaultPatient.userId === 0) {
      wx.showToast({
        icon: "none",
        title: '请选择就诊人',
      })
      return false
    }
    if (this.data.lxType== '') {
      wx.showToast({
        icon: "none",
        title: '请选择预约类型',
      })
      return false
    }
    if (this.data.lxValue== '') {
      wx.showToast({
        icon: "none",
        title: '请选择预约项目',
      })
      return false
    }
    if (this.data.date== '') {
      wx.showToast({
        icon: "none",
        title: '请选择日期',
      })
      return false
    }
    if (this.data.fileList.length === 0) {
      wx.showToast({
        icon: "none",
        title: '请上传医生开具的检查申请单',
      })
      return false
    }

    return true
  },

   


  uploadBtn() {
    if(this.checkNull()){
     
      let fileUrlList=this.data.fileList.map(item => item.fileUrl).join(",");
      console.log(fileUrlList)
      const technologyAppointInfo={
        appointDate:this.data.date,
        appointTime:this.data.timeList[this.data.timeActive],
        reqImages:fileUrlList,
        status:0,
        tradeTypeCode:'lis',
        tradeType:'预约医技',
        appointItem:this.data.lxType == '检查'?'CHECK':'EXAM',
        appointItemName:this.data.lxValue,
        userId:this.data.defaultPatient.userId,
        userName:this.data.defaultPatient.userName
      }

      getApp().technologyAppointInfo=technologyAppointInfo

      wx.navigateTo({
        url: './apply',
      })
    }

},
  
  async uploadImgFile(filePath) {
    return await WXAPI.uploadImgFile(filePath, "DEFAULT")
  },



})