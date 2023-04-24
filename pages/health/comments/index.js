const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

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

        list: []
    },
    onLoad: function (options) {
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
        // this.getInfo()
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
        WXAPI.doctorCommodities({
            doctorUserId: this.data.id
        }).then((res) => {
            this.setData({
                info: res.data || {},
                list: ((res.data || {}).commodities || []).map(item => {
                    return {
                        ...item,
                        className: this.getClassName(item.classifyCode)
                    }
                })
            })
            if (this.data.list.length > 0) {
                const pitem = this.data.list[0]
                if (pitem.pkgRules.length > 0) {
                    const item = pitem.pkgRules[0]
                    this.setData({
                        activeItem: item,
                        activepItem: pitem
                    })
                }
            }
        })
    },
    goBack() {
        wx.navigateBack({
            delta: 1
        });
    },
    getComments() {
        WXAPI.getDocComments({
            commodityId: this.data.id,
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize
        }).then((res) => {
            if (this.data.pageNo == 0) {
                this.setData({
                    total: res.data.totalRows
                })
            }

            res.data.rows.forEach(element => {
                element.createTime = element.createTime.substring(0, 10)
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
    onDetailTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: `/pages/doctor/detail/index?id=${item.commodityId}&docId=${this.data.id}&docName=${this.data.title}`
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
    onBuyClick() {
        if (!this.data.activeItem.collectionId) {
            wx.showToast({
                title: '请选择具体套餐',
                icon: 'error'
            })
            return
        }
        this.setData({
            loading: true
        })
        const collectionIds = (this.data.activepItem.compulsoryCollectionIds || []).concat([this.data.activeItem.collectionId])
        console.log("collectionIds=" + collectionIds)
        console.log("activepItem=", this.data.activepItem)
        //判断是否是电话咨询
        const isTelType = this.data.activepItem.pkgRules.some((element) => {
            return (element.serviceItemTypes[0] === 102);
        })
        if (isTelType) {
            wx.navigateTo({
                url: `/pages/doctor/telinfo/index?docId=${this.data.id}&commodityId=${this.data.activepItem.commodityId}&collectionIds=${collectionIds.join(',')}`
            })
        } else {
            wx.navigateTo({
                url: `/pages/doctor/case/index?docId=${this.data.id}&commodityId=${this.data.activepItem.commodityId}&collectionIds=${collectionIds.join(',')}`
            })
        }


    }
})