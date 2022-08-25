// pages/home/doctor-detail/index.js
const WXAPI = require('../../../static/apifm-wxapi/index')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isContracted:true,//是否签约   不需要再签约
    unreadIMmessageCount:0,
    doctor:{
    },

    doctorId:'',
    patientId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      doctorId:options.doctorId,    
      // doctorId:110,    
      patientId:options.patientId,    
    })
    this.doctorDetailQuery()
    // this.isContractDoctor()
    
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
    // this.getConversationList()
  },
      //获取医生信息
  async doctorDetailQuery() {

    var postData1 = [this.data.doctorId]
    const docRes = await WXAPI.doctorInfoQuery(postData1)
    if (docRes.code == 0) {
      this.setData({
        doctor: docRes.data[0]
      })
    }

  },
    //是否签约医生
    async isContractDoctor(e) {
  
      const res = await WXAPI.isContractDoctor(this.data.patientId)
        if (res.code == 0) {
          this.setData({
            isContracted:res.data
          })
        }
    },
  //签约医生
  async contractDoctor(e) {
    var that = this;
    var requestData = {userId:this.data.patientId,docId:that.data.doctorId}
    console.log(requestData)
    const res = await WXAPI.contractDoctor(requestData)
      if (res.code == 0) {
        wx.showToast({
          title: '签约成功',
          icon:'success',
          duration: 2000
        })
        this.setData({
          isContracted:true
        })
      }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //立即咨询
  goIMPage(){
   
  },
 



 //计算tabs高度
  queryTabsHight(){
    var query = wx.createSelectorQuery();
    query.select('#tabs').boundingClientRect((rect) => {
      var tabsHeight = rect.bottom
      this.setData({
        tabsHeight:tabsHeight
      })
    }).exec()
  },

  onTabsChange(e) {
    var index = e.detail.index
    this.setData({
      toView: this.data.tabs[index].view_id
    })
  },
  bindscroll(e) {
    //计算页面 轮播图、详情、评价(砍价)view 高度
    this.getTopHeightFunction()
    var tabsHeight = this.data.tabsHeight //顶部距离（tabs高度）

    console.log("0-tabs:",this.data.tabs[0].bottomHeight-tabsHeight)
    console.log("1-tabs:",this.data.tabs[1].bottomHeight-tabsHeight)

    if (this.data.tabs[0].bottomHeight-tabsHeight>50 ) { //临界值，根据自己的需求来调整
      this.setData({
        active: this.data.tabs[0].tabs_name //设置当前标签栏
      })
    } else if (this.data.tabs.length == 2) {
      this.setData({
        active: this.data.tabs[1].tabs_name
      })
    } else if (this.data.tabs[1].bottomHeight-tabsHeight>25 ) {
      this.setData({
        active: this.data.tabs[1].tabs_name
      })
    } else  {
      this.setData({
        active: this.data.tabs[2].tabs_name
      })
    }
  },
  getTopHeightFunction() {
    var that = this
    var tabs = that.data.tabs
    tabs.forEach((element, index) => {
      var viewId = "#" + element.view_id
      that.getTopHeight(viewId, index)
    });
  },
  getTopHeight(viewId, index) {
    var query = this.createSelectorQuery();
    query.select(viewId).boundingClientRect((rect) => {
      if (!rect) {
        return
      }
      
      let bottom = rect.bottom
      var tabs = this.data.tabs
      
      tabs[index].bottomHeight = bottom
      this.setData({
        tabs: tabs
      })
    }).exec()
  },
  //获取未读消息数
  getConversationList() {
    let promise = getApp().tim.getConversationList();
    let that = this;
    promise.then(function (imResponse) {
      const conversationList = imResponse.data.conversationList; // 会话列表，用该列表覆盖原有的会话列表
      var unreadIMmessageCount = 0
      conversationList.forEach(function (item, index) {
        if (item.type == 'C2C') {
          unreadIMmessageCount = unreadIMmessageCount + item.unreadCount
        }
      })

      that.setData({
        unreadIMmessageCount: unreadIMmessageCount
      })


    }).catch(function (imError) {
      console.error(imError)
      console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
    });
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