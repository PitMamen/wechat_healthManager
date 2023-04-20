const WXAPI = require('../../../static/apifm-wxapi/index')
const WXPAY = require('../../../utils/pay')
const MoneyUtils = require('../../../utils/MoneyUtils')
const shopCarUtil = require('../../../utils/shopCarUtil')
const Util = require('../../../utils/util')
const Config = require('../../../utils/config')
Page({
    data: {
        totalScoreToPay: 0,
        goodsList: [],
        isNeedLogistics: 0, // 是否需要物流信息
        yunPrice: 0,
        allGoodsAndYunPrice: 0,
        goodsJsonStr: "",
        orderType: "",
        isBuying: false,
        remark: '',
        shopIndex: -1,
        pageIsEnd: false,
        checked: false,
        noDoc: true,
        chooseDayIndex: 0,
        isNurseSource: false,
        sericeItem: {},
        hidePatientShow: true,
        workingList: [],
        docList: [],

        orderId: '', //下单后的订单id

    },

    async doneShow() {
        if (this.data.orderType == "buyNow") {
            //立即购买下单
            var buyNowInfo = wx.getStorageSync('buyNowInfo');
            console.log("哈哈哈：", buyNowInfo)
            if (buyNowInfo) {
                this.setData({
                    goodsList: buyNowInfo
                });
            }
            this.shippingCarPrice()
            //判断是否为护士号源套餐
            let chooseOne = this.data.goodsList[0].goodsDetail.goodsAttr.find((item) => {
                return item.attrTypeName
            })
            console.log(chooseOne)
            if (chooseOne && chooseOne.plusInfo && chooseOne.plusInfo.whoDeal  && chooseOne.plusInfo.whoDeal == 'nurse') {
                this.setData({
                    isNurseSource: true,
                    sericeItem: chooseOne
                });
                this.getWeekData(this.data.sericeItem.attrName)
            }

            
        }

    },

    async getWeekData(serviceType) {
        const postData = {
            "serviceType": serviceType,
        }
        console.log(postData)
        const res = await WXAPI.getScheduleNumberForWeek(postData)
        if (res.code == 0) {
            console.log('postData', res)
            this.setData({
                workingList: res.data
            });
            this.data.workingList.forEach((item, index) => {
              
                item.checked = index == 0
                item.active = item.number > 0
            })

            
          
            this.getDayData(this.data.workingList[0].dateStr)
        }

    },

    async getDayData(date) {

        var today= Util.formatTime2(new Date()) 
        console.log("today",today)

        const postData = {
            "dateStr": date,
            "serviceType": this.data.sericeItem.attrName,
        }
        console.log('postDataDate', postData)
        const res = await WXAPI.getScheduleNumberForDay(postData)
        if (res.code == 0) {
          
            var docList=Object.entries(res.data)
            console.log('postDataResData', docList)
            if (today === date) {
                //如果是当天  剔除已过期的号源
               docList.forEach(item => {
                    var dateList=[]
                    item[1].forEach(inside => {
                        console.log(inside.sche_preriod,this.CompareDate(inside.sche_preriod))
                       if (this.CompareDate(inside.sche_preriod)) {
                        dateList.push(inside)
                       }                 
                    })
                   item[1]=dateList
                })

                var docList2=[]
                docList.forEach(item => {
                    if (item[1].length>0) {
                        docList2.push(item)
                    }
                })
                docList=docList2
            }
          
            this.setData({
                docList: docList,
                noDoc:this.data.length===0
            });
         
            

            console.log('dddff', this.data.docList)
        }

    },
   //比较号源和当前时间的大小 如：8:00
   CompareDate: function (t1) {
  
    var date = new Date();

    var a = t1.split(":");

    date.setHours(a[0])
    date.setMinutes(a[1])
    date.setMilliseconds(0)
    console.log(date)
    return date >= new Date();

},
    onClickDate(e) {
        this.setData({
            chooseDayIndex: e.currentTarget.dataset.index
        });
        //有号源，需请求数据
        if (e.currentTarget.dataset.item.number > 0) {
            this.setData({
                noDoc: false
            });
            this.getDayData(e.currentTarget.dataset.item.dateStr)
        } else { //无号源，显示无数据
            this.setData({
                noDoc: true
            });
        }
        console.log('onClickDate', e)
    },

    onClickSource(e) {
        console.log('onClickSource', e)
        this.setData({
            docIndex: e.currentTarget.dataset.selectIndex,
            sourceIndex: e.currentTarget.dataset.index,
        });
        console.log('docList', this.data.docList)
        console.log('docIndex', this.data.docIndex)
        console.log('sourceIndex', this.data.sourceIndex)
        // let num = this.data.docIndex + 1
        //这里不是加1后的，而是1
        console.log('onClickSourceItem', this.data.docList[this.data.docIndex][1][this.data.sourceIndex])

    },

    onLoad(e) {
        this.setData({
            orderType: e.orderType,
        })

        this.doneShow()
    },
    onShow() {
        if (this.data.pageIsEnd) {
            return
        }
        this.setData({
            patientList: wx.getStorageSync('userInfo').account.user,
        })

        if (!this.data.defaultPatient) {
            this.setData({
                defaultPatient: getApp().getDefaultPatient()
            })
        }

        var names = []
        this.data.patientList.forEach(item => {
            names.push(item.userName)
        })
        this.setData({
            nameColumns: names
        })
    },
    shippingCarPrice() {
        var allPrice = 0
        this.data.goodsList.forEach(item => {

            var p = MoneyUtils.accMul(item.goodsDetail.price, item.number)
            allPrice = MoneyUtils.moneyFormatDecimal(MoneyUtils.accAdd(allPrice, p), 2)

        })
        this.setData({
            allGoodsAndYunPrice: allPrice
        })
    },
    onCheckChange(event) {
        this.setData({
            checked: event.detail,
        });
        if (this.data.checked) {
            this.goConsentPage()
        }
    },
    goConsentPage() {
        wx.navigateTo({
            url: '../consent/index?type=1&showbtn=true',
        })
    },
    getDistrictId: function (obj, aaa) {
        if (!obj) {
            return "";
        }
        if (!aaa) {
            return "";
        }
        return aaa;
    },
    remarkChange(e) {
        this.data.remark = e.detail.value
    },

    async createOrder(e) {
        if (!this.data.defaultPatient) {
            wx.showToast({
                title: '就诊人不能为空',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (!this.data.checked) {
            wx.showToast({
                title: '请阅读并同意知情同意书',
                icon: 'none',
                duration: 2000
            })
            return
        }
        console.log('docListSub', this.data.docList)
        console.log('docIndexSub', this.data.docIndex)
        if (this.data.goodsList[0].goodsDetail.belong == '1150001' && this.data.isNurseSource && !(this.data.docIndex || this.data.docIndex == 0) && !(this.data.sourceIndex || this.data.sourceIndex == 0)) {
            wx.showToast({
                title: '请选择号源',
                icon: 'none',
                duration: 2000
            })
            return
        }
        //如果是风湿科 判断是否需要审核资料 
        if (this.data.goodsList[0].goodsDetail.belong === '1030810') {
            if (this.data.goodsList[0].goodsDetail.goodsClassInfo.limitFlag && this.data.goodsList[0].goodsDetail.goodsClassInfo.limitFlag == 1) { //==1 待申请  进入资料审核界面 上传图片
                this.checkApply()
            } else {
                //直接购买
                this.buliduBuyNow()
            }
        } else {
            //直接购买
            this.buliduBuyNow()
        }


    },


    //购买
    async buliduBuyNow() {
        console.log("isBuying", this.data.isBuying)
        if (this.data.isBuying) {
            return
        }
        this.setData({
            isBuying: true
        })
        if (this.data.orderType == "buyNow") { //立即下单
            var orderSubList = []
            var orderGoodsName = this.data.goodsList[0].goodsDetail.goodsName;
            if (this.data.goodsList.length > 1) {
                orderGoodsName = orderGoodsName + "等" + this.data.goodsList.length + '件商品'
            }

            var orderGoodsNum = 0;
            this.data.goodsList.forEach(buyNowInfo => {
                // orderGoodsName=orderGoodsName+','+buyNowInfo.goodsDetail.goodsName
                orderGoodsNum = orderGoodsNum + buyNowInfo.number

                const orderSub = {
                    goodsId: buyNowInfo.goodsDetail.goodsId,
                    goodsName: buyNowInfo.goodsDetail.goodsName,
                    number: buyNowInfo.number,
                    price: buyNowInfo.goodsDetail.price,
                    total: MoneyUtils.accMul(buyNowInfo.goodsDetail.price, buyNowInfo.number)
                }
                orderSubList.push(orderSub)
            })

            var postData = {
                orderSubList: orderSubList,
                payMoney: this.data.allGoodsAndYunPrice,
                patientId: this.data.defaultPatient.userId,
                userId: wx.getStorageSync('userInfo').account.accountId,
            };

            //护士号源  appointTime 排班id;resouceId 排班明细id TODO
            if (this.data.goodsList[0].goodsDetail.belong == '1150001' && this.data.isNurseSource) {
                // let num = this.data.docIndex + 1
                //这里不是加1后的，而是1
                let onClickSourceItem = this.data.docList[this.data.docIndex][1][this.data.sourceIndex]
                postData.appointTime = onClickSourceItem.schedule_id
                postData.resouceId = onClickSourceItem.schedule_detail_id
            }

            console.log("下单postData：", postData)
            let that = this

            WXAPI.mealCreateOrder(postData).then(function (res) {
                that.setData({
                    orderId: res.data.orderId
                })
                //去支付
                that.wxpay(res.data.orderId, orderGoodsName, 1)

                that.clearShopCar()


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

        }
    },



    async checkApply() {
        //先调用接口 判断审核状态 如果状态不通过 否则直接 跳转至套餐购买须知界面  上传图片 审核  
        var postData = {
            "applyType": 1,
            "targetId": this.data.goodsList[0].goodsDetail.belong,
            "userId": this.data.defaultPatient.userId
        }
        const result = await WXAPI.qryApplystatus(postData) //查看审核状态
        // console.log("审核状态:",result)
        if (result.code == 0) {
            //  待申请  跳转至 服务套餐购买须知界面    0审核中/1审核通过/2审核不通过/3待申请
            if (result.data.status == 3) {
                this.buyKnow()
            } else if (result.data.status == 0) {
                wx.showModal({
                    title: '资料审核中',
                    content: '尊敬的用户您好,您的审核申请已提交,工作人员正在努力审核中,审核通过后,即可购买该服务套餐',
                    showCancel: false,
                    success(res) {}
                })
            } else if (result.data.status == 1) { //直接购买
                this.buliduBuyNow()
            } else if (result.data.status == 2) { //审核不通过 重新提交审核资料 跳转至上传图片界面
                wx.showToast({
                    title: '审核失败,请重新提交资料',
                    icon: 'fail',
                    duration: 2000
                })
                this.buyKnow()
            }
        }
    },


    //风湿科的 审核不通过的  直接跳转至 套餐购买须知界面
    buyKnow: function () {
        wx.navigateTo({
            url: '../purchase-instructions/buyknow?userId=' + this.data.defaultPatient.userId + '&targetId=' + this.data.goodsList[0].goodsDetail.belong,
        })
    },


    clearShopCar() {

        this.data.goodsList.forEach(buyNowInfo => {

            shopCarUtil.deleteOneById(buyNowInfo.goodsDetail.goodsId)
        })
    },


    wxpay(order_id, goodsName, number) {
        let that = this
        // WXPAY.pay(this.data.allGoodsAndYunPrice, order_id, buyNowInfo.goodsDetail.goodsName, buyNowInfo.number, 0)
        WXPAY.pay(this.data.allGoodsAndYunPrice, order_id, goodsName, 1, 0)
            .then(function () {
                console.log("支付成功：")
                that.buySuccess()
            }).catch(function (error) {
                console.log(error)
                wx.showToast({
                    title: '支付失败',
                    icon: 'error',
                    duration: 2000,
                    success: function () {
                        wx.redirectTo({
                            url: '/pages/me/order/order-list',
                        })
                    }
                })
                that.setData({
                    isBuying: false
                })
            });

    },

    buySuccess() {
        wx.showToast({
            title: '购买成功',
            icon: 'success',
            duration: 2000
        })
        if (this.data.goodsList[0].goodsDetail.belong == '1150001' && this.data.isNurseSource) {
            console.log('buySuccessNur', this.data.isNurseSource)
            this.goWenjuanPage(WXAPI.getAPI_BASE_URL() + Config.getConstantData().JingshenQuestionnaire + '?userId=' + this.data.defaultPatient.userId)
        } else {
            console.log('buySuccessOrder', this.data.isNurseSource)
            wx.redirectTo({
                url: '/pages/me/order/order-detail?orderId=' + this.data.orderId + '&fromtype=1',
            })
        }
    },

    //问卷
    goWenjuanPage(url) {
        var encodeUrl = encodeURIComponent(url)
        console.log(encodeUrl)
        wx.redirectTo({
            url: '../webpage/index?url=' + encodeUrl
        })
    },

    jiaBtnTap(e) {

        const index = e.currentTarget.dataset.index;
        const item = this.data.goodsList[index]
        const number = item.number + 1
        item.number = number
        this.setData({
            goodsList: this.data.goodsList
        })
        this.shippingCarPrice()
    },
    jianBtnTap(e) {

        const index = e.currentTarget.dataset.index;
        const item = this.data.goodsList[index]
        const number = item.number - 1
        if (number <= 0) {
            // 弹出删除确认
            wx.showModal({
                content: '商品数量要大于0',
            })
            return
        }
        item.number = number
        this.setData({
            goodsList: this.data.goodsList
        })
        this.shippingCarPrice()
    },
    changeCarNumber(e) {
        // const key = e.currentTarget.dataset.key
        const num = e.detail.value
        const index = e.currentTarget.dataset.index;
        const item = this.data.goodsList[index]

        item.number = num
        this.setData({
            goodsList: this.data.goodsList
        })
        this.shippingCarPrice()
    },
    bindPatientTap: function () {

        this.setData({
            hidePatientShow: false
        })


    },
    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
        if (selectPatient.userId !== this.data.defaultPatient.userId) {

            this.setData({
                defaultPatient: selectPatient,
            });
            //保存默认就诊人
            wx.setStorageSync('defaultPatient', this.data.defaultPatient)
        }




        this.setData({
            hidePatientShow: true
        });

    },

    onPatientPickerCancel() {
        // this.setData({
        //   hidePatientShow: true
        // })
        wx.navigateTo({
            url: '/pages/me/patients/addPatient',
        })
    },
    closePatientTap: function () {
        this.setData({
            hidePatientShow: true
        })
    },
    async initShippingAddress() {
        const res = await WXAPI.defaultAddress()
        if (res.code == 0) {
            this.setData({
                curAddressData: res.data.info
            });
        } else {
            this.setData({
                curAddressData: null
            });
        }
        this.processYunfei();
    },
    processYunfei() {
        var goodsList = this.data.goodsList
        if (goodsList.length == 0) {
            return
        }
        const goodsJsonStr = []
        var isNeedLogistics = 0;

        let inviter_id = 0;
        let inviter_id_storge = wx.getStorageSync('referrer');
        if (inviter_id_storge) {
            inviter_id = inviter_id_storge;
        }
        for (let i = 0; i < goodsList.length; i++) {
            let carShopBean = goodsList[i];
            if (carShopBean.logistics || carShopBean.logisticsId) {
                isNeedLogistics = 1;
            }

            const _goodsJsonStr = {
                propertyChildIds: carShopBean.propertyChildIds
            }
            if (carShopBean.sku && carShopBean.sku.length > 0) {
                let propertyChildIds = ''
                carShopBean.sku.forEach(option => {
                    propertyChildIds = propertyChildIds + ',' + option.optionId + ':' + option.optionValueId
                })
                _goodsJsonStr.propertyChildIds = propertyChildIds
            }
            if (carShopBean.additions && carShopBean.additions.length > 0) {
                let goodsAdditionList = []
                carShopBean.additions.forEach(option => {
                    goodsAdditionList.push({
                        pid: option.pid,
                        id: option.id
                    })
                })
                _goodsJsonStr.goodsAdditionList = goodsAdditionList
            }
            _goodsJsonStr.goodsId = carShopBean.goodsId
            _goodsJsonStr.number = carShopBean.number
            _goodsJsonStr.logisticsType = 0
            _goodsJsonStr.inviter_id = inviter_id
            goodsJsonStr.push(_goodsJsonStr)

        }

        this.setData({
            isNeedLogistics: isNeedLogistics,
            goodsJsonStr: JSON.stringify(goodsJsonStr)
        });
        this.createOrder();
    },
    addAddress: function () {
        wx.navigateTo({
            url: "/pages/address-add/index"
        })
    },
    selectAddress: function () {
        wx.navigateTo({
            url: "/pages/select-address/index"
        })
    },
    bindChangeCoupon: function (e) {
        const selIndex = e.detail.value;
        this.setData({
            curCoupon: this.data.coupons[selIndex],
            curCouponShowText: this.data.coupons[selIndex].nameExt
        });
        this.processYunfei()
    },
    bindChangeCouponShop: function (e) {
        const selIndex = e.detail.value;
        const shopIndex = e.currentTarget.dataset.sidx
        const shopList = this.data.shopList
        const curshop = shopList[shopIndex]
        curshop.curCoupon = curshop.coupons[selIndex]
        curshop.curCouponShowText = curshop.coupons[selIndex].nameExt
        shopList.splice(shopIndex, 1, curshop)
        this.setData({
            shopList
        });
        this.processYunfei()
    },
    radioChange(e) {
        this.setData({
            peisongType: e.detail.value
        })
        this.processYunfei()
        if (e.detail.value == 'zq') {
            this.fetchShops()
        }
    },
    cancelLogin() {
        wx.navigateBack()
    },
    async fetchShops() {
        const res = await WXAPI.fetchShops()
        if (res.code == 0) {
            let shopIndex = this.data.shopIndex
            const shopInfo = wx.getStorageSync('shopInfo')
            if (shopInfo) {
                shopIndex = res.data.findIndex(ele => {
                    return ele.id == shopInfo.id
                })
            }
            this.setData({
                shops: res.data,
                shopIndex
            })
        }
    },
    shopSelect(e) {
        this.setData({
            shopIndex: e.detail.value
        })
    },

    callMobile() {
        const shop = this.data.shops[this.data.shopIndex]
        wx.makePhoneCall({
            phoneNumber: shop.linkPhone,
        })
    },


    deductionScoreChange(event) {
        this.setData({
            deductionScore: event.detail,
        })
        this.processYunfei()
    },
    deductionScoreClick(event) {
        const {
            name
        } = event.currentTarget.dataset;
        this.setData({
            deductionScore: name,
        })
        this.processYunfei()
    },
})