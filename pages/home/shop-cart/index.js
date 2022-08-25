const WXAPI = require('../../../static/apifm-wxapi/index.js')
const shopCarUtil = require('../../../utils/shopCarUtil')
const MoneyUtils = require('../../../utils/MoneyUtils')

Page({
  data: {
    goodsList:[],
    price:0,
 
    allSelect: false,
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = (750 / 2) / (w / 2)
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function () {
    this.initEleWidth();
  
  },
  onShow: function () {
    this.setData({
      goodsList:shopCarUtil.getStorageShopCar()
    })
    this.shippingCarPrice()
    console.log(this.data.goodsList)
  },
  onUnload:function(){

    shopCarUtil.setStorageShopCar(this.data.goodsList)
  },
  onHide:function(){
    shopCarUtil.setStorageShopCar(this.data.goodsList)
  },

  shippingCarPrice(){
    var allPrice=0
    console.log(this.data.goodsList)
    var allSelectedNum=0
   this.data.goodsList.forEach(item=>{
     if(item.selected){
      var p=MoneyUtils.accMul(item.goodsDetail.price,item.number)
      allPrice=MoneyUtils.moneyFormatDecimal(MoneyUtils.accAdd(allPrice,p),2)
      allSelectedNum=allSelectedNum+1
     }

   })

     this.setData({
       allSelect:allSelectedNum == this.data.goodsList.length
     })
  

   this.setData({
     price:allPrice
   })
  },
/**
   * 去结算
   */
  buyNow: function (e) {

    var buyNowInfo=[]

    this.data.goodsList.forEach(item=>{
      if(item.selected){
        buyNowInfo.push(item)
      }
 
    })
    if(buyNowInfo.length==0){
      return
    }
 
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    wx.navigateTo({
      url: '../to-pay-order/index?orderType=buyNow',
    })
  },

  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  onClickButton(){
    
  },
  touchS: function (e) {
    console.log("touchS")
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    console.log("touchM")
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      this.data.goodsList[index].left = left
      this.setData({
        goodsList: this.data.goodsList
      })
    }
  },

  touchE: function (e) {
    console.log("touchE")
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      this.data.goodsList[index].left = left
      this.setData({
        goodsList: this.data.goodsList
      })
    }
  },
   delItem(e) {
    const index = e.currentTarget.dataset.index;
    this.delItemDone(index)
  },
   delItemDone(index) {
    shopCarUtil.deleteOne(index)
    this.setData({
      goodsList:shopCarUtil.getStorageShopCar()
    })
    this.shippingCarPrice()
   wx.showToast({
     title: '删除成功',
   })
  },
   jiaBtnTap(e) {
   
    const index = e.currentTarget.dataset.index;
    const item = this.data.goodsList[index]
    const number = item.number + 1
    item.number=number
    this.setData({
      goodsList:this.data.goodsList
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
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.delItemDone(index)
          }
        }
      })
      return
    }
    item.number=number
    this.setData({
      goodsList:this.data.goodsList
    })
    this.shippingCarPrice()
  },
  changeCarNumber(e) {
    // const key = e.currentTarget.dataset.key
    const num = e.detail.value
    const index = e.currentTarget.dataset.index;
    const item = this.data.goodsList[index]
 
    item.number=num
    this.setData({
      goodsList:this.data.goodsList
    })
    this.shippingCarPrice()
  },
   radioClick(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.goodsList[index]
    console.log(item)
 
    item.selected=!item.selected
   
    this.setData({
      goodsList:this.data.goodsList,
    })
    this.shippingCarPrice()

  },
  allRadioClick(e){
    this.setData({
      allSelect:!this.data.allSelect
    })
    this.data.goodsList.forEach(item=>{
      item.selected=this.data.allSelect
    })
    this.setData({
      goodsList:this.data.goodsList
    })
    this.shippingCarPrice()
  },
  onChange(event) {
    this.setData({
      shopCarType: event.detail.name
    })
    this.shippingCarInfo()
  }
})