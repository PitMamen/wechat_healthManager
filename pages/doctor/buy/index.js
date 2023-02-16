const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        loading: false,
        checked: false,
        id: null,
        userName: '',
        info: {}
    },
    onLoad: function (options) {
        // 页面创建时执行
        this.setData({
            id: options.id,
            userName: options.userName
        })
        this.getInfo()
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.setData({
            loading: false
        })
    },
    onReady: function () {
        // 页面首次渲染完毕时执行
    },
    onHide: function () {
        // 页面从前台变为后台时执行
    },
    onUnload: function () {
        // 页面销毁时执行
    },
    onPullDownRefresh: function () {
        // 触发下拉刷新时执行
    },
    onReachBottom: function () {
        // 页面触底时执行
    },
    onShareAppMessage: function () {
        // 页面被用户分享时执行
    },
    onPageScroll: function () {
        // 页面滚动时执行
    },
    onResize: function () {
        // 页面尺寸变化时执行
    },
    onTabItemTap(item) {
        // tab 点击时执行
    },

    getInfo() {
        WXAPI.paymentCommodity({
            orderId: this.data.id
        }).then((res) => {
            this.setData({
                info: res.data || {}
            })
        })
    },
    onSchemeTap() {
        wx.navigateTo({
            url: '/pages/home/consent/index?title=健康管家服务授权协议&type=1'
        })
    },
    onBuyClick() {
        if (!this.data.checked) {
            wx.showToast({
                title: '请先阅读并同意《健康管家服务授权协议》',
                icon: 'none'
            })
            return
        }
        this.setData({
            loading: true
        })
        let that = this
        if (this.data.info.payMoney === 0) {
            wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                wx.switchTab({
                    url: '/pages/home/main'
                })
            }, 2000)
            return
        }
        WXAPI.registerPayOrder({
            orderId: this.data.id,
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
                            // url: `/pages/health/detail/index?id=${that.data.id}`
                            url: '/pages/me/order/order-detail-new?orderId=' + that.data.id,
                        })
                    }, 2000)
                },
                fail(err) {
                    console.info(err)
                    wx.redirectTo({
                        url: '/pages/me/order/order-detail-new?orderId=' + that.data.id,
                    })
                    this.setData({
                        loading: false
                    })
                }
            })
        })
    }
})