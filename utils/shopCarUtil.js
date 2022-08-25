
/**
 * 加入购物车
 */
function add(goodsDetail,number){
  var goods={}
  goods.goodsDetail=goodsDetail
  goods.number=number
  goods.selected=true

 var goodsList= wx.getStorageSync('shopcar')
 if(goodsList){

  var pushed=false
  goodsList.forEach(item => {
   if(item.goodsDetail.goodsId == goodsDetail.goodsId){
    item.number=item.number+number
    item.selected=true
    pushed=true
   }
 });
 if(!pushed){
  goodsList.push(goods)
 }

 }else{ 
   goodsList=[]
  goodsList[0]=goods
 }
  
  
 
  wx.setStorageSync('shopcar', goodsList)
}
/**
 * 删除
 */
function deleteOne(index){


 var goodsList= wx.getStorageSync('shopcar')

 if(goodsList && index > -1){
  goodsList.splice(index,1);
  }  
  

  wx.setStorageSync('shopcar', goodsList)
}
/**
 * 删除
 */
function deleteOneById(goodsId){


  var goodsList= wx.getStorageSync('shopcar')
  var delindex=-1
  if(goodsList){
    goodsList.forEach((item,index)=>{
      if(item.goodsDetail.goodsId == goodsId){
        delindex=index
      }
    })
    if(delindex > -1){
      goodsList.splice(delindex,1);
      } 
   
  }
   
 
   wx.setStorageSync('shopcar', goodsList)
 }
/**
 * 保存列表
 */
function setStorageShopCar(goodsList){
   wx.setStorageSync('shopcar', goodsList)
 }
/**
 * 获取列表
 */
function getStorageShopCar(){
  return wx.getStorageSync('shopcar')
}

module.exports = {
  add,
  deleteOne,
  setStorageShopCar,
  getStorageShopCar,
  deleteOneById
}
