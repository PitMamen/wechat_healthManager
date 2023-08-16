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
        broadClassify: 1, //1咨询服务类2服务套餐3健康商品
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
            broadClassify: options.broadClassify,
            userId: wx.getStorageSync('userInfo').account.accountId
        })
        wx.setNavigationBarTitle({
            title: '专科服务',
        })
        // if(options.broadClassify == '1'){
        //     wx.setNavigationBarTitle({
        //         title: '咨询订单',
        //       })
        // }else  if(options.broadClassify == '2'){
        //     wx.setNavigationBarTitle({
        //         title: '专科服务',
        //       })
        // }else  if(options.broadClassify == '3'){
        //     wx.setNavigationBarTitle({
        //         title: '商城订单',
        //       })
        // }


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
            broadClassify: this.data.broadClassify,
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

        console.log(id)

        wx.navigateTo({
            url: './order-detail-special?orderId=' + id,
        })
    },
    goConsult(e) {
        var item = e.currentTarget.dataset.goods
        //把参数保存至全局变量
        getApp().globalData.consultPageActive = item.broadClassify
        wx.switchTab({
            url: '/pages/consult/index',
        })
    },

    //问诊详情
    goConsultDetail(e) {
        var info = e.currentTarget.dataset.item
        console.log("fff:", info)
        if (this.checkLoginStatus()) {
            if (info.rightItems[0].projectType == 102) {
                // url: '/pages/me/patients/addPatient',
                wx.navigateTo({
                    url: '../../consult/detail-tel/index?rightsId=' + info.id + '&userId=' + info.doctorUserId + '&status=' + info.status.value,
                })
            } else if (info.rightItems[0].projectType == 103) {
                wx.navigateTo({
                    url: '../../consult/detail-video/index?rightsId=' + info.id + '&userId=' + info.doctorUserId + '&status=' + info.status.value,
                })
            } else {
                wx.navigateTo({
                    url: '../../consult/detail-text/index?rightsId=' + info.id + '&userId=' + info.doctorUserId + '&status=' + info.status.value,
                })
            }
        }
    },

    //查看是否评价
    getAppraiseByOrderId(e) {
        let item = e.currentTarget.dataset.item
        WXAPI.getAppraiseByOrderId(item.orderId).then(res => {
            if (res.code == 0 && res.data && res.data.id) {
                console.log('ddddddddd', res.data)
                this.setData({
                    rateId: res.data.id,
                    isRated: true,
                    rateBtnText: '查看评价'
                })
            } else {
                this.setData({
                    isRated: false,
                    // rateBtnText: '去评价'
                    rateBtnText: '查看评价'
                })
            }
            this.goRate(item)
        })
    },

    //去评价
    goRate(e) {
        let item = e.currentTarget.dataset.item
        console.log('goRate list------------', item)
        console.log('goRate list rateId------------', this.data.rateId)
        console.log('goRate list item.appraiseId------------', item.appraiseId)
        // if (this.data.isRated) {
        if (item.appraiseId) {
            wx.navigateTo({
                url: `/pages/home/rate/doctor?rightsId=${item.id}&id=${item.appraiseId}`
            })
        } else {
            wx.navigateTo({
                url: `/pages/home/rate/doctor?rightsId=${item.id}`
            })
        }
    },

    checkLoginStatus() {
        if (getApp().globalData.loginReady) {
            return true
        } else {
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth',
                        })
                    }
                }
            })
            return false
        }
    },

    //套餐详情
    goPackageDetailPage(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: '../../consult/detail-package/index?rightsId=' + info.id + '&userId=' + info.userId + '&status=' + info.status.value,
            })

        }
    },

    //再次购买
    bugAgain(e) {
        var info = e.currentTarget.dataset.item
        // debugger
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: `/packageDoc/pages/health/detail/index?id=${info.commodityId}`
            })
        }
    },

    toPay(e) {
        var orderId = e.currentTarget.dataset.id
        var orderType = e.currentTarget.dataset.ordertype
        console.log('toPay List', orderType)
        let that = this
        WXAPI.registerPayOrder({
            orderType: orderType,
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
                        // wx.redirectTo({
                        //     url: 'pages/me/order/order-list-new'
                        // })
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
        //1咨询服务类2服务套餐3健康商品
        if (item.broadClassify == 1) {
            wx.navigateTo({
                url: `/packageDoc/pages/doctor/detail/index?id=${item.commodityId}&docId=${item.doctorUserId}&docName=${item.doctorUserName}`
            })
        } else if (item.broadClassify == 2) {
            wx.navigateTo({
                url: `/packageDoc/pages/health/detail/index?id=${item.commodityId}`
            })
        }

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