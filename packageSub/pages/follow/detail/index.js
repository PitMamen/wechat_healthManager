// packageSub/pages/follow/detail/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showSetDialog:false,
        showMessageDialog:true,
        scrollTopVal: 0,
        activeNumIndex:0,
        numsourcelist:[1,1,1,1,1,1,1,1,1]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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

    },
    chooseAppoint(e) {
        console.log(e)
        var index = e.currentTarget.dataset.index
        var item = e.currentTarget.dataset.item
        this.setData({
            activeNumIndex: index,
            activeNumItem: item
        })
       
    },
 
    onItemClick(e){
        var item = e.currentTarget.dataset.item
        wx.showModal({
          title: '消息提醒',
          content: '我是您的随访医生，请您术后遵照医嘱按时服药。',
          showCancel:false,
          confirmText:'我知道了',
          confirmColor:'#4294F7'
        })
    },
    onSettingClick(){
        this.setData({
            showSetDialog:true
        })
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