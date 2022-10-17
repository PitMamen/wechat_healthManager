// pages/login/follow-checkin.js
Page({
    data: {
        showPositiveDialog:true,
       info:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            info:getApp().followInfo
        })
        console.log(this.data.info)
    },
    getIDCardNoValue(e) {
        this.setData({
          identificationNo: e.detail.value
        })
      },
      getPhoneValue(e){
        this.setData({
            emergencyPhone: e.detail.value
          })
      },
      bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          relationship: this.data.relationArray[e.detail.value].name
        })
      },
      backAction:function(){
        wx.navigateBack({
          delta: 0,
        })
      },
       //提交
  nextAction: function () {

    let that = this
    var userName = that.data.userName
    var identificationNo = that.data.identificationNo
    var relationship = that.data.relationship



    if (identificationNo.length <= 0) {
      wx.showToast({
        title: '请输入身份证号',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    if (that.data.emergencyPhone.length <= 0) {
        wx.showToast({
          title: '请输入紧急联系人电话',
          icon: 'none',
          duration: 1500
        })
        return;
      }

  },
  onDialogConfirm(){
    wx.reLaunch({
      url: '/pages/home/main',
    })
  },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})