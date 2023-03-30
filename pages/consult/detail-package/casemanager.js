const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info:null,
        rightsItemList:[],
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

    },
    //获取套餐列表
    async getPackageList() {
        const res = await WXAPI.getConsultList({ broadClassify: 2 })
        if (res.code == 0 && res.data && res.data.length > 0) {

            this.setData({
                packageList: res.data,
            })


        } else {
            this.setData({
                packageList: []
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