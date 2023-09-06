const WXAPI = require('../../../../static/apifm-wxapi/index')
const WXPAY = require('../../../../utils/pay')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        preNo:'',//处方号
        list:[1,1,1],
        time: 30 * 60 * 1000,
        detail:{},
        status:-1,//状态代码;0未下单/1待付款/8待发货/2已完成/5已取消
        checkStatus:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            preNo:options.preNo
        })
      
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
        this.getPreDetail()
        
    },
    async getPreDetail() {
        const res = await WXAPI.preDetail({
            preNo: this.data.preNo
        })
      
            this.setData({
                checkStatus:res.data.medicalInfo.checkStatus,
                detail: res.data || {},
                status:(res.data || {}).medicalOrder.status
            })

            if(this.data.checkStatus==1){
                wx.showModal({
                    title: '温馨提示',
                    content: '该处方正在审核中,审核通过后即可进行支付',
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }
                    }
                })
            }
        
        
    },
    onBuyClick(){
        if(this.data.status == 0){ //未下单
            wx.navigateTo({
                url: './drugtaking_page?preNo='+this.data.detail.preNo,
              })
        }else {//待支付
            this.toPay( this.data.detail.medicalOrder.orderId, this.data.detail.medicalOrder.orderType, this.data.detail.medicalOrder.orderTotal)
        }

    },

    toPay(orderId,ordertype,money) {
        let that=this
        WXPAY.pay( orderId,ordertype,money)
            .then(function () {
                console.log("支付成功：")
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                })
                setTimeout(() => {
                    that.onShow()
                }, 2000)
              


            }).catch(function (error) {
                console.log(error)
                wx.showToast({
                    title: '支付失败',
                    icon: 'error',
                    duration: 2000,                
                })
            
            });

    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

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