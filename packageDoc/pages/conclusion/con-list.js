const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
import bus from '../../../utils/EventBus.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '',
        type: '2',
        nuts: [{}, {}],
        time: 15 * 60 * 1000,
        broadClassify: 1, //1咨询服务类2服务套餐3健康商品
        blsqNum: 1,//病例授权提醒数

        orderList: [],

        recordId: '',
        defaultPatient: {},
        patientList: [],
        hidePatientShow: true,
        nameColumns: [],
        zzblList: [],
        blsqList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('***********con-list options', options)
        this.setData({
            recordId: options.recordId,
            patientList: wx.getStorageSync('userInfo').account.user,
            defaultPatient: wx.getStorageSync('defaultPatient'),
            type: options.type || '2'
        })

        this.setData({ //如果传了userId，就取传的，没有就取
            userId: options.userId ? options.userId : this.data.defaultPatient.userId,
        })

        //微信公众号消息跳进来可能出现传的userId不是当前默认就诊人的userId，所以这里要切换页面选择的就诊人
        if (this.data.userId && this.data.userId != this.data.defaultPatient.userId) {
            this.data.patientList.forEach((element, index) => {
                if (element.userId == this.data.userId) {
                    this.setData({
                        defaultPatient: this.data.patientList[index],
                    });
                    this.switchTabItem()
                }
            });
        }

        var names = []
        this.data.patientList.forEach(item => {
            names.push(item.userName)
        })
        this.setData({
            nameColumns: names
        })


        //监听登录成功
        bus.on('Success', (msg) => {
            // 支持多参数
            console.log("监听成功", msg)
            this.getMyCaseSyninfoOut()
        })


        this.switchTabItem()
        this.getMyCaseSyninfoOut()
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },

    onTabsChange(e) {
        console.log('onTabsChange', e)

        this.setData({
            type: e.detail.name
        })

        this.switchTabItem()

    },

    switchTabItem() {
        if (this.data.type === '0') {
            this.getMyCaseSyninfoOut()
        } else if (this.data.type === '1') {
            this.userCaseSyninfoList()
        } else if (this.data.type === '2') {
            this.getFollowList()
        }
    },


    bindPatientTap: function () {
        this.setData({
            hidePatientShow: false
        })
    },

    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
        if (selectPatient.userId != this.data.defaultPatient.userId) {
            this.setData({
                defaultPatient: this.data.patientList[index],
            });
            wx.showToast({
                title: '切换成功',
                icon: 'success',
                duration: 2000
            })
            this.switchTabItem()

        }
        this.setData({
            hidePatientShow: true
        });

    },
    onPatientPickerCancel() {
        this.setData({
            hidePatientShow: true
        })

    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    //转诊病历
    async userCaseSyninfoList() {

        if (this.data.defaultPatient && this.data.defaultPatient.userId) {

            const res = await WXAPI.userCaseSyninfoList({
                // userId: this.data.defaultPatient.userId,
                userId: 14163,
                pageNo: 1,
                pageSize: 9999,
            })
            var list = res.data.records || []
            list.forEach(item => {
                item.date = Util.formatTime5(new Date(item.create_time))
            })
            this.setData({
                zzblList: list
            })
        }


    },
    //出院小结
    async getFollowList() {

        if (this.data.defaultPatient && this.data.defaultPatient.userId) {
            wx.showLoading({
                title: '加载中',
            })
            const res = await WXAPI.getFollowList({
                userId: this.data.defaultPatient.userId
            })
            wx.hideLoading()
            res.data.forEach(element => {
                if (element.cysj) {
                    element.cysj = element.cysj.substring(0, 4) + '年' + element.cysj.substring(5, 7) + '月' + element.cysj.substring(8, 10) + '日'
                } else {
                    element.cysj = ''
                }

            });
            this.setData({
                orderList: res.data
            })
        }


    },



    // 授权病历列表
    async getMyCaseSyninfoOut() {
        if (this.data.defaultPatient && this.data.defaultPatient.userId) {
            const res = await WXAPI.getMyCaseSyninfo({
                userId: this.data.defaultPatient.userId
            })
            if (res.code == 0) {
                var blsqNumLenght = []
                if (res.data) {
                    res.data.forEach(item => {
                        if (item.authorizationStatus == 0) {
                            item.iconShow = '../../image/bl1.png'
                            blsqNumLenght.push(item)  //气泡提示数量 只显示待授权的
                        } else if (item.authorizationStatus == 1) {
                            item.iconShow = '../../image/bl2.png'
                        } else if (item.authorizationStatus == 2) {
                            item.iconShow = '../../image/bl3.png'
                        }
                    })
                }
                this.setData({
                    blsqNum: blsqNumLenght.length,
                    blsqList: res.data || []
                })

            }

        }

    },








    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    async clickRefresh() {
        wx.showLoading({
            title: '加载中',
        })
        const res = await WXAPI.getEmrDataByUserId({
            userId: this.data.userId
        })
        if (res.code == 0) {
            wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 2000
            })
        }
        wx.hideLoading()

        console.log('ffefeffffffffffffff')
    },

    //检查登录
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
    },
    //授权详情
    onBLSQItemClick(e) {
        var item = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: './blsqDetail/index?id=' + item.id
            })

        }
    },
    //转诊病例详情
    onZZBLItemClick(e) {
        var item = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: './zzblDetail/index'
            })

        }
    },

    //出院小结详情
    goConclusionDetailPage(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: './con-detail?regNo=' + info.regNo + '&userId=' + info.userId + '&recordId=' + this.data.recordId
            })

        }
    },


    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})