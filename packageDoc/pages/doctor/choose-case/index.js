const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        caseList: [],
        doctorAppointId:null,//号源
        appointStartTime:null,//时间段
        appointEndTime:null,//时间段
        consultType: '',//'101': 图文咨询,'102': 电话咨询,'103': 视频咨询
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        phone:'',//咨询电话
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            doctorAppointId:options.doctorAppointId,
            appointStartTime:options.appointStartTime,
            appointEndTime:options.appointEndTime,
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(','),
            consultType: options.consultType,
            phone: options.phone,
            userId: options.userId,
            userName:options.userName
        })
        console.log("case-options", options)
        var title='咨询'
        if(this.data.consultType == '101'){
            title='图文咨询'
        }else  if(this.data.consultType == '102'){
            title='电话咨询'
        }else  if(this.data.consultType == '103'){
            title='视频咨询'
        }
        wx.setNavigationBarTitle({
            title: title
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
       
        this.getMedicalCaseList()
    },

    getMedicalCaseList() {
        if (!this.data.userId) {
            return
        }
        WXAPI.medicalCaseList({
            userId: this.data.userId
        }).then((res) => {

            this.setData({
                caseList: res.data || []
            })
        })
    },


    //新增
    addCase(e) {
        
        wx.navigateTo({
            url: `/packageDoc/pages/doctor/fill/index?doctorAppointId=${this.data.doctorAppointId}&appointStartTime=${this.data.appointStartTime}&appointEndTime=${this.data.appointEndTime}&userId=${this.data.userId}&userName=${this.data.userName}&docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=${this.data.consultType}&phone=${this.data.phone}`
        })
    },
    //查看
    checkCase(e) {
        var item = e.currentTarget.dataset.item
        wx.navigateTo({
            url: `/packageDoc/pages/doctor/fill/index?doctorAppointId=${this.data.doctorAppointId}&appointStartTime=${this.data.appointStartTime}&appointEndTime=${this.data.appointEndTime}&caseId=${item.id}&userId=${this.data.userId}&userName=${this.data.userName}&docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=${this.data.consultType}&phone=${this.data.phone}`
        })
    },

    deleteTap(e) {
        console.log(e)
        var item = e.currentTarget.dataset.item
        wx.showModal({
            title: '确定删除该病历吗？',
            content: item.title,
            complete: (res) => {
                if (res.confirm) {
                    this.deleteCase(item.id)
                }
            }
        })
    },
    //删除
    async deleteCase(id) {
        const res = await WXAPI.medicalCaseDelete({
            id: id,
        })
        if (res.code == 0) {
            wx.showToast({
                title: '已删除',
                icon: 'success'
            })
            this.getMedicalCaseList()
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