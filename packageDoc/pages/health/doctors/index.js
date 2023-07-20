const WXAPI = require('../../../../static/apifm-wxapi/index')


Page({
    data: {
        show1: false,
        show2: false,
        id: null,
        keyWords: '',
        activeId: null,
        activeName: '',
        mainActiveIndex: 0,
        professionalTitle: '',
        list: [],
        items: [],
        columns: []
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.setData({
            id: options.id
        })
        this.getLists()
        // this.getItems()
        // this.getColumns()
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

    getLists() {
        WXAPI.commodityOptionalDoctors({
            types: [1],
            commodityId: this.data.id
        }).then((res) => {
            this.setData({
                list: res.data || []
            })
        })
    },
    getItems() {
        WXAPI.treeMedicalSubjects(null).then((res) => {
            const items = (res.data || []).map(item => {
                return {
                    text: item.subjectClassifyName,
                    children: (item.children || []).map(subItem => {
                        return {
                            id: subItem.subjectClassifyId,
                            text: subItem.subjectClassifyName
                        }
                    })
                }
            })
            this.setData({
                items
            })
        })
    },
    getColumns() {
        WXAPI.professionalTitles({
            type: 1
        }).then((res) => {
            const columns = (res.data || []).map(item => {
                return {
                    id: item.value,
                    text: item.value
                }
            })
            this.setData({
                columns
            })
        })
    },
    onInputChange(event) {
        this.getLists()
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
        const item = event.currentTarget.dataset.item
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage.setData({
            docId: item.userId,
            docName: item.userName
        })
        wx.navigateBack({})
    },
    onKeShiClickNav(event) {
        this.setData({
            mainActiveIndex: event.detail.index || 0
        })
    },
    onKeShiClickItem(event) {
        this.setData({
            show1: false,
            activeId: event.detail.id,
            activeName: event.detail.text
        })
        this.getLists()
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
        this.setData({
            show2: false,
            professionalTitle: event.detail.value.text
        })
        this.getLists()
    }
})
