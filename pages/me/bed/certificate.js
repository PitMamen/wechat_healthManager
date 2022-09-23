// pages/me/my-plan/index.js
const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planList: null,
    hidePatientShow: true,
    nameColumns: [],
    defaultPatient: null,
    patientList: [],
    rightsList:[],
    noTipShow: false,
    chooseTipShow: false,
    chooseRight:{},//选择的权益服务
    chooseCert:{}//选择的住院证
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      defaultPatient: getApp().getDefaultPatient(),
      patientList: wx.getStorageSync('userInfo').account.user
    })
    var names = []
    this.data.patientList.forEach(item => {
      names.push(item.userName)
    })
    this.setData({
      nameColumns: names
    })
    this.getHospitalTreatCard()
 

  },
  //获取住院证
  async getHospitalTreatCard() {
    const res = await WXAPI.getHospitalTreatCard(this.data.defaultPatient.identificationNo, this.data.defaultPatient.userId, this.data.defaultPatient.userName)


    this.setData({
      planList: res.data,
    })



  },
  /**
     * 服务列表
     */
  async getPackageList(appointDeptId) {
    var postData = {
      "belong": appointDeptId,//科室
      "attrName": "appointBedNum",
      "status": 1,//上架
      "topFlag": '',//是否推荐 1推荐
      "keyWords": "",//关键字
    }

    const res = await WXAPI.qryServiceGoodsListNoPage(postData)

   
    this.setData({
      packageList: res.data,
      noTipShow:true
    })

  },
  //获取权益
  async queryMyRights(deptCode,attrName) {

    const res = await WXAPI.queryMyRights(this.data.defaultPatient.userId, '',deptCode,attrName)
    this.setData({
      rightsList: res.data,
    })
    console.log(this.data.rightsList)
    if(this.data.rightsList&&this.data.rightsList.length>0){
      this.setData({
        chooseTipShow:true
      })
    }else{
      this.getPackageList(deptCode)
    }
  },

  applyTap(event) {
    var cert = event.currentTarget.dataset.item
    this.setData({
      chooseCert:cert
    })
    this.queryMyRights(cert.appointDeptId,'appointBedNum')
  },

  goInputPage(cert,right) {
    getApp().bedApplyInfo = {
      cert: cert,
      right:right,
      patient: this.data.defaultPatient
    }

    wx.navigateTo({
      url: './input',
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
  //确认提交
  confirm(){
    if(this.data.chooseRight && this.data.chooseCert){
      // this.goWenjuanPage('http://hmg.mclouds.org.cn/s/32431c59ad514b31b52771f55d77f040')
      this.goInputPage( this.data.chooseCert,this.data.chooseRight)
    }
  },
  onCheckedChange(event) {
    var item = event.currentTarget.dataset.item
    var index = event.currentTarget.dataset.index
    console.log("选择：",item)
    this.setData({
      radio:index,
      chooseRight:item
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
      this.getHospitalTreatCard()
    }
    this.setData({
      hidePatientShow: true
    });

  },
  onPatientPickerCancel() {
    // this.setData({
    //   hidePatientShow: true
    // })
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


  onNoTipClose() {
    this.setData({ noTipShow: false });
  },
  onChooseTipClose() {
    this.setData({ chooseTipShow: false });
  },


  toDetailsTap(event) {
    var id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/home/package-detail/packagedetail?id=' + id,
    })
  },
  goPlanDetailPage(event) {
    var planid = event.currentTarget.dataset.planid
    wx.navigateTo({
      url: './plan-detail?planId=' + planid,
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