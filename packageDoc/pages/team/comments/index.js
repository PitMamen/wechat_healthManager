const WXAPI = require('../../../../static/apifm-wxapi/index')
const Config = require('../../../../utils/config')

Page({
    data: {
        navBarHeight: null,
        statusBarHeight: null,
        id: null,
        title: '',
        show: false,
        loading: false,
        info: {},
        activeItem: {},
        activepItem: {},
        comments: [],
        pageNo: 1,
        pageSize: 5,
        total: 0,
        commodityId: '',

        list: []
    },
    onLoad: function (options) {
        console.log('comments-info options', options)
        this.setData({
            commodityId: options.commodityId,
        })

        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.setData({
            id: options.id,
            title: options.title,
            navBarHeight: getApp().globalData.navBarHeight,
            statusBarHeight: getApp().globalData.statusBarHeight
        })
        // this.setData()
        this.getInfo()
        this.getComments()
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.setData({
            loading: false
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
        this.setData({
            pageNo: 1
        })
        this.getComments()
    },
    onReachBottom: function () {
        // 页面触底时执行
        if (this.data.comments.length == this.data.total) {
            return
        }
        this.setData({
            pageNo: this.data.pageNo + 1
        })
        this.getComments()
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

    getInfo() {
        WXAPI.goodsDetail({
            commodityId: this.data.commodityId
        }).then((res) => {
            res.data = res.data || {}
            this.setData({
                info: res.data,
            })

            wx.setNavigationBarTitle({ //TODO
                title: this.data.info.commodityName || '',
            })

            this.setData({
                isOnSale: res.data.saleStatus ? res.data.saleStatus.value == 2 : false, //1下架、2上架
            })
            if (!this.data.isOnSale) {
                wx.showToast({
                    title: '该商品已下架',
                    icon: 'none'
                })
            }
        })
    },
    goBack() {
        wx.navigateBack({
            delta: 1
        });
    },
    getComments() {
        wx.showLoading({
            title: '加载中',
        })
        WXAPI.getDocComments({
            status: 2,
            serviceType: 1,
            commodityId: this.data.commodityId,
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize
        }).then((res) => {
            wx.hideLoading()
            if (this.data.pageNo == 0) {
                this.setData({
                    total: res.data.totalRows
                })
            }

            res.data.rows.forEach(element => {
                element.createTime = element.createTime.substring(0, 10)
                if (element.userName.length == 2) {
                    element.userName = element.userName.substring(0, 1) + '*'
                } else if (element.userName.length == 3) {
                    element.userName = element.userName.substring(0, 1) + '**'
                } else if (element.userName.length == 4) {
                    element.userName = element.userName.substring(0, 1) + '***'
                }
            });

            if (this.data.pageNo == 0) {
                this.setData({
                    comments: res.data.rows
                })
            } else {
                this.setData({
                    comments: this.data.comments.concat(res.data.rows)
                })
            }

        })
    },
    getClassName(code) {
        const name = {
            '101': 'image',
            '102': 'phone',
            '103': 'video'
        } [code + '']
        return name || 'other'
    },
    onBackTap() {
        wx.navigateBack({})
    },
    onMoreTap() {
        this.setData({
            show: true
        })
    },
    closePopup() {
        this.setData({
            show: false
        })
    },

    onGoodTap(event) {
        const item = event.currentTarget.dataset.item
        const pitem = event.currentTarget.dataset.pitem
        this.setData({
            activeItem: item,
            activepItem: pitem
        })
    },

})