const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '',
        listType: 0,
        active: '0',
        nuts: [{}, {}],
        time: 15 * 60 * 1000,
        tabs: [{
                title: '全部',
                status: '0'
            },
            {
                title: '待支付',
                status: '1'
            },
            // { title: '待收货', status: '4' },
            {
                title: '已完成',
                status: '2'
            },
            {
                title: '已取消',
                status: '5'
            }
        ],
        orderList: [],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var active = options.active

        if (active) {
            this.setData({
                active: active
            })

        }
        console.log("active:", this.data.active)

        this.setData({
            userId: wx.getStorageSync('userInfo').account.accountId
        })

    },
    onTabsChange(e) {
        console.log(e)
        var status = e.detail.name
        this.setData({
            active: status
        })
        this.getMyOrders(status)

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

        this.getMyOrders(this.data.active)

    },


    /**
     * 
     * @param {订单状态：0全部;1待支付、2进行中、3已完成、4已取消} status 
     */
    async getMyOrders(status) {

        if (status == 0 || status == '0') {
            status = ''
        }

        const res = await WXAPI.getMyOrders({
            status: status
        })
        this.setData({
            //   orderList: res.data.rows
            orderList: [{
                status: 1,
                functionType: 0,
                orderTime: 15
            }, {
                status: 2,
                functionType: 1
            }]
        })
    },

    async updateOrderStatusById(id, status) {

        const res = await WXAPI.updateOrderStatusById(id, status)
        this.onShow()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },
    goOrder(e) {
        var id = e.currentTarget.dataset.id

        console.log(id)

        wx.navigateTo({
            url: './order-detail-new?orderId=' + id,
        })
    },
    changeOrderTap(e) {
        var id = e.currentTarget.dataset.id

        wx.navigateTo({
            url: './order-change?id=' + id,
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
                    that.updateOrderStatusById(id, 5)
                }
            }
        })
    },
    buyAgain(e) {
        console.log(e)
        var goods = e.currentTarget.dataset.goods

        wx.navigateTo({
            url: '../../home/package-detail/packagedetail?departmentId=' + goods.belong + "&goodsClass=" + goods.goodsClass + "&goodsId=" + goods.goodsId,
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