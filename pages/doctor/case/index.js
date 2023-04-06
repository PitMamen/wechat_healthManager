const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show:false,
        selectUser: {},
        caseList:[],
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        consultType:''//'101': 图文咨询,'102': 电话咨询,'103': 视频咨询
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(','),
            consultType: options.consultType,
            userId:options.userId
        })
        console.log("case-options",options)
        this.setData({
            loading: false,        
            columns: wx.getStorageSync('userInfo').account.user
        })

        if(this.data.consultType=='102'|| this.data.consultType=='103'){
           //电话 视频 会带过来就诊人
         var selectUser=   this.data.columns.find((el)=>{
                return el.userId==this.data.userId
            })
            this.setData({             
                selectUser: selectUser ||    wx.getStorageSync('defaultPatient')              
            })
        }else{
            this.setData({             
                selectUser: wx.getStorageSync('defaultPatient')              
            })
        }
        this.getMedicalCaseList()
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

    getMedicalCaseList(){
        if(!this.data.selectUser.userId){
            return
        }
        WXAPI.medicalCaseList({
            userId : this.data.selectUser.userId
        }).then((res) => {
           
            this.setData({
                caseList:res.data || []
            })
        })
    },


     //新增
     addCase(e){
        if(!this.data.columns || this.data.columns.length==0){
           return
        }
        wx.navigateTo({
            url: `/pages/doctor/fill/index?userId=${this.data.selectUser.userId}&userName=${this.data.selectUser.userName}&docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=${this.data.consultType}`
        })
    },
    //查看
    checkCase(e){
        var item= e.currentTarget.dataset.item
        wx.navigateTo({
            url: `/pages/doctor/fill/index?caseId=${item.id}&userId=${this.data.selectUser.userId}&userName=${this.data.selectUser.userName}&docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=${this.data.consultType}`
        })
    },

    deleteTap(e){
        console.log(e)
       var item= e.currentTarget.dataset.item
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
        const res =  await  WXAPI.medicalCaseDelete({
            id:id,             
        })
        if(res.code == 0){
            wx.showToast({
                title: '已删除',
                icon: 'success'
            })
            this.getMedicalCaseList()
        }
    },
    onSelectTap() {
        if(this.data.consultType=='102'|| this.data.consultType=='103'){
            return
        }
        if(!this.data.columns || this.data.columns.length==0){
            wx.navigateTo({
                url: '/pages/me/patients/addPatient',
            })
        }else {
            this.setData({
                show: true
            })
        }

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
        this.setData({
            show: false,
            selectUser: this.data.columns[index]
        })
        this.getMedicalCaseList()
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