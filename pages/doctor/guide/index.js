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
        isCollect :false, //0收藏/1取消
        activeItem: {},
        activepItem: {},
        comments: [],
        list: []
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.setData({
            id: options.id,
        })
        
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

    checkAll(event) {

        wx.navigateTo({
            url: `/pages/doctor/comments/index?id=${this.data.id}&title=${this.data.title}`
        })
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
            wx.setNavigationBarTitle({
                title: res.data.userName,
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
    getComments() {
        WXAPI.getDocComments({
            status: 2,
            serviceType: 1,
            doctorUserId: this.data.id,
            pageNo: 1,
            pageSize: 5
        }).then((res) => {
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
            this.setData({
                comments: res.data.rows
            })
            
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

    async goCollect() {
        var userInfoSync = wx.getStorageSync('userInfo')
     
        var requestData = {
            favouriteType: 1,
            operationType: this.data.isCollect ? 1 : 0, //0收藏/1取消
            targetId:  this.data.id,
            userId: userInfoSync.accountId,
        }
        console.log("doctor_id:", requestData)
        const res = await WXAPI.doCollect(requestData)
        if (res.code == 0) {
            wx.showToast({
                title: this.data.isCollect ?'已取消关注':'已关注',
                icon: 'success',
                duration: 2000
            })
            this.setData({
                isCollect: !this.data.isCollect
            })
          
        }
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