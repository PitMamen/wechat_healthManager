const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctors: [{
      departmentCode: "1030200",
      departmentName: "消化内科",
      disease: "擅长消化内科的问题",
      doctorId: "109",
      doctorImage: "http://hmg.mclouds.org.cn/content-api/file/I20210922153603840HVENOXKUM3IEAJ-1-preview.png",
      doctorName: "吴汉江",
      doctorPosition: "主任医师",
      hospitalName: "中南大学湘雅二医院",
      yljgdm: "444885559"

    }, {
      departmentCode: "1030200",
      departmentName: "消化内科",
      disease: "擅长消化内科的问题，尤其是饮食啥的问题",
      doctorId: "110",
      doctorImage: "http://hmg.mclouds.org.cn/content-api/file/I20210922153633047SH0EWBQQGRG3K0-2-preview.png",
      doctorName: "朱兆夫",
      doctorPosition: "主任医师",
      hospitalName: "中南大学湘雅二医院"

    },
    {
      departmentCode: "1030200",
      departmentName: "消化内科",
      disease: "擅长消化内科的问题",
      doctorId: "118",
      doctorImage: "http://hmg.mclouds.org.cn/content-api/file/I20210922153633047SH0EWBQQGRG3K0-2-preview.png",
      doctorName: "郑煜煌",
      doctorPosition: "主任医师",
      hospitalName: "中南大学湘雅二医院",
      yljgdm: "444885559"
    }
      , {
      departmentCode: "1030200",
      departmentName: "消化内科",
      disease: "擅长消化内科的问题",
      doctorId: "119",
      doctorImage: "http://hmg.mclouds.org.cn/content-api/file/I20210922153603840HVENOXKUM3IEAJ-1-preview.png",
      doctorName: "李乔华",
      doctorPosition: "主任医师",
      hospitalName: "中南大学湘雅二医院",
      yljgdm: "444885559"
    }]


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //去医生页面
  goDoctorPage(e) {
    const doctor = e.currentTarget.dataset.item
    var time = Util.formatTime2(new Date())
    wx.navigateTo({
      url: './doctor-detail?departmentId=' + doctor.departmentCode + '&doctorId=' + doctor.doctorId + '&appointmentTime=' + time + '&hospitalCode=' + getApp().globalData.yljgdm,
    })
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