const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    healthList: '',
    selectHealth: '',
    show: false,
    actions: [
      {
        name: '删除', color: '#ee0a24'
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.userId) {
      this.setData({
        userId: options.userId,
      })
    } else {
      wx.showToast({
        title: '参数为空',
        icon: "none"
      })

      return
    }
    this.qryUserLocalVisit()
  },

  //获取健康记录
  async qryUserLocalVisit() {

    var postdata = {
      userId: this.data.userId,
      visitType: ''
    }

    const res = await WXAPI.qryUserLocalVisit(postdata)
    if (res.data && res.data.length > 0) {
      this.setData({
        healthList: res.data
      })
    }else{
      this.setData({
        healthList: []
      })
    }

  },
  //删除
  async delDailyRecord() {


          var requestData = { id: this.data.selectHealth.id, visitType: "DailyRecord" }

          const res = await WXAPI.delDailyRecord(requestData)
          if (res.code == 0) {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 2000
            })
            this.qryUserLocalVisit()
          }
       
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //图片预览
  toDetailsTap: function (e) {
    var url = e.currentTarget.dataset.url
    var healthImagesList = e.currentTarget.dataset.item
    console.log(healthImagesList)
    var imgList = []
    healthImagesList.forEach(item => {
      imgList.push(item.fileUrl)
    })
    wx.previewImage({
      urls: imgList,
      current: url
    })
  },
  onShowSheet(e) {
    var item = e.currentTarget.dataset.item
    this.setData({
      show: true,
      selectHealth: item
    })
  },
  onCloseSheet() {
    this.setData({
      show: false
    })
  },
  onSelect(e) {
    console.log(e.detail)
    var that = this;
    if(e.detail.name == '删除'){
      wx.showModal({
        title: '提示',
        content: '确定删除此纪录吗',
        success(res) {
          if (res.confirm) {
              that.delDailyRecord()
          }
        }
      })
    }

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