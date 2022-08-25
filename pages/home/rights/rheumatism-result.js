const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')
Page({

    /**
     * 页面的初始数据
     */
    data: {
  
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("提交成功",options)
      this.setData({
        userId:options.userId,
        projectKey:options.projectKey
      })
      this.getDas28AndHqa(options.userId,options.projectKey)
    },
  
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
  
    },
        /**
      * 获取风湿问卷结果
      */
     async getDas28AndHqa(userId, projectKey) {
     

        const res = await WXAPI.getDas28AndHqa(userId, projectKey)
        
             this.setData({
                das28:res.data.das28,
                hqa:res.data.hqa,
             })
            

    },
    goIMPage(){
        wx.navigateToMiniProgram({
            appId: 'wxe0cbf88bcc095244',
            envVersion:Config.getConstantData().envVersion,
            path:'/pages/login/auth?type=FROMPROGRAM&action=1&userId='+this.data.userId,
            extraData:getApp().extraData,
            success(res) {
                wx.navigateBack({
                  delta: 1,
                })
              }
          })
    },
    goHome(){
      wx.switchTab({
        url: '/pages/home/main',
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
  
   
  })