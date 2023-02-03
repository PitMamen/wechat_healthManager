
const WXAPI = require('../../../static/apifm-wxapi/index')
const shopCarUtil = require('../../../utils/shopCarUtil')
Page({
  data: {
    createTabs: true, //绘制tabs
    tabs: [{
      tabs_name: '服务简介',  
      view_id: 'swiper-container',
      topHeight: 0
    }, {
      tabs_name: '服务详情',
      view_id: 'goods-des-info',
      topHeight: 0,
    }, {
      tabs_name: '服务评价',
      view_id: 'reputation',
      topHeight: 0,
    }],
    nameColumns: [],
    hidePatientShow: true,
    userInfo: null,
    defaultPatient: {},
    patientList: [],
    goodsList: [],//服务列表
    goodsIndex: 0,//选择的服务index
    goodsId: '',//选择的服务ID
    goodsDetail: {},//选择的服务
    hasMoreSelect: true,
    selectSizePrice: 0,
    selectSizeOPrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,

    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    faved: false,
  },
  bindscroll(e) {
    //计算页面 轮播图、详情、评价(砍价)view 高度
    this.getTopHeightFunction()
    var tabsHeight = this.data.tabsHeight //顶部距离（tabs高度）
    if (this.data.tabs[0].topHeight - tabsHeight <= 0 && 0 < this.data.tabs[1].topHeight - tabsHeight) { //临界值，根据自己的需求来调整
      this.setData({
        active: this.data.tabs[0].tabs_name //设置当前标签栏
      })
    } else if (this.data.tabs.length == 2) {
      this.setData({
        active: this.data.tabs[1].tabs_name
      })
    } else if (this.data.tabs[1].topHeight - tabsHeight <= 0 && 0 < this.data.tabs[2].topHeight - tabsHeight) {
      this.setData({
        active: this.data.tabs[1].tabs_name
      })
    } else if (this.data.tabs[2].topHeight - tabsHeight <= 0) {
      this.setData({
        active: this.data.tabs[2].tabs_name
      })
    }
  },
  onLoad(e) {

    console.log(e)
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
    this.setData({
      departmentId: e.departmentId,
      goodsClass: e.goodsClass,
      goodsId: e.goodsId,
    })


    // this.getGoodsDetail()
    this.queryGoodsList(this.data.departmentId, this.data.goodsClass)
  },

  async goodsAddition() {
    // const res = await WXAPI.goodsAddition(this.data.goodsId)
    // if (res.code == 0) {
    //   this.setData({
    //     goodsAddition: res.data,
    //     hasMoreSelect: true,
    //   })
    // }
  },

  onShow() {
    var userInfoSync = wx.getStorageSync('userInfo')
    if (userInfoSync) {
      this.setData({
        defaultPatient: wx.getStorageSync('defaultPatient'),
        userInfo: wx.getStorageSync('userInfo').account
      })
    }
    this.setData({
      createTabs: true //绘制tabs
    })
    //计算tabs高度
    // var query = wx.createSelectorQuery();
    // query.select('#tabs').boundingClientRect((rect) => {
    //   var tabsHeight = rect.height
    //   this.setData({
    //     tabsHeight: tabsHeight
    //   })
    // }).exec()


  },
  getTopHeightFunction() {
    var that = this
    var tabs = that.data.tabs
    tabs.forEach((element, index) => {
      var viewId = "#" + element.view_id
      that.getTopHeight(viewId, index)
    });
  },
  getTopHeight(viewId, index) {
    var query = wx.createSelectorQuery();
    query.select(viewId).boundingClientRect((rect) => {
      if (!rect) {
        return
      }
      let top = rect.top
      var tabs = this.data.tabs
      tabs[index].topHeight = top
      this.setData({
        tabs: tabs
      })
    }).exec()
  },
  //分类下的服务列表
  async queryGoodsList(departmentId, goodsClass) {
    const res = await WXAPI.queryGoodsList(departmentId, goodsClass)

    if (res.data) {

      this.setData({
        goodsList: res.data
      })
      if (this.data.goodsId) {//传递了商品ID
        res.data.forEach(function (goods, index) {
          if (goods.goodsId === this.data.goodsId) {
            this.setData({
              goodsIndex: index,
            })
          }
        })
      } else {//没有则默认显示第一条
        this.setData({
          goodsIndex: 0,
          goodsId: res.data[0].goodsId
        })
      }
      this.queryGoods()
    }
  },
  //服务详情
  async queryGoods() {
    const res = await WXAPI.queryGoods(this.data.goodsId)

    if (res.data) {
      var goods = res.data
      goods.bannerListArray = goods.goodsClassInfo.bannerList ? goods.goodsClassInfo.bannerList.split(",") : null
      goods.imgListArray = goods.goodsClassInfo.imgList ? goods.goodsClassInfo.imgList.split(",") : null
      goods.goodsAttr.forEach(item => {

        item.attrTypeName = getApp().getRightsType(item.attrName).value
      })

      this.setData({
        goodsDetail: goods,
      })

    }
  },
  //选择服务
  bindGoodsChooseTop(event) {
    var index = event.currentTarget.dataset.index
    if (index !== this.data.goodsIndex) {
      this.setData({
        goodsIndex: index,
        goodsId: this.data.goodsList[index].goodsId
      })
      this.queryGoods()
    }

  },
  bindLunboImg: function (e) {
    var url = e.currentTarget.dataset.index

    wx.previewImage({
      urls: this.data.goodsDetail.bannerListArray,
      current: url
    })
  },
  goShopCar: function () {
    wx.navigateTo({
      url: '../shop-cart/index',
    })

  },
  //加入购物车
  toAddShopCar: function () {

    shopCarUtil.add(this.data.goodsDetail, 1)
    wx.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 2000
    })

  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  toPingtuan: function (e) {

  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false,
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  stepChange(event) {
    this.setData({
      buyNumber: event.detail
    })
  },

  bindPatientTap: function () {
    if (this.data.defaultPatient) {
      this.setData({
        hidePatientShow: false
      })
    } else {
      wx.navigateTo({
        url: '../../me/patients/addPatient',
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
              url: '/pages/login/auth?type=RELOGIN',
            })
          }
        }
      })
      return false
    }

  },
  onPatientPickerConfirm(event) {
    console.log(event)
    var index = event.detail.index
    var selectPatient = this.data.patientList[index]
    if (selectPatient.userId !== this.data.defaultPatient.userId) {
      this.setData({
        defaultPatient: this.data.patientList[index],
      });
      //保存默认就诊人
      wx.setStorageSync('defaultPatient', this.data.defaultPatient)
      wx.showToast({
        title: '切换成功',
        icon: 'success',
        duration: 2000
      })
    }
    this.setData({
      hidePatientShow: true
    });

  },

  onPatientPickerCancel() {
    this.setData({
      hidePatientShow: true
    })
  },

  /**
   * 选择商品规格
   */
  async labelItemTap(e) {
    console.log(e)
    var goodsId = e.currentTarget.dataset.propertyindex
    // 取消该分类下的子栏目所有的选中状态
    this.data.properties.forEach(child => {

      if (child.goodsId == goodsId) {
        child.active = true
      } else {
        child.active = false
      }
    })

    this.setData({
      properties: this.data.properties,
      goodsId: goodsId
    })
    this.getGoodsDetail()
  },
  async calculateGoodsPrice() {
    // 计算最终的商品价格
    let price = this.data.goodsDetail.basicInfo.minPrice
    let originalPrice = this.data.goodsDetail.basicInfo.originalPrice
    let totalScoreToPay = this.data.goodsDetail.basicInfo.minScore
    let buyNumMax = this.data.goodsDetail.basicInfo.stores
    let buyNumber = this.data.goodsDetail.basicInfo.minBuyNumber
    if (this.data.shopType == 'toPingtuan') {
      price = this.data.goodsDetail.basicInfo.pingtuanPrice
    }
    // 计算 sku 价格
    if (this.data.canSubmit) {
      const token = wx.getStorageSync('token')
      const res = await WXAPI.goodsPriceV2({
        token: token ? token : '',
        goodsId: this.data.goodsDetail.basicInfo.id,
        propertyChildIds: this.data.propertyChildIds
      })
      if (res.code == 0) {
        price = res.data.price
        if (this.data.shopType == 'toPingtuan') {
          price = res.data.pingtuanPrice
        }
        originalPrice = res.data.originalPrice
        totalScoreToPay = res.data.score
        buyNumMax = res.data.stores
      }
    }
    // 计算配件价格
    if (this.data.goodsAddition) {
      this.data.goodsAddition.forEach(big => {
        big.items.forEach(small => {
          if (small.active) {
            price = (price * 100 + small.price * 100) / 100
          }
        })
      })
    }
    this.setData({
      selectSizePrice: price,
      selectSizeOPrice: originalPrice,
      totalScoreToPay: totalScoreToPay,
      buyNumMax,
      buyNumber: (buyNumMax > buyNumber) ? buyNumber : 0
    });
  },
  /**
   * 选择可选配件
   */
  async labelItemTap2(e) {
    const propertyindex = e.currentTarget.dataset.propertyindex
    const propertychildindex = e.currentTarget.dataset.propertychildindex

    const goodsAddition = this.data.goodsAddition
    const property = goodsAddition[propertyindex]
    const child = property.items[propertychildindex]
    if (child.active) {
      // 该操作为取消选择
      child.active = false
      this.setData({
        goodsAddition
      })
      this.calculateGoodsPrice()
      return
    }
    // 单选配件取消所有子栏目选中状态
    if (property.type == 0) {
      property.items.forEach(child => {
        child.active = false
      })
    }
    // 设置当前选中状态
    child.active = true
    this.setData({
      goodsAddition
    })
    this.calculateGoodsPrice()
  },

  addFav(e) {
    this.setData({
      faved: !this.data.faved
    })
  },
  /**
   * 立即购买
   */
  buyNow: function (e) {
    if (!this.checkLoginStatus()) {
      return
    }
    if(!getApp().getDefaultPatient()){
        return
    }
    this.buliduBuyNow()
    //如果是风湿科 判断是否需要审核资料 
    //     if (this.data.goodsDetail.belong === '2350010' ) {
    //   if (this.data.goodsDetail.goodsClassInfo.limitFlag == 1) {  //==1 待申请  进入资料审核界面 上传图片
    //     this.checkApply()
    //   } else {
    //     //直接购买
    //     this.buliduBuyNow()
    //   }
    // } else {
    //   //直接购买
    //   this.buliduBuyNow()
    // }

  },

  //购买操作
  buliduBuyNow() {
    var buyNowInfo = this.buliduBuyNowInfo()
    console.log(buyNowInfo)
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    wx.navigateTo({
      url: '../to-pay-order/index?orderType=buyNow',
    })
  },



  //风湿科的 审核不通过的  直接跳转至 套餐购买须知界面
  buyKnow: function () {
    wx.navigateTo({
      url: '../purchase-instructions/buyknow?userId=' + this.data.defaultPatient.userId + '&targetId=' + this.data.goodsDetail.belong,
    })
  },


  async checkApply() {
    //先调用接口 判断审核状态 如果状态不通过 否则直接 跳转至套餐购买须知界面  上传图片 审核  
    var postData = {
      "applyType": 1,
      "targetId": this.data.goodsDetail.belong,
      "userId": this.data.defaultPatient.userId
    }
    const result = await WXAPI.qryApplystatus(postData)  //查看审核状态
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
          success(res) {
          }
        })
      } else if (result.data.status == 1) {    //直接购买
        this.buliduBuyNow()
      } else if (result.data.status == 2) {   //审核不通过 重新提交审核资料 跳转至上传图片界面
        wx.showToast({
          title: '审核失败,请重新提交资料',
          icon: 'fail',
          duration: 2000
        })
        this.buyKnow()
      }
    }
  },





  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function () {

    var goods = {}
    goods.goodsDetail = this.data.goodsDetail;
    goods.number = 1


    var buyNowInfo = [];
    buyNowInfo.push(goods)



    return buyNowInfo;
  },





  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
    })
  },

  onShareAppMessage: function () {
    // 页面被用户转发
  },
  onShareTimeline: function () {
    // 页面被用户分享到朋友圈
  },

})