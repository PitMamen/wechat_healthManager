const WXAPI = require('../../../static/apifm-wxapi/index')
const WXPAY = require('../../../utils/pay')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // statusDes: '说明：请在倒计时内完成订单支付，超过倒计时，系 统将为您自动取消订单。',
        orderId: '',
        fromtype: '', //1购买成功 目前只有购买成功才传值
        nuts: [{}, {}],
        order: {
            status: 1,
            functionType: 0
        },
        patient: {},
        conclusionDetail: {},

        regNo: '',
        userId: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('order detail', options)
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            regNo: options.regNo,
            userId: options.userId,
            recordId: options.recordId,
        })


    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getEmrDetail()
    },
    async getEmrDetail() {
        wx.showLoading({
            title: '加载中',
        })
        const res = await WXAPI.getEmrDetail({
            regNo: this.data.regNo,
            recordId: this.data.recordId,
            userId: this.data.userId
        })
        wx.hideLoading()
        if (res.code == 0 && res.data.length > 0) {
            if (res.data[0].outDate) {
                res.data[0].outDate = res.data[0].outDate.substring(0, 4) + '年' + res.data[0].outDate.substring(5, 7) + '月' + res.data[0].outDate.substring(8, 10) + '日'
            } else {
                res.data[0].outDate = ''
            }

            this.setData({
                conclusionDetail: res.data[0]
            })

            wx.setNavigationBarTitle({
                title: '出院小结'
            })
            // this.getAppraiseByOrderId(this.data.order.orderId)
            // this.queryUserInfo(res.data.patientId)
        }
    },


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})