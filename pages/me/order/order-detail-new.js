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
        console.log('order detail', options)
        this.setData({
            orderId: options.orderId,
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
        this.getOrderById()
    },
    async getOrderById() {
        const res = await WXAPI.getOrderDetail({
            orderId: this.data.orderId
        })
        if (res.code == 0) {
            this.setData({
                order: res.data
            })
            wx.setNavigationBarTitle({
                title: this.orderType(res.data.status.value)
            })
            // this.queryUserInfo(res.data.patientId)
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

    //订单状态：0全部;1待支付、2进行中、3已完成、4已取消
    orderType(type) {
        // if (this.data.fromtype == '1') {
        //     return '购买成功'
        // } else {
        if (type == 1) {
            return '待支付订单'
        } else if (type == 2) {
            return '进行中订单'
        } else if (type == 3) {
            return '已完成订单'
        } else if (type == 4) {
            return '已取消订单'
        }
        // }

    },

    goConsult(e) {
         //把参数保存至全局变量
        getApp().globalData.consultPageActive = this.data.order.broadClassify
        wx.switchTab({
            url: '/pages/consult/index',
        })
    },

    toPay(e) {
        let that = this
        var orderId = e.currentTarget.dataset.id
        var orderType = e.currentTarget.dataset.ordertype
        console.log('toPay Detail', orderType)
        WXAPI.registerPayOrder({
            orderType:orderType,
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
                        that.onShow()
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


        // //去支付 
        // let that = this
        // WXPAY.pay(this.data.order.payMoney, this.data.order.orderId, this.data.order.goodsInfo.goodsName, 1, 0)
        //     .then(function () {
        //         console.log("支付成功：")
        //         //支付成功 等待一会再请求详情
        //         wx.showLoading({
        //             title: '加载中...',
        //         })
        //         setTimeout(function () {
        //             that.getOrderById(that.data.orderId)
        //         }, 1000)


        //     }).catch(function (error) {
        //         console.log(error)
        //         wx.showToast({
        //             title: '支付失败',
        //             icon: 'error',
        //             duration: 2000
        //         })
        //         that.setData({
        //             isBuying: false
        //         })
        //     });
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
            this.getOrderById()
        } else {
            wx.showToast({
                title: res.message,
                icon: "none",
            })
        }
    },

    buyAgain(e) {
        var item = e.currentTarget.dataset.goods
        console.log('buyAgain detail',e)
    
          //1咨询服务类2服务套餐3健康商品
          if(item.broadClassify == 1){
            wx.navigateTo({
                url: `/pages/doctor/detail/index?id=${item.commodityId}&docId=${item.doctorUserId}&docName=${item.doctorUserName}`
            })
        }else  if(item.broadClassify == 2){
            wx.navigateTo({
                url: `/pages/health/detail/index?id=${item.commodityId}`
            })
        }
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