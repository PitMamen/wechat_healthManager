
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tradeAppoint:{},
    fileList1: [],
    tradeId: '',
    diagnosis:'',
    btnText: '确认提交',
    loading: false,
    disabled: false,
    success: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.tradeId) {
      this.setData({  
        tradeId: options.tradeId,  
      })
    } else {
      wx.showToast({
        title: '参数为空',
        icon: "none"
      })
      
      return
    }
    this.qryTradeAppointList()
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
      * 预约工单查询
      */
     async qryTradeAppointList() {
      var postData = {
        "tradeId":this.data.tradeId,
        "pageNo": 1,
        "pageSize": 100
      }
  
      const res = await WXAPI.qryTradeAppointList(postData)

      this.setData({
        tradeAppoint: res.data.rows[0]
      })
  
      var steps = []
      res.data.rows[0].tradeAppointLog.forEach(element => {
        steps.push({
          text: Util.formatTime(new Date(element.createTime)),
          desc: element.dealType,
        })
      });
      this.setData({
        steps: steps
      })

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
    if(!this.data.diagnosis){
      wx.showToast({
        icon: "none",
        title: '请添加描述',
      })
      return false
    }
    return true
  },

  uploadBtn() {
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

        var healthImagesVoList = ''
        data.map((file) => {
          // var fileInfo = {
          //   fileId: file.id,
          //   fileUrl: file.fileLinkUrl,
          //   previewFileId: file.previewFileId,
          //   previewFileUrl: file.previewUrl
          // }
          healthImagesVoList=healthImagesVoList+file.fileLinkUrl+','
        })
        healthImagesVoList = healthImagesVoList.substr(0, healthImagesVoList.length - 1);  
        var postData = {
          "dealImages": healthImagesVoList,
          dealDetail:'补充资料',
          dealResult:'补充资料',
          "dealType": '补充资料',
          "dealUser": this.data.tradeAppoint.userInfo.userId,
          "dealUserName": this.data.tradeAppoint.userInfo.userName,
          "remark": this.data.diagnosis,
          "tradeId": this.data.tradeId,
         
        }
        console.log("postdata", postData)
        this.saveTradeAppointLog(postData)
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
  async saveTradeAppointLog(data) {
    let that=this
    WXAPI.saveTradeAppointLog(data).then(res => {
      if (res.code == 0) {
        wx.showModal({
          title: '提示',
          content: '上传成功！',
          showCancel:false,
          success (res) {
            if (res.confirm) {
              wx.navigateBack({

                delta: 1
        
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
    }).catch(e => {
      wx.showToast({ title: '上传失败,请重试', icon: "none" });
      this.setData({
        loading: false,
      })
      console.log(e);

    });



  },

})