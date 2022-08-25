const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ////工单状态（0：申请；1：审核通过；2：审核失败；3：预约成功；4：预约失败；5：取消预约申请；6：取消预约成功；7：取消预约失败 8报到）
    ////现在的工单状态（3：预约成功；6：取消预约成功； 8报到）
    appointList: [],
    hidePatientShow:true,
    activeStatus:'all',
    active: 0,
    appointItem:'',
    status:'',
    tabs: [{ title: '全部', appointItem: '' },
    { title: '预约检验', appointItem: 'EXAM' },
    { title: '预约检查', appointItem: 'CHECK' }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

      /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      defaultPatient: wx.getStorageSync('defaultPatient'),
      patientList: wx.getStorageSync('userInfo').account.user,
     
    })
    this.qryTradeAppointList()
  },
  onPatientPickerConfirm(event) {
    console.log(event)
    var index = event.detail.index
    var selectPatient = this.data.patientList[index]
    if (selectPatient.userId !== this.data.defaultPatient.userId) {
        this.setData({
            defaultPatient: this.data.patientList[index],
        });
        this.qryTradeAppointList()
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
  /**
      * 预约工单查询
      */
  async qryTradeAppointList() {
    var postData = {
      userId: this.data.defaultPatient.userId,
      status:this.data.status,
      appointItem:this.data.appointItem,
      tradeTypeCode:"lis",
      pageNo: 1,
      pageSize: 10000
    }

    const res = await WXAPI.qryTradeAppointList(postData)
  
    this.setData({
      appointList: res.data.rows
    })

  },
  onTabsChange(e) {
    console.log(e)
    var index = e.detail.index
    var appointItem=this.data.tabs[index].appointItem
    if(this.data.active === index){
        return
    }
    this.setData({
        active:index,
        appointItem:appointItem
    })

    this.qryTradeAppointList()

  },
  bindAllTap(){
    if(this.data.status === ''){
        return
    }
    this.setData({
        status:''
    })
    this.qryTradeAppointList()
  },
  bindSuccessTap(){
    if(this.data.status === '3'){
        return
    }
    this.setData({
        status:'3'
    })
    this.qryTradeAppointList()
  },
  goDetailPage(event){
    console.log(event)
    var tradeId = event.currentTarget.dataset.id
   
    wx.navigateTo({
      url: './detail?tradeId='+tradeId+'&userId='+this.data.defaultPatient.userId,
    })
  },

  /**
  * 取消预约
  */
  async cancelTradeAppoint(tradeId) {
    var postData = {
      "tradeId": tradeId
    }

    const res = await WXAPI.cancelTradeAppoint(postData)
    if (res.code === 0) {
      this.qryTradeAppointList()
      wx.showModal({
        title: '提示',
        content: '取消预约成功',
        showCancel: false,
        success(res) {
          
        }
      })

    }

  },
  goRemind(){
    wx.showModal({
        title: '提示',
        content: '1）预约成功后，请您于预约日期提前30分钟到检查/检验科室报道、候诊。\n2）如检查前半个月内有发热(体温≥37.3°)、干咳、乏力等症状，或前半个月内接触过疫情中高风险地区人员，或检查当日健康码为红码或黄码的病友和家属，请先至发热门诊就诊。\n3）如隐瞒病史或流行病学史造成不良后果者，将按国家相关法律法规予以追责。',
        showCancel: false,
        success(res) {
          
        }
      })
  },
  //取消预约
  cancleAppoint(event) {
    console.log(event)
    var item = event.target.dataset.item
    this.cancelTradeAppoint(item.tradeId)
  },
  //补充资料
  furtherInformation(event) {
    var item = event.target.dataset.item
    wx.navigateTo({
      url: './upload?tradeId='+item.tradeId,
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


})