
const WXAPI = require('../../../static/apifm-wxapi/index')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '', sex: '', age: '',
    infoDetail: {},
    //文化程度
    whcdIndex: 0,
    whcdArray: ['博士', '硕士', '本科', '大专', '中专', '高中', '初中', '小学', '其他'],

    //婚姻状况
    hyzkmcIndex: 0,
    hyzkmcArray: ['未婚', '已婚', '丧偶', '离异', '其他'],

    //费用类型
    fylxIndex: 0,
    fylxArray: ['城镇职工医疗保险', '城镇居民医疗保险','新型农村合作医疗保险','商业医疗保险','大病统筹','公费医疗', '自费'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var defaultPatient = wx.getStorageSync('defaultPatient')
    this.setData({
      defaultPatient: defaultPatient,
    })
    this.qryPatientBaseInfo()
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
  //获取病人基本信息
  async qryPatientBaseInfo() {

    var requestData = { userId: this.data.defaultPatient.userId }
    const res = await WXAPI.qryPatientBaseInfo(requestData)
    if (res.code == 0) {
      this.setData({
        height: res.data.infoDetail.height,
        weight: res.data.infoDetail.weight,
        gzdwdz: res.data.infoDetail.gzdwdz,
        whcd: res.data.infoDetail.whcd,
        hyzkmc: res.data.infoDetail.hyzkmc,
        occupation: res.data.infoDetail.occupation,
        fylx: res.data.infoDetail.fylx
      })
      console.log(this.data.infoDetail)
    }
  },
  //文化程度
  bindWhcdPickerChange: function (e) {
    this.setData({
      whcdIndex: e.detail.value,
      whcd: this.data.whcdArray[e.detail.value]
    })

  },
  //婚姻状况
  bindHyzkmcPickerChange: function (e) {

    this.setData({
      hyzkmcIndex: e.detail.value,
      hyzkmc:this.data.hyzkmcArray[e.detail.value]
    })
  },
  //费用类型
  bindFylxPickerChange: function (e) {
    this.setData({
      fylxIndex: e.detail.value,
      fylx:this.data.fylxArray[e.detail.value]
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      visitTime: e.detail.value
    })
  },
  //变更
  async updatePatientBaseInfo(e) {

    var requestData =
    {
      userId: this.data.defaultPatient.userId,
      infoDetail: {
        height: this.data.height,
        weight: this.data.weight,
        gzdwdz: this.data.gzdwdz,
        whcd: this.data.whcd,
        hyzkmc: this.data.hyzkmc,
        occupation: this.data.occupation,
        fylx: this.data.fylx
      }
    }
    console.log(requestData)
    const res = await WXAPI.updatePatientBaseInfo(requestData)
    if (res.code == 0) {
      wx.showModal({
        title: '提示',
        content: '保存成功！',
        showCancel:false,
        success (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 0,
            })
          } 
        }
      })

    }
  },

  checkNull() {
    if (this.data.hospital.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请输入就诊医院',
      })
      return false
    }
    if (this.data.dept.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请输入就诊科室',
      })
      return false
    }
    if (this.data.visitTime.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请输入就诊时间',
      })
      return false
    }
    if (this.data.visitType.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请输入就诊类型',
      })
      return false
    }
    if (this.data.diagnosis.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请输入初步诊断结果',
      })
      return false
    }
    if (this.data.fileList1.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请上传文书',
      })
      return false
    }
    return true
  },


})