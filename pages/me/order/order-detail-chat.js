const WXAPI = require('../../../static/apifm-wxapi/index')
const WXPAY = require('../../../utils/pay')
const IMUtil = require('../../../utils/IMUtil')
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
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('order detail', options)
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            orderId: options.orderId,
            userInfo: userInfo,
            defaultPatient: wx.getStorageSync('defaultPatient'),
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
                order: res.data,
                status: res.data.status.value
            })

            wx.setNavigationBarTitle({
                title: this.orderType(res.data.status.value)
            })
            this.getAppraiseByOrderId(this.data.order.orderId)
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
            this.setData({
                statusDes: '说明：请在倒计时内完成订单支付，超过倒计时，系 统将为您自动取消订单。'
            })
            return '待支付订单'
        } else if (type == 2) {
            this.setData({
                statusDes: '说明：您购买的订单正处于进行中，沟通中有任何问题，可联系客服处理。'
            })
            return '进行中订单'
        } else if (type == 3) {
            this.setData({
                statusDes: '说明：您的订单已完成，如有任何问题可联系客服进行处理。'
            })
            return '已完成订单'
        } else if (type == 4) {
            this.setData({
                statusDes: '说明：您的订单已取消，如有任何问题可联系客服进行处理。'
            })
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

    //待办事项 进入诊室
    bindTodoItemEnterRoomTap(e) {
        let item = e.currentTarget.dataset.item
        console.log('bindTodoItemEnterRoomTap ********', item)
        // this.data.order.doctorUserId
        if (this.checkLoginStatus()) {
            if (getApp().globalData.sdkReady) {
                if (this.data.order.orderId) {
                    IMUtil.goGroupChat(this.data.order.userId, 'navigateTo', 'M_' + this.data.order.orderId, 'textNum', this.data.order.tradeId, 'START')
                }
            }
        }
    },

    //问诊详情
    goConsultDetail(e) {
        var info = e.currentTarget.dataset.item
        console.log("fff:", info)
        if (this.checkLoginStatus()) {
            if (info.rightItems[0].projectType == 102) {
                // url: '/pages/me/patients/addPatient',
                wx.navigateTo({
                    url: '../../consult/detail-tel/index?rightsId=' + info.rightsId + '&userId=' + info.doctorUserId + '&status=' + info.status.value,
                })
            } else if (info.rightItems[0].projectType == 103) {
                wx.navigateTo({
                    url: '../../consult/detail-video/index?rightsId=' + info.rightsId + '&userId=' + info.doctorUserId + '&status=' + info.status.value,
                })
            } else {
                wx.navigateTo({
                    url: '../../consult/detail-text/index?rightsId=' + info.rightsId + '&userId=' + info.doctorUserId + '&status=' + info.status.value,
                })
            }
        }
    },

    //查看是否评价
    getAppraiseByOrderId(orderId) {
        WXAPI.getAppraiseByOrderId(orderId).then(res => {
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
                    rateBtnText: '去评价'
                })
            }
        })
    },

    //去评价
    goRate() {
        if (this.data.isRated) {
            wx.navigateTo({
                url: `/pages/home/rate/doctor?rightsId=${this.data.order.rightsId}&id=${this.data.rateId}`
            })
        } else {
            wx.navigateTo({
                url: `/pages/home/rate/doctor?rightsId=${this.data.order.rightsId}`
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

    /**
     * 再次咨询跳医生详情
     * @param {} event 
     */
    onDoctorTap(event) {
        // const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: `/packageDoc/pages/doctor/info/index?id=${this.data.order.doctorUserId}&title=${this.data.order.doctorUserName}`
        })
    },

    toPay(e) {
        let that = this
        var orderId = e.currentTarget.dataset.id
        var orderType = e.currentTarget.dataset.ordertype
        console.log('toPay Detail', orderType)
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
        console.log('buyAgain detail', e)

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