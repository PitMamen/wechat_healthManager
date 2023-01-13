const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        show1: false,
        show2: false,
        keyWords: '',
        activeId: null,
        mainActiveIndex: 0,
        list: [1],
        items: [
            {
                text: '城市1',
                children: [
                    {
                        text: '温州1',
                        id: 1
                    },
                    {
                        text: '杭州1',
                        id: 2
                    },
                ]
            },
            {
                text: '城市2',
                children: [
                    {
                        text: '温州2',
                        id: 3
                    },
                    {
                        text: '杭州2',
                        id: 4
                    },
                ]
            }
        ],
        columns: [
            { text: '杭州', id: 1 },
            { text: '宁波', id: 2 },
            { text: '温州', id: 3 }
        ]
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    onShow: function () {
        // 页面出现在前台时执行
    },
    onReady: function () {
        // 页面首次渲染完毕时执行
    },
    onHide: function () {
        // 页面从前台变为后台时执行
    },
    onUnload: function () {
        // 页面销毁时执行
    },
    onPullDownRefresh: function () {
        // 触发下拉刷新时执行
    },
    onReachBottom: function () {
        // 页面触底时执行
    },
    onShareAppMessage: function () {
        // 页面被用户分享时执行
    },
    onPageScroll: function () {
        // 页面滚动时执行
    },
    onResize: function () {
        // 页面尺寸变化时执行
    },
    onTabItemTap(item) {
        // tab 点击时执行
    },

    onInputChange(event) {
        console.log(event)
    },
    onKeShiTap() {
        this.setData({
            show1: true
        })
    },
    onZhiJiTap() {
        this.setData({
            show2: true
        })
    },
    onDoctorTap(event) {
        console.log(event)
        wx.navigateTo({
          url: `/pages/doctor/info/index?id=${123}&title=${456}`
        })
    },
    onKeShiClickNav(event) {
        console.log(event)
        this.setData({
            mainActiveIndex: event.detail.index || 0
        })
    },
    onKeShiClickItem(event) {
        console.log(event)
        this.setData({
            show1: false
        })
    },
    closePopup() {
        this.setData({
            show2: false
        })
    },
    onZhiJiCancel() {
        this.setData({
            show2: false
        })
    },
    onZhiJiConfirm(event) {
        console.log(event)
        this.setData({
            show2: false
        })
    }
})
