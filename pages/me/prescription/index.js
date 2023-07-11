const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const WXPAY = require('../../../utils/pay')
Page({

    /**
     * 页面的初始数据
     */
    data: {
    
        status: 1,
        // 0全部;1待付款、8待发货、2已完成、5已取消
        tabs: [
            {
                title: '待付款',
                status: 1
            },
            {
                title: '待发货',
                status: 8
            },
            {
                title: '已完成',
                status: 2
            },
            {
                title: '已取消',
                status: 5
            },{
                title: '全部',
                status: 0
            }
        ],
        orderList: [],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
     
        
    },
    onTabsChange(e) {
        console.log('onTabsChange', e)
        var status = e.detail.name
        this.setData({
            status: status
        })
        this.getPreList()

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        this.getPreList()

    },


    /**
     * 
     * @param {订单状态：0全部;1待付款、8待发货、2已完成、5已取消} status 
     */
    async getPreList() {
        const res = await WXAPI.preList({
            status: this.data.status
        })
        this.setData({
            orderList: res.data
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    goOrder(e) {
        var item = e.currentTarget.dataset.item
        
        wx.navigateTo({
            url: './detail?preNo=' + item.preNo,
            // url: './detail?preNo=' + 182,
        })
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
})