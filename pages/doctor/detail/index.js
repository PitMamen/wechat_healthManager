const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        isOnSale:false,
        navBarHeight: null,
        statusBarHeight: null,
        collectionId: null,
        id: null,
        docId: null,
        docName: '',
        name: '',
        loading: false,
        price: 0,
        list1: [],
        list2: [],
        images: [],
        swipers: []
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.setData({
            id: options.id,
            docId: options.docId,
            docName: options.docName,
            collectionId: options.collectionId,
            navBarHeight: getApp().globalData.navBarHeight,
            statusBarHeight: getApp().globalData.statusBarHeight
        })
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.setData({
            loading: false
        })
        this.getInfo()
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

    getInfo() {
        WXAPI.goodsDetail({
            commodityId: this.data.id
        }).then((res) => {
            res.data = res.data || {}
            this.setData({
                name: res.data.commodityName || '',
                list1: res.data.optionalPkgs || [],
                list2: res.data.compulsoryPkgs || [],
                images: res.data.detailImgs || [],
                swipers: res.data.bannerImgs || [],
                isOnSale:res.data.saleStatus?res.data.saleStatus.value==2 : false,//1下架、2上架
            })
              //第一个可选项默认勾选
              if(this.data.list1.length>0){
                this.setData({
                    collectionId: this.data.list1[0].collectionId
                })
            }
            this.setPrice()
            if(!this.data.isOnSale){
                wx.showToast({
                  title: '该商品已下架',
                  icon:'none'
                })
            }
        })
    },
    setPrice() {
        let price = this.data.list2.reduce((sum, item) => {
            return sum + item.totalAmount
        }, 0)
        if (this.data.collectionId){
            let select = this.data.list1.find(item => {
                return this.data.collectionId == item.collectionId
            })
            if (select){
                price += select.totalAmount
            }
        }
        price = new Number(price).toFixed(2)
        this.setData({
            price
        })
    },
    onBackTap() {
        wx.navigateBack({})
    },
    onItemClick(event){
        const item = event.currentTarget.dataset.item
        this.setData({
            collectionId: item.collectionId
        })
        this.setPrice()
    },
    onRadioChange(event) {
        const item = event.currentTarget.dataset.item
        this.setData({
            collectionId: item.collectionId
        })
        this.setPrice()
    },
    onSelectTap() {},
    onBuyClick() {
        if (!wx.getStorageSync('userInfo')){
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth?type=RELOGIN'
                        })
                    }
                }
            })
            return
        }
        if (!this.data.collectionId){
            wx.showToast({
                title: '请选择具体套餐',
                icon: 'error'
            })
            return
        }
        this.setData({
            loading: true
        })
        const collectionIds = [this.data.collectionId].concat(this.data.list2.map(item => {
            return item.collectionId
        }))
        wx.navigateTo({
            url: `/pages/doctor/case/index?docId=${this.data.docId}&commodityId=${this.data.id}&collectionIds=${collectionIds.join(',')}`
        })
    }
})
