const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var bedApplyInfo =getApp().bedApplyInfo
    bedApplyInfo.patient.identificationNo_x = bedApplyInfo.patient.identificationNo.replace(/^(.{6})(?:\w+)(.{4})$/, "$1********$2"); 
    console.log(bedApplyInfo)
    this.setData({
      info:bedApplyInfo
    })
    this.setData({
      visitTime: Util.formatTime2(new Date()),
    })
  },
  apply(){
    this.saveTradeAppoint(this.data.info) 
  },
  /**
     * 床位预约
     */
    async saveTradeAppoint(info) {
      var postData = {
        "appointDept": info.cert.appointDeptId,//科室
        "appointDeptName": info.cert.appointDeptName,//科室名称
        "appointDoc": '',//预约医生
        "appointDocName": info.cert.reqDocName,//预约医生姓名
        "diagnosis": info.cert.diagnosis,//诊断名称
        "insuranceType": info.patient.yblx,//医保类型
        "prePay": 1000,//预缴金
        "reqDept": info.cert.appointDeptId,//开单科室
        "reqDeptName": info.cert.appointDeptName,//开单科室名称
        "reqDoc": '',//开单医生
        "reqDocName": info.cert.reqDocName,//开单医生姓名
        "reqTime": info.cert.reqTime,//开单日期
        "status": 0,//工单状态（0：申请；1：审核通过；2：审核失败；3：预约成功；4：预约失败；5：取消预约申请；6：取消预约成功；7：取消预约失败）
        "tel": info.patient.phone,//联系电话
        "tradeType": '预约床位',//工单类型名称
        "tradeTypeCode": 'bed',//工单类型(bed:预约床位；visit:预约复诊；lis:预约检查)
        "updateUser": info.patient.userId,//更新人
        "userName": info.patient.userName,//用户id
        "userId": info.patient.userId,//用户

      }
      console.log(postData)
      const res = await WXAPI.saveTradeAppoint(postData)
  
     if(res.code === 0){
      wx.navigateTo({
        url: './success',
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