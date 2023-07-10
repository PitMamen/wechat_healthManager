const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        showTime: false,
        selectUser: {},
        info: {},//医生信息和套餐信息
        appointList: [],
        doctorAppointId:null,//号源
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        checkedCase: {},//所选病历
        activeAppoint: null,//所选号源
        selectAppoint: null,//最终确认号源
        radioIndex:null,//所选时间段index
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("telinfo-options", options)
        this.setData({
            doctorAppointId:options.doctorAppointId,
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(',')
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
        this.setData({
            loading: false,
            columns: wx.getStorageSync('userInfo').account.user,
            phone: wx.getStorageSync('defaultPatient').phone
        })
    },
  
      //选择就诊人
      onChooseRadioItem(e){
        var index = e.currentTarget.dataset.index
        this.setData({
            radioIndex: index,
          });
          this.onConfirm(this.data.radioIndex)
    },
    //选择就诊人监听
    onRadioChange(e){
        console.log(e)
        this.setData({
            radioIndex: e.detail,
          });
          this.onConfirm(this.data.radioIndex)
    },
   
    onConfirm(index) {
      
        var selectUser = this.data.columns[index]
        if (this.data.selectUser.userId == selectUser.userId) {
            this.setData({
                show: false
            })
        } else {
            this.setData({
                show: false,
                selectUser: this.data.columns[index],
                phone: this.data.columns[index].phone,
                checkedCase: null
            })
        }

    },
    //添加就诊人
    goAddPatientPage(){
        wx.navigateTo({
          url: '/pages/me/patients/addPatient',
        })
    },
    onTimeTap() {
        this.setData({
            showTime: true
        })
    },
    closeTimePopup() {
        this.setData({
            showTime: false
        })
    },
    getPhoneValue(e) {
        this.setData({
            phone: e.detail.value
        })
    },

 
    

  
    async nextAction() {
        if (!this.data.selectUser.userId) {
            wx.showToast({
                title: '请选择就诊人',
                icon: 'none'
            })
            return
        }
        wx.navigateTo({
            url: `/pages/doctor/choose-case/index?doctorAppointId=${this.data.doctorAppointId}&docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=103&userId=${this.data.selectUser.userId}&userName=${this.data.selectUser.userName}`
        })
        return
        const res2 = await WXAPI.createStewardOrder({
            channel: 'wechat',
            medicalCaseId: this.data.checkedCase.id,
            collectionIds: this.data.collectionIds || [],
            commodityId: this.data.commodityId,
            doctorUserId: this.data.docId,
            userId: this.data.selectUser.userId,
            doctorAppointId: this.data.selectAppoint.id,
            phone: this.data.phone
        })
        if (res2.code == 0) {
            wx.showToast({
                title: '保存成功',
                icon: 'success'
            })
            wx.navigateTo({
                url: `/pages/doctor/buy/index?id=${res2.data.orderId}&userName=${this.data.selectUser.userName}&orderType=${res2.data.orderType}`
            })
        }
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