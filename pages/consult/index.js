const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')

import bus from '../../utils/EventBus.js'
Page({

    /**
     * 页面的初始数据
     * 1服务中2待接诊3问诊中4已结束
     */
    data: {
        appointList: [],
        conversationIDList: [],
        todoList: [],
        active: '0',
        unreadConsult: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //监听机构切换
        bus.on('consultUpdate', (msg) => {
            // 支持多参数
            console.log("监听consultUpdate", msg)

            this.getConversationList()
        })
    },

    /**
 * 生命周期函数--监听页面显示
 */
    onShow: function () {

        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient')
        })
        this.getConsultList()
        this.getInquiriesAgencyList()
    },
    onTabsChange(e) {

        var status = e.detail.name
        this.setData({
            active: status
        })

    },
    //获取待办列表
    async getInquiriesAgencyList() {
        const res = await WXAPI.getInquiriesAgencyList({
            "pageNo": 1,
            "pageSize": 9999
        })
        if (res.code == 0 && res.data && res.data.records && res.data.records.length > 0) {
            this.setData({
                todoList: res.data.records,
            })

        } else {
            this.setData({
                todoList: []
            })
        }

    },
    //获取问诊列表
    async getConsultList() {
        const res = await WXAPI.getConsultList()
        if (res.code == 0 && res.data && res.data.length > 0) {
            var conversationIDList = []
            res.data.forEach(item => {
                item.conversationID = 'GROUP' + item.imGroupId
                if (item.imGroupId) {
                    conversationIDList.push(item.conversationID)
                }
            })

            this.setData({
                conversationIDList: conversationIDList,
                appointList: res.data,
            })
            this.getConversationList()

        } else {
            this.setData({
                appointList: []
            })
        }

    },

    //获取问诊列表的未读数
    getConversationList() {
        if (this.data.conversationIDList.length == 0) {
            return
        }
        console.log(this.data.conversationIDList)
        if (getApp().globalData.sdkReady) {
            var appointList = this.data.appointList
            // 获取指定的会话列表
            let promise = getApp().tim.getConversationList(this.data.conversationIDList);
            let that = this
            promise.then(function (imResponse) {
                const conversationList = imResponse.data.conversationList; // 缓存中已存在的指定的会话列表
                console.log("获取指定的会话列表", conversationList)
                var num = 0
                if (conversationList && conversationList.length > 0) {
                    for (var i = 0; i < conversationList.length; i++) {
                        for (var j = 0; j < appointList.length; j++) {
                            if (conversationList[i].conversationID == appointList[j].conversationID) {
                                appointList[j].unreadCount = conversationList[i].unreadCount
                                num = num + conversationList[i].unreadCount
                            }
                        }
                    }
                    that.setData({
                        appointList: appointList,
                        unreadConsult: num
                    })
                }
            }).catch(function (imError) {
                console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
            });
        }

    },

    //问诊详情
    goConsultDetail(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {

            wx.navigateTo({
                url: './detail/index?rightsId=' + info.rightsId + '&userId=' + info.userId + '&status=' + info.status.value,
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
        if (item.originalType.value !== 1 && item.originalType.value !== 2) {  //不是问卷和文章 设置已读
            this.setInquiriesAgencyRead(item)
        }
    },
    //待办事项 详情
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
            url: './webpage/index?url=' + encodeUrl + '&type=' + type
        })
    },
    //设置已读
    setInquiriesAgencyRead(item) {
        if (item.readStatus.value == 1) {
            WXAPI.setInquiriesAgencyRead(id)
        }

    },
    //进入诊室
    enterRoom(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            if (getApp().globalData.sdkReady) {
                IMUtil.goGroupChat(info.userId, 'navigateTo', info.imGroupId, 'textNum', info.lastUseRecordId, 'START')
            }
        }

    },
    //再次购买
    bugAgain(e) {
        var info = e.currentTarget.dataset.item
        wx.navigateTo({
            url: `/pages/health/detail/index?id=${info.commodityId}`
        })
    },
    //使用权益
    goApplyRights(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {

            wx.navigateTo({
                url: './rights/apply?rightsId=' + info.rightsId + '&userId=' + info.userId,
            })


        }

    },
    //AI咨询
    goIMPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    // wx.navigateTo({
                    //     url: '/packageIM/pages/chat/AIChat',
                    // })
                    IMUtil.goGroupChat(1447, 'navigateTo', '@TGS#1ZV5FEHME', 'textNum', 20, 'START')
                }
            }
        }

    },
    async queryRightsUsingRecord() {


        const res = await WXAPI.queryRightsUsingRecord(this.data.defaultPatient.userId, '')

    },




    bindItemTap(e) {



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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },


})