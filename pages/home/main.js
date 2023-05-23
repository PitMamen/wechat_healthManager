const WXAPI = require('../../static/apifm-wxapi/index')
const Util = require('../../utils/util')
const IMUtil = require('../../utils/IMUtil')
const Config = require('../../utils/config')
const MoneyUtils = require('../../utils/MoneyUtils')
const UserManager = require('../../utils/UserManager')
import bus from '../../utils/EventBus.js'
const APP = getApp()

Page({
    data: {
        currentHospital: {},
        topMenuList: [],
        midMenuList: [],
        slideWidth: '', //滑块宽
        slideLeft: 0, //滑块位置
        totalLength: '', //当前滚动列表总长
        slideShow: false, //滑块是否显示
        slideRatio: '', //滑块比例
        loadingHidden: false, // loading
        selectCurrent: 0,
        activeCategoryId: 0,
        scrollTop: 0,
        hidePatientShow: true,
        nameColumns: [],
        userInfo: null,
        defaultPatient: null,
        patientList: [],
        unreadMymessageCount: 0,//我的消息数
        taskList: [],//健康任务列表
        allTaskNum: [],//所有任务数
        serviceUserNum: 0,//专科服务人数
        serviceList: [],//专科服务列表
        goodsList: [],//商品列表
        articleList: [],//文章列表
        doctorList: [],//医生列表
        activeIndex: '0',//0是文章列表 1是医生列表
        lastConversation: null,
        healthRecordPercentage: '',//健康档案完成度
        rightsList: [],
        myRightsCount: 0,//我的权益数
        isMoreLoading: false,
        isArticleNoMore:false,
        articlePageSize:20,
        articlePageNo: 1,
        isDoctorNoMore:false,
        doctorPageSize:20,
        doctorPageNo: 1,
    },


    onLoad: function (options) {

        this.setData({
            navHeight: APP.globalData.navHeight,
            navTop: APP.globalData.navTop,
            windowHeight: APP.globalData.windowHeight,
            menuButtonObject: APP.globalData.menuButtonObject, //小程序胶囊信息

        })
        this.getRatio()
        wx.showShareMenu({
            withShareTicket: true,
        })

        //监听登录成功
        bus.on('loginSuccess', (msg) => {
            // 支持多参数
            console.log("监听登录成功", msg)
            this.getMaLoginInfo()
        })
        //监听机构切换
        bus.on('switchHospital', (msg) => {
            // 支持多参数
            console.log("监听机构切换", msg)

            this.getMaLoginInfo()
        })
        //监听个案管理师、客服未读消息
        bus.on('unreadServer', (msg) => {
            // 支持多参数
            // console.log("监听未读消息成功", msg)
            this.data.midMenuList.forEach(item => {
                if (item.menuName == '我的消息') {
                    item.unReadCount = msg
                }
            })
            this.setData({
                midMenuList: this.data.midMenuList
            })
        })
        if (options.type == 1) {
            //扫码用户进入首页 重新获取登录信息 
            this.getMaLoginInfo()
        }
        if (getApp().globalData.loginReady && !this.data.currentHospital.hospitalCode) {
            //如果已经登陆成功 而首页后面才生成
            this.getMaLoginInfo()
        }
    },
    onShow: function (e) {

        var userInfoSync = wx.getStorageSync('userInfo')

        if (!userInfoSync || userInfoSync === undefined) {
            //有2种情况：1、游客 2、正在登录还未返回数据
            console.log("无用户信息")
            if (getApp().globalData.currentHospital.hospitalCode) {
                this.setData({
                    currentHospital: getApp().globalData.currentHospital
                })
                this.getTdShopmallMainpageMenuList()
            }
            return
        }
        this.afterMaLogin()
    },
    //获取登录信息
    getMaLoginInfo() {

        WXAPI.getMaLoginInfo({})
            .then(res => {
                if (res.code == 0) {

                    if (res.data.loginStatus == '1') {

                        var currentHospital = {
                            tenantId: res.data.tenantId,
                            hospitalCode: res.data.hospitalCode,
                            hospitalName: res.data.hospitalName,
                            hospitalLevelName: res.data.hospitalLevelName
                        }
                        this.setData({
                            currentHospital: currentHospital
                        })
                        getApp().globalData.currentHospital = currentHospital

                        UserManager.savePatientInfoList(res.data.patients)

                        this.getTdShopmallMainpageMenuList()
                        this.afterMaLogin()
                    } else {
                        //没有选择机构
                        if (getApp().globalData.currentHospital.hospitalCode) {
                            this.setData({
                                currentHospital: getApp().globalData.currentHospital
                            })
                            this.getTdShopmallMainpageMenuList()
                        } else {
                            this.goHospitalSelectPage()
                        }


                    }

                }
            })
    },
    //获取到登录信息之后
    afterMaLogin() {
        this.getServiceCommodityClassInfo()
        this.getYouzanGoodsList()
        this.getDoctorLists()
        this.getArticleLists()

        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient'),
            patientList: wx.getStorageSync('userInfo').account.user,
            userInfo: wx.getStorageSync('userInfo').account
        })
        if (this.data.defaultPatient && this.data.defaultPatient.userId) {

            this.qryMyFollowTask()

            IMUtil.LoginOrGoIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig)
            IMUtil.getConversationList()
        } else {
            this.setData({
                taskList: []
            })
            this.data.midMenuList.forEach(item => {
                if (item.menuName == '我的消息') {
                    item.unReadCount = 0
                }
                if (item.menuName == '我的权益') {
                    item.unReadCount = 0
                }
            })
            this.setData({
                midMenuList: this.data.midMenuList
            })
        }
    },
    //菜单滑块
    getRatio() {
        if (this.data.midMenuList.length < 6) {
            this.setData({
                slideShow: false
            })
        } else {
            var windowWidth = wx.getSystemInfoSync().windowWidth;

            var _totalLength = this.data.midMenuList.length * 140; //分类列表总长度
            var _ratio = 80 / _totalLength * (750 / windowWidth); //滚动列表长度与滑条长度比例
            var _showLength = 702 / _totalLength * 80; //当前显示蓝色滑条的长度(保留两位小数)
            this.setData({
                slideWidth: _showLength,
                totalLength: _totalLength,
                slideShow: true,
                slideRatio: _ratio
            })
        }
    },
    //slideLeft动态变化
    getleft(e) {

        this.setData({
            slideLeft: e.detail.scrollLeft * this.data.slideRatio
        })
        console.log(this.data.slideLeft)
    },
    testBtn() {

        wx.navigateTo({
            url: '/pages/login/confirm-patient?ks=2350058&tenantId=100000&hospitalCode=444885559'
        })
    },


    //获取菜单列表
    getTdShopmallMainpageMenuList() {
        console.log("getTdShopmallMainpageMenuList")
        WXAPI.getTdShopmallMainpageMenuList({
            "hospitalCode": getApp().globalData.currentHospital.hospitalCode,
            "sysApplicationId": 4
        })
            .then(res => {
                if (res.code == 0) {
                    var topMenuList = []
                    var midMenuList = []

                    res.data.forEach(item => {
                        if (item.menuType == 1) {
                            topMenuList.push(item)
                        } else if (item.menuType == 2) {
                            midMenuList.push(item)
                        }

                    })
                    this.setData({
                        topMenuList: topMenuList,
                        midMenuList: midMenuList
                    })
                    this.getRatio()

                }
            })
    },

    //菜单点击
    topMenuClick(e) {
        var menu = e.currentTarget.dataset.menu
        console.log(menu)
        if (menu.jumpType == 1) { //小程序内部

            //判断是否需要校验登录
            if (Config.checkMenuLoginPage(menu.jumpUrl)) {

                if (this.checkLoginStatus()) {
                    if (getApp().getDefaultPatient()) {
                        wx.navigateTo({
                            url: menu.jumpUrl,
                        })
                    }
                }
            } else {
                wx.navigateTo({
                    url: menu.jumpUrl,
                })
            }

        } else if (menu.jumpType == 2) { //第三方小程序

            wx.navigateToMiniProgram({
                appId: menu.appId,
                path: menu.jumpUrl,
                envVersion: Config.getConstantData().envVersion,
            })

        } else if (menu.jumpType == 3) { //第三方链接
            this.goWenjuanPage(menu.jumpUrl)
        }
    },
    //文章和名医切换
    swichTab(e) {
        console.log(e)
        this.setData({
            activeIndex: e.currentTarget.dataset.index
        })
    },
    //文章和名医 更多
    goTabMorePage(e) {
        switch (this.data.activeIndex) {
            case '0':
                wx.navigateTo({
                    url: `/pages/home/news/news-list`
                })
                break;
            case '1':
                wx.navigateTo({
                    url: `/pages/doctor/search/index`
                })
                break;
        }
    },
    //专科服务点击
    onServiceItemClick(event) {
        var item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: '/pages/health/service/index?id=' + item.id,
        })
    },
    //点击文章
    onArticleTap(event) {
        var item = event.currentTarget.dataset.item

        wx.navigateTo({
            url: `/pages/home/news/news-detail?id=${item.articleId}`
        })
    },
    //点击医生
    onDoctorTap(event) {
        var item = event.currentTarget.dataset.item

        // wx.navigateTo({
        //     url: `/pages/doctor/info/index?id=${item.userId}&title=${item.userName}`
        // })
        wx.navigateTo({
            url: `/pages/doctor/guide/index?id=${item.userId}&title=${item.userName}`
        })
    },
    //我的消息
    goMyMessagePage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/packageIM/pages/chat-list/chat-list',
                    })
                }
            }
        }

    },


    goHospitalSelectPage() {
        wx.navigateTo({
            url: './hospital-select/index',
        })
    },
    goSchedulePage() {
        wx.switchTab({
            url: '/pages/schedule/index',
        })
    },

    async qryMyFollowTask() {
        const res = await WXAPI.qryMyFollowTask({ userId: this.data.defaultPatient.userId })
        var allTaskList = []
        var allTaskNum = 0
        if (res.code == 0 && res.data && res.data.length > 0) {

            allTaskNum = res.data.length

            res.data.forEach((item, index) => {
                if (index < 3) {//只显示3条
                    if (item.taskType.value == 1) {
                        //问卷
                        item.planType = "Quest"
                        item.planDescribe = item.jumpTitle
                        allTaskList.push(item)
                    } else if (item.taskType.value == 2) {
                        //文章
                        item.planType = "Knowledge"
                        item.planDescribe = item.jumpTitle
                        allTaskList.push(item)
                    } else if (item.taskType.value == 3) {
                        //消息提醒
                        item.planType = "Remind"
                        item.planDescribe = item.templateTitle
                        allTaskList.push(item)
                    }
                }

            })
        }


        this.setData({
            allTaskNum: allTaskNum,
            taskList: allTaskList
        })

    },
    //获取专科服务
    getServiceCommodityClassInfo() {

        WXAPI.getServiceCommodityClassInfo().then((res) => {
            this.setData({
                serviceUserNum: res.data.useCount || 0,
                serviceList: res.data.classList || []
            })
        })
    },
    //获取推荐商品
    getYouzanGoodsList() {

        WXAPI.getYouzanGoodsList({
            pageNo: 1,
            pageSize: 10,
        }).then((res) => {
            res.data.forEach(item => {
                item.price2 = MoneyUtils.accDiv(item.price, 100)
            })
            this.setData({
                goodsList: res.data || []
            })
        })
    },
    //获取医生列表
    getDoctorLists() {

        WXAPI.getAccurateDoctors({
            queryText: '',
            subjectClassifyId: '',
            professionalTitle: '',
            pageNo: this.data.doctorPageNo,
            pageSize: this.data.doctorPageSize,
        }).then((res) => {
            var resList=res.data.rows || []
            // var list = this.data.doctorList
            // list = list.concat(resList)
            this.setData({
                doctorList: resList,
                isMoreLoading: false,
                isDoctorNoMore:resList.length< this.data.doctorPageSize
            })
           
        })
    },
    //获取文章列表
    getArticleLists() {

        WXAPI.getArticleByClickNum({ pageSize: this.data.articlePageSize, pageNo: this.data.articlePageNo }).then((res) => {
            var resList=res.data.rows || []
            // var list = this.data.articleList
            // list = list.concat(resList)
            this.setData({
                articleList: resList,
                isMoreLoading: false,
                isArticleNoMore:resList.length< this.data.articlePageSize
            })

        })
    },

    //滚动到底部触发
    bindscrolltolower(e) {
        console.log("触发加载更多")
        if (this.data.isMoreLoading) {
            return
        }

        if (this.data.activeIndex == '0') {
            console.log('articleList.length='+this.data.articleList.length+'======='+'isArticleNoMore='+this.data.isArticleNoMore)
            if (this.data.articleList.length > 49 || this.data.isArticleNoMore) {
                return
            }
            this.setData({
                isMoreLoading: true,
                articlePageNo: this.data.articlePageNo + 1
            })
            this.getArticleLists()
        }else if (this.data.activeIndex == '1') {
            console.log('doctorList.length='+this.data.doctorList.length+'======='+'isDoctorNoMore='+this.data.isDoctorNoMore)
            if (this.data.doctorList.length > 49 || this.data.isDoctorNoMore) {
                return
            }
            this.setData({
                isMoreLoading: true,
                doctorPageNo: this.data.doctorPageNo + 1
            })
            this.getDoctorLists()
        }



    },

    //跳转到商城小程序首页
    goStoreListPage() {
        wx.navigateToMiniProgram({
            appId: Config.getConstantData().YouzanAPPID,
            envVersion: Config.getConstantData().envVersion,
        })
    },
    //调整到商城商品详情
    goStoreDetailPage(e) {
        var item = e.currentTarget.dataset.item
        wx.navigateToMiniProgram({
            appId: Config.getConstantData().YouzanAPPID,
            envVersion: Config.getConstantData().envVersion,
            path: item.page_url + '?alias=' + item.alias,
        })
    },
    //预约医技
    goTechnologyAppointPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateToMiniProgram({
                    appId: 'wxe0cbf88bcc095244',
                    envVersion: Config.getConstantData().envVersion,
                })
            }
        }

    },
    addPatientTap: function () {
        console.log('addPatientTap')
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: '../me/patients/addPatient',
            })
        }

    },
    //在线咨询
    goIMPage() {

        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/packageIM/pages/chat/AIChat',
                    })
                }
            }
        }

    },

    //随访我的待办 V2
    onTaskItemClickV2(e) {
        var task = e.currentTarget.dataset.item
        var type = task.planType
        //随访任务类
        if (type == 'Quest') {//问卷
            var url = task.jumpValue + '?userId=' + task.userId + '&recordId=' + task.id + '&modifyTaskBizStatus=yes'
            url = url.replace("/r/", "/s/")
            console.log("问卷", url)
            this.goWenjuanPage(url)
        } else if (type == 'Knowledge') {//文章
            wx.navigateTo({
                url: './news/news-detail?id=' + task.jumpId + '&recordId=' + task.id
            })
            // this.goWenjuanPage(task.jumpValue)
        } else if (type == 'Remind') {//消息
            wx.navigateTo({
                url: './health-remind/detail?userId=' + this.data.defaultPatient.userId + '&taskId=' + task.id
            })

        }
    },


    //问卷
    goWenjuanPage(url) {
        var encodeUrl = encodeURIComponent(url)
        console.log(encodeUrl)
        wx.navigateTo({
            url: '../home/webpage/index?url=' + encodeUrl
        })
    },

    goNewsListPage() {
        wx.navigateTo({
            url: './news/news-list',
        })
    },
    //我的权益
    goMyRightsPage() {

        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: './rights/index',
                })
            }
        }

    },


    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
        if (selectPatient.userId !== this.data.defaultPatient.userId) {
            this.setData({
                defaultPatient: this.data.patientList[index],
            });
            //保存默认就诊人
            wx.setStorageSync('defaultPatient', this.data.defaultPatient)
            wx.showToast({
                title: '切换成功',
                icon: 'success',
                duration: 2000
            })
            IMUtil.LoginOrGoIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig)
            this.onShow()
        }
        this.setData({
            hidePatientShow: true
        });

    },
    onPatientPickerCancel() {
        // this.setData({
        //   hidePatientShow: true
        // })
        wx.navigateTo({
            url: '/pages/me/patients/addPatient',
        })
    },
    bindPatientTap: function () {
        this.setData({
            hidePatientShow: false
        })
    },
    closePatientTap: function () {
        this.setData({
            hidePatientShow: true
        })
    },


    //消息订阅
    requestSubscribeMessage() {
        wx.requestSubscribeMessage({
            tmplIds: ['-rJe-p_wnicyWOHa-CkJjCObkh1XXPdnstKLOGd_rKM'],
            success(res) {
                console.log(JSON.stringify(res))
            },
            fail(e) {
                console.error(e)
            },
        })
    },


    toSelection() {
        wx.navigateTo({
            url: 'selection/selection?type=1',
        })
    },
    goPackageListPage() {
        wx.navigateTo({
            url: 'package-list/packagelist',
        })
    },
    goHealthRecords() {
        wx.navigateTo({
            url: './health-records/index',
        })
    },


    goNewsDetail(event) {
        var id = event.currentTarget.dataset.id

        wx.navigateTo({
            url: './news/news-detail?id=' + id,
        })
    },
    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
    goEmptyPage() {
        wx.showToast({
            title: '正在开发中',
            icon: 'none',
            duration: 2000
        })
    },

    checkLoginStatus() {
        if (getApp().globalData.loginReady) {
            return true
        } else {
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth',
                        })
                    }
                }
            })
            return false
        }

    }

})
