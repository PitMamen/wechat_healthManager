const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        mainActiveIndex: 0,
        items: [
            {
                text: '疾病管理',
                children: [
                ]
            },
            {
                text: '远程监护',
                children: [
                ]
            }
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

    onTaoCanTap(event) {
        console.log(event)
        wx.navigateTo({
          url: `/pages/health/detail/index?id=${123}&title=${456}`
        })
    },
    onClickNav(event) {
        console.log(event)
        this.setData({
            mainActiveIndex: event.detail.index || 0
        })
    }
})
