const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        show: false,
        loading: false,
        inputTxt: '',
        fileList: [
            {
                url: 'https://shangshanren.cn/mp/files/20221031/505800d55f2e45319bee32e6e0788566.png',
                // status: 'done'
            },
            {
                url: 'https://shangshanren.cn/mp/files/20221031/505800d55f2e45319bee32e6e0788566.png',
                status: 'done'
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

    afterRead(event) {
        const file = event.detail.file
        this.data.fileList.push(file)
        this.setData({
            fileList: this.data.fileList
        })
    },
    delete(event) {
        const index = event.detail.index
        this.data.fileList.splice(index, 1)
        this.setData({
            fileList: this.data.fileList
        })
    },
    closePopup() {
        this.setData({
            show: false
        })
    },
    onCancel() {
        this.setData({
            show: false
        })
    },
    onConfirm(event) {
        console.log(event)
        this.setData({
            show: false
        })
    },
    onSelectTap() {
        this.setData({
            show: true
        })
    },
    onRadioChange(event) {
        console.log(event)
    },
    onNextClick() {
        this.setData({
            loading: true
        })
        wx.navigateTo({
            url: `/pages/doctor/buy/index?id=${123}`
        })
    }
})
