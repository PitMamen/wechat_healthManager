const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        navBarHeight: null,
        statusBarHeight: null,
        id: null,//医生ID
        cmdId: null,//套餐ID
        tenantId: null,//租户ID
        hospitalCode: null,//机构ID
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
        
        if (options.scene) {
            //cmdId=套餐&docId=医生&tenantId=租户&hospitalCode=机构
            const scene = decodeURIComponent(options.scene)
            console.log(scene)
            console.log(scene.split('&'))
            this.setData({
                cmdId: scene.split('&')[0],
                id: scene.split('&')[1],
                tenantId: scene.split('&')[2],
                hospitalCode: scene.split('&')[2],
            })
        } else {
            this.setData({
                cmdId: options.cmdId,
                id: options.docId,
                tenantId: options.tenantId,
                hospitalCode: options.hospitalCode,
            })
        }
        this.getInfo()
        this.favouriteExistsForDoctorId()
    },
    onShow: function () {
        if (!getApp().globalData.loginReady) {
            this.WXloginForLogin()
        }
    },
    //登录时获取code
    WXloginForLogin() {
        wx.showLoading({
            title: '加载中',
        })

        let that = this
        wx.login({
            success(res) {
                console.log("WXlogin", res)
                if (res.code) {
                    that.loginQuery(res.code);
                } else {
                    wx.showToast({
                        title: '获取微信code失败',
                        icon: "none",
                        duration: 2000
                    })
                    wx.hideLoading()
                }
            }
        })
    },



    //登录
    async loginQuery(e) {

        let that=this

        const res = await WXAPI.loginQuery({
            code: e,
            appId: wx.getAccountInfoSync().miniProgram.appId
        })
        wx.hideLoading()
        if (res.code == 0) {
            that.loginSuccess(res.data)

        } else if (res.code == 10003) { //用户不存在
            if (!getApp().globalData.reLaunchLoginPage) {
               
                getApp().globalData.reLaunchLoginPage = true
                wx.navigateTo({
                    url: '/pages/login/auth?type=RELOGIN',
                })
            }

        } else {
            wx.showToast({
                title: '登录失败,请重试',
                icon: "none",
                duration: 2000
            })

        }
    },
    loginSuccess(userInfo) {

        //保存用户信息
        wx.setStorageSync('userInfo', userInfo)
        //IM apppid
        getApp().globalData.sdkAppID = userInfo.account.imAppId
        getApp().globalData.loginReady = true


        if (userInfo.account.user && userInfo.account.user.length > 0) {
            var defaultPatient = userInfo.account.user[0]
            userInfo.account.user.forEach(item => {
                if (item.isDefault) {
                    defaultPatient = item
                }
            })
            //保存默认就诊人
            wx.setStorageSync('defaultPatient', defaultPatient)
            IMUtil.LoginOrGoIMChat(defaultPatient.userId, defaultPatient.userSig)
        }


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
        WXAPI.giftCommodity({
            commodityId: this.data.cmdId
        }).then((res) => {
            this.setData({
                info: res.data || {},
                list: (res.data || {}).pkgConfigure || []
            })
            wx.setNavigationBarTitle({
                title: res.data.userName,
              })
          
        })
    },
    //是否已关注
    favouriteExistsForDoctorId() {
        WXAPI.favouriteExistsForDoctorId(this.data.id).then((res) => {
            this.setData({
                isCollect: res.data || false
            })
           
            if(!this.data.isCollect){
                //没有关注自动关注
                this.goCollect()
            }

        })
    },
  
   

     goCollect() {
        var userInfoSync = wx.getStorageSync('userInfo')
     
        var requestData = {
            favouriteType: 1,
            operationType: this.data.isCollect ? 1 : 0, //0收藏/1取消
            targetId:  this.data.id,
            userId: userInfoSync.accountId,
        }
        console.log("doctor_id:", requestData)
         WXAPI.doCollect(requestData).then((res) => {
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

        })
        
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


    onBuyClick() {
        getApp().globalData.currentHospital.hospitalCode =this.data.hospitalCode
        getApp().globalData.currentHospital.tenantId =this.data.tenantId
        
        const collectionIds = this.data.list.map(item=>{
            return item.collectionId
        })
        console.log(collectionIds)
        //判断是否是电话咨询
        const isTelType = this.data.list.some((element) => {
            return (element.projectType === 102);
        })
        if (isTelType) {
            wx.navigateTo({
                url: `/pages/doctor/telinfo/index?docId=${this.data.id}&commodityId=${this.data.info.commodityId}&collectionIds=${collectionIds.join(',')}`
            })
        } else {
            wx.navigateTo({
                url: `/pages/doctor/case/index?docId=${this.data.id}&commodityId=${this.data.info.commodityId}&collectionIds=${collectionIds.join(',')}`
            })
        }


    }
})