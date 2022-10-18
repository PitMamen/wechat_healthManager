const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    listType: 0,
    active: '0',
    tabs: [{ title: '全部', status: '0' },
    { title: '使用中', status: '1' }],
    orderList: [],
    orderAllList:[],
    orderIngList:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.setData({
      userId: wx.getStorageSync('userInfo').account.accountId,
      defaultPatient: getApp().getDefaultPatient(),
    })
    this.queryMyRights()
  },
  onTabsChange(e) {
    console.log(e)
    var index = e.detail.index
    if(index==0){
      this.setData({
        orderList:this.data.orderAllList
      })
    }else if(index==1){
      this.setData({
        orderList:this.data.orderIngList
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


  async queryMyRights() {


    const res = await WXAPI.queryMyRights( this.data.defaultPatient.userId,'','','')

    var orderIngList=[]
  

    res.data.forEach(item => {
      item.userGoodsAttr.forEach(attr=>{
          
        attr.attrTypeName=getApp().getRightsType(attr.attrName).value
      })
       
        if(item.requesting>0){
          orderIngList.push(item)
        }
      

    });

    this.setData({
      orderList: res.data,
      orderAllList: res.data,
      orderIngList:orderIngList
    })
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  goOrder(e) {
    var id = e.currentTarget.dataset.id
    var userId = e.currentTarget.dataset.userid

    wx.navigateTo({
      url: './detail?orderId=' + id+'&userId='+userId,
    })
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

  onShareAppMessage: function () {
    // 页面被用户转发
  },
  onShareTimeline: function () {
    // 页面被用户分享到朋友圈
  },
})