const WXAPI = require('../static/apifm-wxapi/index')
const MoneyUtils = require('../utils/MoneyUtils')

/**
 * 支付
 * @param {*} order_id 订单ID
 * @param {*} order_type 订单类型
 */
var pay =function pay( order_id ,order_type,goods_price) {
    //如果支付金额为0 则不需要支付
      if(goods_price == 0){
        return new Promise(function (resolve, reject) {
          resolve();
        })
       
    }
      goods_price = MoneyUtils.accMul(goods_price,100)  
    
      const postData = { 
        orderType:order_type,
        orderId: order_id,
        payMethod:'weixin_miniapp'
      }
      console.log("smallWxPay 参数:",postData)
      return new Promise(function (resolve, reject) {
        WXAPI.registerPayOrder(postData).then(function (res) {
          if (res.code == 0) {
    
              // 发起支付
              wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.packageStr,
                signType: 'MD5',
                paySign: res.data.paySign,
                fail: function (aaa) {
                  reject(aaa);
                },
                success: function () {
                  resolve();
                  //支付回调 测试用
                  // WXAPI.manualNotify(order_id) .then(function(res){
                  //   if(res.code==0){
                  //     resolve();
                  //   }else{
                  //     reject(res.message);
                  //   }
                  // })
                }
              })
    
    
    
          } else {
            reject(res.message);
          }
        });
    
      });
    }
/**
 * 海鹚支付
 * @param {*} total_fee 商品价格 数字类型
 * @param {*} payOrderId 订单ID
 * @param {*} goods_name 商品名称
 * @param {*} current_num 商品数量
 */
var hizpay =function hizpay(current_num, goods_name, payOrderId, total_fee) {
    //如果支付金额为0 则不需要支付
      if(total_fee == 0){
        return new Promise(function (resolve, reject) {
          resolve();
        })
       
    }
    total_fee =  MoneyUtils.accMul(total_fee,100)  
    
      const postData = {
        openid: wx.getStorageSync('userInfo').account.openId,
        total_fee: String(total_fee) ,
        payOrderId: payOrderId,
        goods_name: goods_name,
        current_num: String(current_num),
      }
      console.log("smallWxPay 参数:",postData)
      return new Promise(function (resolve, reject) {
        WXAPI.smallHizPay(postData).then(function (res) {
          if (res.code == 0) {
    
              // 发起支付
              wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.packageStr,
                signType: 'MD5',
                paySign: res.data.paySign,
                fail: function (aaa) {
                  reject(aaa);
                },
                success: function () {
                  resolve();
                  //支付回调 测试用
                  // WXAPI.manualNotify(order_id) .then(function(res){
                  //   if(res.code==0){
                  //     resolve();
                  //   }else{
                  //     reject(res.message);
                  //   }
                  // })
                }
              })
    
    
    
          } else {
            reject(res.message);
          }
        });
    
      });
    }
module.exports = {

  pay: pay,
  hizpay:hizpay
}