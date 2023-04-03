const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info:null,
        rightsItemList:[],
        qrCode:'',
        show: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getRightsInfo(options.rightsId)
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

        var caseArr = []
        if (res.data.teamInfo.length > 0) {
            caseArr = res.data.teamInfo.filter(
                function (element, index, arr) {
                    return element.userType == 'casemanager';
                }
            )
        }

        this.setData({
            info: caseArr.length > 0 ? caseArr[0] : {}
        })

         var rightsItemList= res.data.rightsItemInfo.filter(item => {

            return item.projectType == 106
        })

        this.setData({
            rightsItemList: rightsItemList
        })
        if(this.data.info.userId){
            this.getCompanyUserInfo(this.data.info.userId)
        }
        

    },
    //获取二维码
    async getCompanyUserInfo(userId) {
        const res = await WXAPI.getCompanyUserInfo(userId)
        if (res.code == 0 && res.data && res.data.qrCode) {

            this.setData({
                qrCode: res.data.qrCode,
            })


        } 

    },

    showPopup() {
        this.setData({
            show: true
        })
    },
    closePopup(){
        this.setData({
            show: false
        })
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