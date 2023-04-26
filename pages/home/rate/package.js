const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {},
        value1: 5,
        value2: 5,
        value3: 5,
        value4: 5,
        isDetail: true,
        inputTxt: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("rate-package:",options)
        this.setData({
            rightsId: options.rightsId,//权益ID
            todoid:options.todoid,//待办事项ID 
            id: options.id,//评价ID
            isDetail:options.id?true:false
        })
    
        this.getRightsInfo(this.data.rightsId)
        if(this.data.isDetail){
            this.getAppraiseById(options.id)
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
    //获取评价详情
    async getAppraiseById(id) {

        const res = await WXAPI.getAppraiseById(id)
        this.setData({
            value1: res.data.allAppraise || 0,
            value2: res.data.doctorAppraise || 0,
            value3: res.data.managerAppraise || 0,
            inputTxt: res.data.patientOpinion || ''
        })

    },
    onChange1(event) {
        this.setData({
            value1: event.detail,
        });
    },
    onChange2(event) {
        this.setData({
            value2: event.detail,
        });
    },
    onChange3(event) {
        this.setData({
            value3: event.detail,
        });
    },

    async confirm() {

        var postData = {
            "orderId": this.data.detail.orderId,//订单id
            "allAppraise": this.data.value1,//总体评价                    
            "doctorAppraise": this.data.value2,//医生评价          
            "managerAppraise": this.data.value3,//个案管理师评价
            "patientOpinion": this.data.inputTxt || '医生回复超快，解答详细，医术高明。',//患者评价          
        }
        console.log(postData)
        const res = await WXAPI.doctorAppraise(postData)
        if (res.code == 0) {
            if(this.data.todoid){
                //由待办事项跳转而来的 设置待办已读
                this.setInquiriesAgencyRead(this.data.todoid)
            }
            wx.showToast({
                title: '提交成功',
                icon: 'success',
                duration: 1500
            })
            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        }
    },
     //设置待办已读
     setInquiriesAgencyRead(id) {

        WXAPI.setInquiriesAgencyRead(id)

    },
    goBack() {
        wx.navigateBack()
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