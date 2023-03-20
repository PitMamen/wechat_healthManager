const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        showTime:false,
        selectUser: {},
        info:{},//医生信息和套餐信息
        checkedCommdity:{},//选择的套餐信息
        checkedPkgRule:{},//选择的规格信息
        appointList:[],
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        checkedCase:{},//所选病历
        activeAppoint:null,//所选号源
        selectAppoint:null,//最终确认号源
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("telinfo-options",options)
        this.setData({
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(',')
        })
       
        this.getInfo()
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
        console.log(wx.getStorageSync('CheckedCase'))
        this.setData({
            loading: false,
            selectUser: wx.getStorageSync('defaultPatient'),
            checkedCase: wx.getStorageSync('CheckedCase'),
            columns: wx.getStorageSync('userInfo').account.user,
            phone: wx.getStorageSync('defaultPatient').phone
        })
        wx.removeStorage({
          key: 'CheckedCase',
        })
    },
    getInfo() {
        WXAPI.doctorCommodities({
            doctorUserId: this.data.docId
        }).then((res) => {
            this.setData({
                info: res.data || {},
                
            })
            this.data.info.commodities.forEach(item=>{
                if(item.commodityId == this.data.commodityId){
                    item.pkgRules.forEach(el=>{
                        console.log(this.data.collectionIds)
                        console.log(el.collectionId)
                         var  idx= this.data.collectionIds.indexOf(el.collectionId+'')
                         console.log(idx)
                            if(idx>-1){
                                this.setData({
                                    checkedCommdity:item,
                                    checkedPkgRule:el
                                })
                            }
                        
                    })
                }
            })
        })
    },
    onCaseTap() {
      
        wx.navigateTo({
            url: `/pages/doctor/case/index?docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=102&userId=${this.data.selectUser.userId}&userName=${this.data.selectUser.userName}`
        })
    },
    onSelectTap() {
        this.setData({
            show: true
        })
    },
    closePopup() {
        this.setData({
            show: false
        })
    },
    onCancel() {
        wx.navigateTo({
            url: '/pages/me/patients/addPatient'
        })
    },
    onConfirm(event) {
        const index = event.detail.index
      var selectUser=  this.data.columns[index]
      if(this.data.selectUser.userId == selectUser.userId){
        this.setData({
            show: false
        })
      }else{
        this.setData({
            show: false,
            selectUser: this.data.columns[index],
            phone: this.data.columns[index].phone,
            checkedCase:null
        })
      }
      
    },

    onTimeTap(){
        this.setData({
            showTime: true
        })
    },
    closeTimePopup(){
        this.setData({
            showTime: false
        })
    },
    getPhoneValue(e) {
        this.setData({
            phone: e.detail.value
        })
    },

    //排班
    async doctorAppointInfos() {
        const res = await  WXAPI.doctorAppointInfos({
            doctorUserId: this.data.docId
        })
        if(res.code == 0){
            this.setData({
                appointList:res.data||[],
                showTime:true,
               
            })
           
            if(this.data.appointList.length>0){
                if(!this.data.activeAppoint){
                    this.setData({
                        activeAppoint:this.data.appointList[0]
                    })
                }

            }
        }
    },
    //选择号源
    chooseAppoint(e){
        var item= e.currentTarget.dataset.item
        this.setData({
            activeAppoint:item
        })
    },
    //确定号源
    confirmTimePopup(){
        if(!this.data.activeAppoint){
            wx.showToast({
                title: '请选择意向预约时间',
                icon: 'none'
            })
            return
        }
        this.setData({
            showTime:false,
            selectAppoint:this.data.activeAppoint
        })
    },
    async nextAction(){
        if (!this.data.selectUser.userId) {
            wx.showToast({
                title: '请选择就诊人',
                icon: 'none'
            })
            return
        }
        if (!this.data.checkedCase) {
            wx.showToast({
                title: '请选择病历',
                icon: 'none'
            })
            return
        }
        if (!this.data.phone) {
            wx.showToast({
                title: '请填写咨询电话',
                icon: 'none'
            })
            return
        }
        if (!this.data.selectAppoint) {
            wx.showToast({
                title: '请选择意向预约时间',
                icon: 'none'
            })
            return
        }
        const res2 = await WXAPI.createStewardOrder({
            medicalCaseId: this.data.checkedCase.id,
            collectionIds: this.data.collectionIds || [],
            commodityId: this.data.commodityId,
            doctorUserId: this.data.docId,
            userId: this.data.selectUser.userId,
            doctorAppointId: this.data.selectAppoint.id
        })
        if (res2.code == 0) {
            wx.showToast({
                title: '保存成功',
                icon: 'success'
            })
            wx.navigateTo({
                url: `/pages/doctor/buy/index?id=${res2.data.orderId}&userName=${this.data.selectUser.userName}`
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