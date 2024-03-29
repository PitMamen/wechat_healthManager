const WXAPI = require('../../../../static/apifm-wxapi/index')
const Config = require('../../../../utils/config')

Page({
    data: {
        loading: false,
        checked: false,
        id: null,
        userName: '',
        info: {},
        orderType:'',
    },
    onLoad: function (options) {
        console.log('buy index',options)
        // 页面创建时执行
        this.setData({
            id: options.id,
            userName: options.userName,
            orderType:options.orderType
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
    onCheckboxChange(event){
        this.setData({
            checked: event.detail,
          });
    },
    onCheckboxClick(){
        this.setData({
            checked: !this.data.checked,
          });
    },
    onSchemeTap() {
        wx.navigateTo({
            url: '/pages/home/consent/index?title=患者服务授权协议&type=1&showbtn=true'
        })
    },
    onBuyClick() {
        if (!this.data.checked) {
            wx.showToast({
                title: '请先阅读并同意《患者服务授权协议》',
                icon: 'none'
            })
            return
        }
        this.setData({
            loading: true
        })
        let that = this
     
        WXAPI.registerPayOrder({
            orderType:this.data.orderType,
            orderId: this.data.id,
            payMethod: 'weixin_miniapp'
        }).then((res) => {
            //payedFlag 订单支付标记;0请求微信支付/1订单已支付"
            if(res.payedFlag == 1){
                that.paySuccess()
            }else {
                wx.requestPayment({
                    timeStamp: res.data.timeStamp,
                    nonceStr: res.data.nonceStr,
                    package: res.data.packageStr,
                    signType: 'MD5',
                    paySign: res.data.paySign,
                    success() {
                        that.paySuccess()
                    },
                    fail(err) {
                        console.info(err)
                        
                        that.goOrderDetail()
                        that.setData({
                            loading: false
                        })
                    }
                })
            }

            
        })
    },

    goOrderDetail(){
        console.log('goOrderDetail',this.data.info)
        //订单类型 srvPackOrder 专科服务 consultOrder 咨询订单
        if (this.data.orderType == 'srvPackOrder') {
            wx.redirectTo({
                    url:  '/packageSub/pages/me/order/order-detail-special?orderId=' + this.data.id,
                })
        } else {
            wx.redirectTo({
                url:  '/packageSub/pages/me/order/order-detail-chat?orderId=' + this.data.id,
            })
        }
    },

    //支付成功
    paySuccess(){
        let that = this
            wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                
                that.goOrderDetail()
                
            }, 2000)
        
        
    }
})