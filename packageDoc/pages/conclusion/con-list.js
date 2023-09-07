const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '',
        listType: 0,
        status: '0',
        nuts: [{}, {}],
        time: 15 * 60 * 1000,
        broadClassify: 1, //1咨询服务类2服务套餐3健康商品
        // 0全部;1待支付、2进行中、3已完成、4已取消
        tabs: [{
                title: '全部',
                status: '0'
            },
            {
                title: '待支付',
                status: '1'
            },
            {
                title: '进行中',
                status: '2'
            },
            {
                title: '已完成',
                status: '3'
            },
            {
                title: '已取消',
                status: '4'
            }
        ],
        orderList: [],

        recordId: '',
        defaultPatient: {},
        patientList: [],
        hidePatientShow: true,
        nameColumns: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('***********con-list options', options)
        this.setData({
            recordId: options.recordId,
            userId: options.userId,
            // userId: wx.getStorageSync('userInfo').account.accountId,

            patientList: wx.getStorageSync('userInfo').account.user,
            defaultPatient: wx.getStorageSync('defaultPatient')
        })

        //微信公众号消息跳进来可能出现传的userId不是当前默认就诊人的userId，所以这里要切换页面选择的就诊人
        if (this.data.userId && this.data.userId != this.data.defaultPatient.userId) {
            this.data.patientList.forEach((element, index) => {
                if (element.userId == this.data.userId) {
                    this.setData({
                        defaultPatient: this.data.patientList[index],
                    });
                    this.getFollowList()
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
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getFollowList()
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
            //保存默认就诊人   这里不切换默认就诊人，注释掉
            // wx.setStorageSync('defaultPatient', this.data.defaultPatient)
            // IMUtil.LoginOrGoIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig)
            // console.log("当前就诊人：", this.data.defaultPatient)
            //TODO 刷新数据
            //   this.getUserExternalInfoOut()
            this.getFollowList()
            wx.showToast({
                title: '切换成功',
                icon: 'success',
                duration: 2000
            })
        }
        this.setData({
            hidePatientShow: true
        });

    },
    onPatientPickerCancel() {
        this.setData({
            hidePatientShow: true
        })
        //不要添加就诊人功能
        // wx.navigateTo({
        //   url: '/pages/me/patients/addPatient',
        // })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 
     * @param {订单状态：0全部;1待支付、2进行中、3已完成、4已取消} status 
     */
    async getFollowList() {
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