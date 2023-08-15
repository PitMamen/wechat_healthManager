// pages/home/news/news-list.js
const WXAPI = require('../../../static/apifm-wxapi/index')
const IMUtil = require('../../../utils/IMUtil')

import bus from '../../../utils/EventBus.js'

var page = 1

Page({

    /**
     * 页面的初始数据
     */
    data: {
        todoList: [],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient')
        })
        page = 1;
        wx.showLoading({
            title: '加载中...',
        })

        this.getInquiriesAgencyList()

    },
    //获取待办列表
    async getInquiriesAgencyList() {
        const res = await WXAPI.getInquiriesAgencyList({
            "pageNo": 1,
            "pageSize": 9999
        })
        wx.hideLoading();
        if (res.code == 0 && res.data && res.data.records && res.data.records.length > 0) {
            this.setData({
                todoList: res.data.records,
            })
            var num = 0
            res.data.records.forEach(item => {
                if (item.readStatus.value == 1) {
                    num = num + 1
                }
            })
            this.setData({
                unreadTodo: num
            })
        } else {
            this.setData({
                todoList: [],
                unreadTodo: 0
            })
        }
    },

    //待办事项 进入诊室
    bindTodoItemEnterRoomTap(e) {
        var item = e.currentTarget.dataset.item

        if (this.checkLoginStatus()) {
            if (getApp().globalData.sdkReady) {
                if (item.imGroupId) {
                    IMUtil.goGroupChat(item.userId, 'navigateTo', item.imGroupId, 'textNum', item.tradeId, 'START')
                }
            }
        }
        if (item.originalType.value !== 1 && item.originalType.value !== 2) { //不是问卷和文章 设置已读
            this.setInquiriesAgencyRead(item)
        }
    },
    //待办事项 详情 1问卷 2文章 4咨询待评价 5服务套餐待评价
    bindTodoItemDetailTap(e) {
        var item = e.currentTarget.dataset.item
        if (item.originalType.value == 1) {
            //问卷 提交问卷后后台会设置已读和发送卡片
            this.goWebPage(1, item.jumpUrl)
        } else if (item.originalType.value == 2) {
            //文章
            this.goWebPage(2, item.jumpUrl)
            //设置已读
            this.setInquiriesAgencyRead(item)
        } else if (item.originalType.value == 4 || item.originalType.value == 6) {
            //单次咨询评价
            this.setInquiriesAgencyRead(item) //设置已读消息
            wx.navigateTo({
                url: `/pages/home/rate/doctor?rightsId=${item.rightsId}&todoid=${item.id}`
            })
        } else if (item.originalType.value == 5) {
            //单次咨询评价
            wx.navigateTo({
                url: `/pages/home/rate/package?rightsId=${item.rightsId}&todoid=${item.id}`
            })
        } else if (item.originalType.value == 9 || item.originalType.value == 8) {
            //药师审核   开具处方
            this.setInquiriesAgencyRead(item) //设置为已读
            wx.navigateTo({
                url: `/pages/me/prescription/detail?preNo=${item.tradeId}`
            })
        } else {
            if (this.checkLoginStatus()) {
                if (getApp().globalData.sdkReady) {
                    if (item.imGroupId) {
                        IMUtil.goGroupChat(item.userId, 'navigateTo', item.imGroupId, 'textNum', item.tradeId, 'START')
                    }
                }
            }

            this.setInquiriesAgencyRead(item)
        }
    },
    //问卷 文章 详情
    goWebPage(type, url) {
        var encodeUrl = encodeURIComponent(url)
        wx.navigateTo({
            url: '../webpage/index?url=' + encodeUrl + '&type=' + type
        })
    },
    //设置已读
    setInquiriesAgencyRead(item) {
        if (item.readStatus.value == 1) {
            WXAPI.setInquiriesAgencyRead(item.id)
        }

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

    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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
        this.refresh()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log("onReachBottom")
        this.loadMore()
    },

    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})