const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/MoneyUtils')
const WXPAY = require('../../../utils/pay')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        curAddressData: "",
        custName: "",
        tel: "",
        dataInfo: null,
        dataillist: [],
        ReceivingAddressDetail: "",
        takeyouself: false,  //自取
        express_Issued: false, //快递代发
        payStata: '',  //支付状态/  /状态代码;0未下单/1待付款/8待发货/2已完成/5已取消
        orderId:'',//下单时生成的
        tradeId:'',//工单号
        defaultPatient: '',
        isShowing_self:true,
        isShowing_ex:true,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       
        this.setData({
            preNo:options.preNo,
            defaultPatient: getApp().getDefaultPatient()
        })
       
        this.getPreDetail()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    async getPreDetail() {
        const res = await WXAPI.preDetail({
            preNo: this.data.preNo
        })
      
            this.setData({
                dataInfo: res.data || {},
                payStata:(res.data || {}).medicalOrder.status
            })
        
        
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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


    //自取
    takeyouself() {
        if (this.data.isShowing_self) {
            wx.showModal({
                showCancel: false,
                title: '提示',
                confirmText:'我已知晓',
                content: '请选择药房自取的病友患者,携带诊疗卡或者电子处方凭证,前往取药,周一至周六正常上班时间均可,节假日以门诊开放时间为准',
            })
        }
        this.setData({
            takeyouself: true,
            express_Issued: false,
            isShowing_self:false
        })
       
       
    },

    //快递代发
    express_Issued() {
        if (this.data.isShowing_ex) {
            wx.showModal({
                showCancel: false,
                title: '提示',
                confirmText:'我已知晓',
                content: '代发快递取药方式为平台下单快递,付款方式为快递到付,到付金额:湖南省内12元,省外23元(此价格为预估价格,具体价格以快递公司给出的价格为准)',
            })
        }
        this.setData({
            express_Issued: true,
            takeyouself: false,
            isShowing_ex:false
        })
       
       
    },

//防抖动
debounced: false,
    //缴费
    async goPay() {


        // if (!this.data.takeyouself && !this.data.express_Issued) {
        //     wx.showModal({
        //         showCancel: false,
        //         title: '提示',
        //         content: '请选择取药方式',
        //     })
        //     return
        // }
       

        if (this.data.express_Issued && !this.data.ReceivingAddressDetail&&!this.data.dataInfo.address) {
            wx.showToast({
                title: '请选择地址!',
                icon: "none",
                duration: 2000
            })
            return
        }


        var that = this;

        if (that.debounced) {
            return
        }
        that.debounced = true
        setTimeout(() => {
            that.debounced = false
        }, 9000)


        // 下单 支付
        console.log("orderId===:", this.data.dataInfo.orderId )
        if (this.data.payStata == 0 ) { //未下单
                //先下单 再付款
                this.mealCreateHizOrder()
        } else if(this.data.payStata == 1){  //待支付   
            that.toPay( this.data.dataInfo.medicalOrder.orderId, this.data.dataInfo.medicalOrder.orderType, this.data.dataInfo.medicalOrder.orderTotal)
        }
    },






    //下单
    mealCreateHizOrder() {
        let that = this    
        const postData = {
            addressInfo:{
                "address": this.data.express_Issued?this.data.ReceivingAddressDetail:'',
                "deliverType": this.data.express_Issued?2:1,
                "mobile": this.data.express_Issued?this.data.curAddressData.telNumber:'',
                "name":this.data.express_Issued?this.data.curAddressData.userName:'',
            },
            preNo: this.data.dataInfo.preNo,

        };
        console.log("下单postData：", postData)

        WXAPI.createPrescriptionOrder(postData).then(function (res) {
            if (res.code == 0) {
                that.data.dataInfo.medicalOrder.orderId=res.data.orderId
                that.data.dataInfo.medicalOrder.status=1
                that.setData({
                    dataInfo: that.data.dataInfo,
                    payStata: 1,
                })
                that.toPay( res.data.orderId, res.data.orderType, that.data.dataInfo.medicalOrder.orderTotal)

            }
        }).catch(function (error) {
            console.log("error", error)
            wx.showToast({
                title: error.message ? error.message : '下单失败',
                icon: "none",
                duration: 2000

            })
            that.setData({
                isBuying: false
            })
        });
    },
    toPay(orderId,ordertype,money) {
      
       
        WXPAY.pay( orderId,ordertype,money)
            .then(function () {
                console.log("支付成功：")
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                })
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1,
                      })
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
  












    //获取收货地址
    getMyReceiving_address() {
        let lest = this
        wx.chooseAddress({
            success(res) {
                lest.setData({
                    curAddressData: res,
                    custName: res.userName,
                    ReceivingAddressDetail: res.provinceName + res.cityName + res.countyName + res.detailInfo,
                })

                console.log(res.userName)
                console.log(res.postalCode)
                console.log(res.provinceName)
                console.log(res.cityName)
                console.log(res.countyName)
                console.log(res.detailInfo)
                console.log(res.nationalCode)
                console.log(res.telNumber)
            }
        })
    },
})