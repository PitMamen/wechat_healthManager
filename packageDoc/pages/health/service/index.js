const WXAPI = require('../../../../static/apifm-wxapi/index')


Page({
    data: {
        mainActiveIndex: 0,
        currentHospital: {},
        children: [],
        items: [],
        mainActiveId:0,
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.setData({
            mainActiveId:options.id
        })
        this.getList()
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.setData({
            currentHospital: getApp().globalData.currentHospital || {}
        })
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

    getList() {
        WXAPI.classifyCommodities(null).then((res) => {
            const items = (res.data || []).map(item => {
                return {
                    ...item,
                    children: [],
                    id: item.classifyId,
                    text: item.classifyName
                }
            })
            this.setData({
                items,
            })
            if(this.data.mainActiveId){
                items.forEach((item,index)=>{
                    if(item.id+'' == this.data.mainActiveId){
                        this.setData({
                            mainActiveIndex:index,
                            children: item.classify || [] 
                        })
                    }
                })
            }else{
                this.setData({
                    children: items[this.data.mainActiveIndex].classify || []
                })
            }
           
        })
    },
    onClickNav(event) {
        const mainActiveIndex = event.detail.index || 0
        this.setData({
            mainActiveIndex,
            children: this.data.items[mainActiveIndex].classify || []
        })
    },
    onTaoCanTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: `/packageDoc/pages/health/detail/index?id=${item.commodityId}`
        })
    }
})
