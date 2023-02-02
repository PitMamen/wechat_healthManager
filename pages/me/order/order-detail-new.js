const WXAPI = require('../../../static/apifm-wxapi/index')
const WXPAY = require('../../../utils/pay')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: '',
        fromtype: '', //1购买成功 目前只有购买成功才传值
        nuts: [{}, {}],
        order: {
            status: 1,
            functionType: 0
        },
        patient: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            orderId: options.orderId,
            fromtype: options.fromtype
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
        let that = this
        // if(this.data.fromtype == '1'){
        //   //支付成功 等待一会再请求详情
        //   wx.showLoading({
        //     title: '等待中...',
        //   })
        //   setTimeout(function(){
        //     that.getOrderById(that.data.orderId)
        // },1000)
        // }else {
        //   that.getOrderById(that.data.orderId)
        // }


    },
    async getOrderById(id) {


        const res = await WXAPI.getOrderById(id, 0)
        if (res.code == 0) {
            this.setData({
                order: res.data
            })
            wx.setNavigationBarTitle({
                title: this.orderType(res.data.status)
            })
            this.queryUserInfo(res.data.patientId)
        }


    },
    async queryUserInfo(userId) {


        const res = await WXAPI.queryUserInfo(userId)
        if (res.code == 0) {
            this.setData({
                patient: res.data.user
            })
        }


    },
    goMain() {
        wx.switchTab({
            url: '/pages/home/main',
        })
    },

    orderType(type) {
        if (this.data.fromtype == '1') {
            return '购买成功'
        } else {
            if (type == 1) {
                return '订单待支付'
            } else if (type == 4) {
                return '订单待收货'
            } else if (type == 2) {
                return '订单已完成'
            } else if (type == 5) {
                return '订单已取消'
            }
        }

    },
    toPay() {
        //去支付 
        let that = this
        WXPAY.pay(this.data.order.payMoney, this.data.order.orderId, this.data.order.goodsInfo.goodsName, 1, 0)
            .then(function () {
                console.log("支付成功：")
                //支付成功 等待一会再请求详情
                wx.showLoading({
                    title: '加载中...',
                })
                setTimeout(function () {
                    that.getOrderById(that.data.orderId)
                }, 1000)


            }).catch(function (error) {
                console.log(error)
                wx.showToast({
                    title: '支付失败',
                    icon: 'error',
                    duration: 2000
                })
                that.setData({
                    isBuying: false
                })
            });
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
    async updateOrderStatusById(id, status) {

        const res = await WXAPI.updateOrderStatusById(id, status)
        if (res.code == 0) {
            this.getOrderById(this.data.orderId)
        }

    },
    buyAgain(e) {
        var id = e.currentTarget.dataset.id

        wx.navigateTo({
            url: '../../home/package-detail/packagedetail?id=' + id,
        })
    },

    changeOrderTap(e) {
        var id = e.currentTarget.dataset.id

        wx.navigateTo({
            url: './order-change?id=' + id,
        })
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