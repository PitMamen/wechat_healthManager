const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {},
        value1:5,
        value2:5,
        value3:5,
        value4:5,
        show:false,
        inputTxt:'医生回复超快，解答详细，医术高明。'
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId: options.rightsId,


        })
        this.getRightsInfo(this.data.rightsId)
       
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
            var caseArr = []
            if (res.data.teamInfo && res.data.teamInfo.length > 0) {
                caseArr = res.data.teamInfo.filter(
                    function (element, index, arr) {
                        return element.userType == 'casemanager';
                    }
                )
            }
            res.data.caseInfo = caseArr.length > 0 ? caseArr[0] : {}
            this.setData({
                detail: res.data,          
            })
       
        }

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