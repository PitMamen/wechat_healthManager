const WXAPI = require('../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showNegativeDialog:true,
        identificationNo:'430101200312122589',
        emergencyPhone:'',
        emergencyName:'',
        relationship:'本人',
        relationArray: [
            {
              id: 0,
              name: '本人'
            },
            {
              id: 1,
              name: '配偶'
            },
            {
              id: 2,
              name: '子'
            },
            {
              id: 3,
              name: '女'
            },
            {
              id: 4,
              name: '父母'
            },
            {
              id: 5,
              name: '其他'
            }
          ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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
      getNameValue(e){
        this.setData({
            emergencyName: e.detail.value
          })
      },
      bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          relationship: this.data.relationArray[e.detail.value].name
        })
      },
       //提交
  nextAction: function () {

    let that = this
    if (that.data.identificationNo.length <= 0) {
      wx.showToast({
        title: '请输入身份证号',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    if (that.data.emergencyName.length <= 0) {
        wx.showToast({
          title: '请输入紧急联系人姓名',
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
      if (that.data.emergencyPhone.length != 11) {
        wx.showToast({
          title: '请输入正确的紧急联系人电话',
          icon: 'none',
          duration: 1500
        })
        return;
      }

      this.qryPatientInfo()
  },
    /**
      * 获取患者信息
      */
     async qryPatientInfo(idno) {

        var postdata={
            "cardType":"",
            "cardNum":"",
            "idno":this.data.identificationNo,
            "ipNo":""
        }

        const res = await WXAPI.qryPatientInfo(postdata)
        if(res.code === 0){
            res.data.urgentTel=this.data.emergencyPhone
            res.data.urgentName=this.data.emergencyName
            res.data.relationship=this.data.relationship
            getApp().followInfo= res.data
            wx.navigateTo({
              url: './follow-info',
            })
        }
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