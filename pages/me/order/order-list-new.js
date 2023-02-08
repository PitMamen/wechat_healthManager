const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '',
        listType: 0,
        status: '0',
        nuts: [{}, {}],
        time: 15 * 60 * 1000,
        // 0全部;1待支付、2进行中、3已完成、4已取消
        tabs: [{
                title: '全部',
                status: '0'
            },
            {
                title: '待支付',
                status: '1'
            },
            {
                title: '进行中',
                status: '2'
            },
            {
                title: '已完成',
                status: '3'
            },
            {
                title: '已取消',
                status: '4'
            }
        ],
        orderList: [],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userId: wx.getStorageSync('userInfo').account.accountId
        })

    },
    onTabsChange(e) {
        console.log('onTabsChange', e)
        var status = e.detail.index
        this.setData({
            status: status
        })
        this.getMyOrders()

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

        this.getMyOrders()

    },


    /**
     * 
     * @param {订单状态：0全部;1待支付、2进行中、3已完成、4已取消} status 
     */
    async getMyOrders() {
        const res = await WXAPI.getMyOrders({
            status: this.data.status
        })
        this.setData({
            orderList: res.data
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    goOrder(e) {
        var id = e.currentTarget.dataset.id
        debugger
        console.log(id)

        wx.navigateTo({
            url: './order-detail-new?orderId=' + id,
        })
    },
    goConsult(e) {
        wx.switchTab({
            url: '/pages/consult/index',
        })
    },

    toPay(e) {
        var orderId = e.currentTarget.dataset.id
        console.log('toPay List', orderId)
        WXAPI.registerPayOrder({
            orderId: orderId,
            payMethod: 'weixin_miniapp'
        }).then((res) => {
            wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.packageStr,
                signType: 'MD5',
                paySign: res.data.paySign,
                success() {
                    wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 2000
                    })
                    setTimeout(() => {
                        wx.redirectTo({
                            url: 'pages/me/order/order-list-new'
                        })
                    }, 2000)
                },
                fail(err) {
                    console.info(err)
                    this.setData({
                        loading: false
                    })
                }
            })
        })
    },

    cancelOrderTap(e) {
        var id = e.currentTarget.dataset.id
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定取消此订单？',
            success(res) {
                if (res.confirm) {
                    that.cancelOrderOut(id)
                }
            }
        })
    },
    async cancelOrderOut(id) {
        // cancelOrder
        const res = await WXAPI.cancelOrder({
            orderId: id
        })
        if (res.code == 0) {
            wx.showToast({
                title: '取消成功',
                icon: "none",
            })
            this.onShow()
        } else {
            wx.showToast({
                title: res.message,
                icon: "none",
            })
        }
    },
    buyAgain(e) {
        var item = e.currentTarget.dataset.goods
        console.log(e)
        wx.navigateTo({
            url: `/pages/health/detail/index?id=${item.commodityId}`
        })
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