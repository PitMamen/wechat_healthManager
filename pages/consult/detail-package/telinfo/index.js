const WXAPI = require('../../../../static/apifm-wxapi/index')
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
            rightsId: options.rightsId,
            id: options.id,
        })
       
        this.getRightsInfo(this.data.id)
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
    async getRightsInfo(id) {

        const res = await WXAPI.getServiceRightsInfo({ rightsId: id })
        if (res.code == 0) {

            this.setData({
                detail:res.data,
                phone:res.data.userPhone,
                info: res.data.docInfo,
            })
            
        var  rightsItem=   res.data.rightsItemInfo.find(item=>{
                return item.id==this.data.rightsId
            })
           
            console.log(rightsItem)
  
            this.setData({
                rightsItem: rightsItem
            })

 
        }

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
        this.setData({
            show: false
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
            doctorUserId: this.data.detail.docInfo.userId
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
        this. saveRightsUseRecord()
    },
      //申请
      async saveRightsUseRecord() {
        let that = this
        var postData = this.data.rightsItem
        postData.appointTime = this.data.selectAppoint.fullVisitDate
        postData.appointPeriod = this.data.selectAppoint.visitStartTime + '-' + this.data.selectAppoint.visitEndTime
        postData.userId = this.data.detail.userId
        postData.docId = postData.doctorUserId
        postData.rightsItemId = postData.id
        postData.appointId = this.data.selectAppoint.id

        const res = await WXAPI.saveRightsUseRecordNew(postData)
        if (res.code == 0) {

            wx.showToast({
                title: '预约成功！',
                duration: 2000
            })
            setTimeout(() => {
                wx.navigateBack()
            }, 2000)
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