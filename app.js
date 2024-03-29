// app.js
const WXAPI = require('./static/apifm-wxapi/index')
const IMUtil = require('./utils/IMUtil')
const Config = require('./utils/config')
const UserManager = require('./utils/UserManager')
import bus from './utils/EventBus.js'

App({
    onLaunch(ret) {

        this.updateApp()

        wx.setInnerAudioOption({
            obeyMuteSwitch: false,
            success: function (res) {
                console.log('开启静音模式下播放音乐的功能');
            },
            fail: function (res) {
                console.log('静音设置失败');
            }
        });

        //实例化腾讯TRTC callManager
        require.async('./subpackage-call/TUICallKit/serve/callManager.js').then(res => {
            wx.CallManager = new res.CallManager();
        }).catch(({ mod, errMsg }) => {
            console.error(`path: ${mod}, ${errMsg}`)
        })

        // ---------------检测navbar高度
        let menuButtonObject = wx.getMenuButtonBoundingClientRect();
        console.log("小程序胶囊信息", menuButtonObject)
        wx.getSystemInfo({
            success: res => {
                let statusBarHeight = res.statusBarHeight,
                    navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
                    navBarHeight = menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2,
                    navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2; //导航高度
                this.globalData.navHeight = navHeight;
                this.globalData.navTop = navTop;
                this.globalData.windowHeight = res.windowHeight;
                this.globalData.menuButtonObject = menuButtonObject;
                this.globalData.statusBarHeight = statusBarHeight;
                this.globalData.navBarHeight = navBarHeight;
                console.log("navHeight", navHeight);
            },
            fail(err) {
                console.log(err);
            }
        })

        if (ret.path !== 'pages/login/auth') {
            var urlWithArgs = ret.path + '?';
            for (var key in ret.query) {
                var val = ret.query[key]
                urlWithArgs += key + '=' + val + '&'
            }
            urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
            //保存转发页面
            wx.setStorageSync('routPage-w', urlWithArgs);
            console.log('app.js-onShow:' + urlWithArgs)


            this.WXloginForLogin()

        }

        //监听IM登录成功
        bus.on('IMLoginSuccess', (msg) => {
            // 支持多参数
            console.log("监听IM登录成功", msg)


            //实例化腾讯TRTC callManager
            if (wx.CallManager) {
                wx.CallManager.destroyed()
            }
            require.async('./subpackage-call/TUICallKit/serve/callManager.js').then(res => {
                wx.CallManager = new res.CallManager();
                wx.CallManager.init({
                    sdkAppID: getApp().globalData.sdkAppID,
                    userID: getApp().globalData.IMuserID,
                    userSig: getApp().globalData.IMuserSig,
                    globalCallPagePath: 'subpackage-call/pages/globalCall/globalCall',
                });
            }).catch(({ mod, errMsg }) => {
                console.error(`path: ${mod}, ${errMsg}`)
            })


        })

       
    },



    //声明周期函数--监听页面显示
    onShow: function (ret) {
        wx.setKeepScreenOn({
            keepScreenOn: true,
        })

    },

    //登录时获取code
    WXloginForLogin() {

        //清除本地用户信息 然后获取用户信息
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('defaultPatient')


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
                    wx.hideLoading()
                }
            }, fail(e) {
                wx.hideLoading()
            }
        })
    },
    //登录
    async loginQuery(e) {



        const res = await WXAPI.loginQuery({
            code: e,
            appId: wx.getAccountInfoSync().miniProgram.appId
        })
        wx.hideLoading()
        // res.code = 10003
        if (res.code == 0) {
            // this.loginSuccess(res.data)
            this.getMaLoginInfo(res.data)

        } else if (res.code == 10003) { //用户不存在 
            let routPage = wx.getStorageSync('routPage-w');
            
                //排除不需要登录的页面
                if (!Config.checkNoLoginPage(routPage)) {
                    console.log("app.js： 需要登录的页面 ")
                    if (!this.globalData.reLaunchLoginPage) {
                        console.log("app.js： 跳转到登录页  /pages/login/auth")
                        this.globalData.reLaunchLoginPage = true
                        wx.reLaunch({
                            url: '/pages/login/auth',
                        })
                    }


                } else {
                    console.log("app.js： 不需要登录的页面 删除routPage-w")
                    wx.removeStorageSync('routPage-w')
                }
            


        } else {
            wx.showModal({
                title: '登录失败',
                content: '请点击右上角，选择重新进入小程序',
                showCancel: false,
            })
        }
        this.getAiAccount()
    },
    //获取登录信息 主要是获取默认机构的就诊人
    getMaLoginInfo(userInfo) {
        //保存用户信息
        wx.setStorageSync('userInfo', userInfo)
        //保存此账户所有就诊人
        wx.setStorageSync('allPatientList', userInfo.account.user)
        //IM apppid
        this.globalData.sdkAppID = userInfo.account.imAppId

        WXAPI.getMaLoginInfo({})
            .then(res => {
                if (res.code == 0 && res.data.loginStatus == '1') {
                   
                    var currentHospital = {
                        tenantId: res.data.tenantId,
                        hospitalCode: res.data.hospitalCode,
                        hospitalName: res.data.hospitalName,
                        hospitalLevelName: res.data.hospitalLevelName
                    }
                    getApp().globalData.currentHospital = currentHospital
                    //保存此账户改机构下的就诊人
                    UserManager.savePatientInfoList(res.data.patients)
                    var defaultPatient = wx.getStorageSync('defaultPatient')
                    if (defaultPatient) {
                        IMUtil.LoginOrGoIMChat(defaultPatient.userId, defaultPatient.userSig)
                    }                  
                }
                this.globalData.loginReady = true
                //发送事件 登录成功
                bus.emit('loginSuccess', true)
        
                let routPage = wx.getStorageSync('routPage-w');
                console.log("登录成功，重新加载页面" + routPage)
        
                //排除不需要登录的页面
                if (!Config.checkNoLoginPage(routPage)) {
                    wx.reLaunch({
                        url: '/' + routPage
                    });
                }
                wx.removeStorageSync('routPage-w')
            })
    },
    loginSuccess(userInfo) {

        //保存用户信息
        wx.setStorageSync('userInfo', userInfo)
        //IM apppid
        this.globalData.sdkAppID = userInfo.account.imAppId

        if (userInfo.account.user && userInfo.account.user.length > 0) {
            var defaultPatient = userInfo.account.user[0]
            userInfo.account.user.forEach(item => {
                if (item.isDefault) {
                    defaultPatient = item
                }
            })
            //保存默认就诊人
            // wx.setStorageSync('defaultPatient', defaultPatient)
            // IMUtil.LoginOrGoIMChat(defaultPatient.userId, defaultPatient.userSig)

        }
        this.globalData.loginReady = true
        //发送事件 登录成功
        bus.emit('loginSuccess', true)

        let routPage = wx.getStorageSync('routPage-w');
        console.log("登录成功，重新加载页面" + routPage)


        //排除不需要登录的页面
        if (!Config.checkNoLoginPage(routPage)) {
            wx.reLaunch({
                url: '/' + routPage
            });

        }
        wx.removeStorageSync('routPage-w')

    },
    updateApp() {

        // 获取小程序更新机制兼容
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开',
                        })
                    })
                }
            })
        }
    },

 

        //获取机器人ID
     getAiAccount() {
        console.log('getAiAccount获取机器人ID')
           WXAPI.getAiAccount().then(res=>{
            if (res.code == 0) {
                getApp().globalData.AIUserID = res.data
            }
           })
           
    
        },

    //获取用户信息
    getAccountInfo() {
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo && userInfo.account && userInfo.account.accountId) {
            if (!userInfo.account.user || userInfo.account.user.length === 0) {
                wx.navigateTo({
                    url: '/packageSub/pages/me/patients/addPatient'
                })

            }
            return userInfo
        } else {
            //如果没有用户信息就跳转登录
            wx.navigateTo({
                url: '/pages/login/auth',
            })
            return null
        }
    },
    //获取就诊人列表
    getPatientInfoList() {
        const userInfo = wx.getStorageSync('userInfo')

        if (userInfo && userInfo.account && userInfo.account.user) {
            return userInfo.account.user
        } else {
            return []
        }

    },
    //获取默认就诊人
    getDefaultPatient() {
        const userInfo = wx.getStorageSync('userInfo')
        const defaultPatient = wx.getStorageSync('defaultPatient')
        if (userInfo && userInfo.account && userInfo.account.accountId) {
            console.log(defaultPatient)
            if (defaultPatient && defaultPatient.userId) {
                return defaultPatient
            } else {
                wx.navigateTo({
                    url: '/packageSub/pages/me/patients/addPatient',
                })
                return null
            }
        } else {
            //如果没有用户信息就跳转登录
            wx.navigateTo({
                url: '/pages/login/auth',
            })
            return null
        }

    },

    //获取权益类型和名称
    getRightsType(type) {
        var rithtType = ''

        if (getApp().globalData.rightTypeList.length > 0) {
            getApp().globalData.rightTypeList.forEach(item => {
                if (item.code === type) {
                    rithtType = item
                }
            })
        }
        return rithtType
    },
    // 监听全局变量变化
    watch: function (variate, method) {
        var obj = this.globalData;
        let val = obj[variate];// 单独变量来存储原来的值
        Object.defineProperty(obj, variate, {
            configurable: false,
            enumerable: true,
            set: function (value) {
                val = value;// 重新赋值
                method(variate, value);// 执行回调方法
            },
            get: function () {
                // 在其他界面调用getApp().globalData.variate的时候，这里就会执行。
                return val; // 返回当前值
            }
        })
    },



    globalData: {
        //腾讯云IM
        //线上 appid: 1400547247  
        //测试 appid: 1400613243   
        //演示 appid: 1400684981   
        sdkAppID: '',
        IMuserID: '',
        IMuserSig: '',
        sdkReady: false,
        AIUserID:'',//机器人ID

        loginReady: false,//登录状态
        reLaunchLoginPage: false,//已调整到登录页

        unreadServerMessageCount: 0,//个案和客服未读消息数

        yljgdm: '444885559',//医疗机构代码
        remindedRights: [],//提醒过的权益
        rightTypeList: [],//权益类型列表
        currentHospital: {
            tenantId: '',
            hospitalCode: '',
            hospitalName: '',
            hospitalLevelName: ''
        },//当前切换的医疗机构
        consultPageActive: -1,//跳转到服务页面传的tab值
    },
    bedApplyInfo: null,//床位预约申请
    technologyAppointInfo: null,//医技预约申请
    tim: null,//腾讯云IM实例
    jyxq: null,//检验详情
    jcxq: null,//检查详情
    rightsDetail: null,//权益详情
    extraData: null,//使用权益跳转互联网医院小程序的参数（风湿科提交成功）
    followInfo: null,//随访登记详情

})



