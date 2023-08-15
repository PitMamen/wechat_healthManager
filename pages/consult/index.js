const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')

import bus from '../../utils/EventBus.js'
Page({

    /**
     * 页面的初始数据
     * 1服务中2待接诊3问诊中4已结束
     */
    data: {
        packageList: [],
        appointList: [],
        conversationIDList: [],
        todoList: [],
        active: '2',
        unreadConsult: 0,
        unreadTodo: 0,
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
        console.log('consultPageActive=' + getApp().globalData.consultPageActive)
        if (getApp().globalData.consultPageActive > 0) {
            this.setData({
                active: getApp().globalData.consultPageActive + ''
            })
            getApp().globalData.consultPageActive = -1
        }

        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient')
        })
        this.getPackageList()
        this.getConsultList()
        this.getInquiriesAgencyList()//这里还需要调用，因为需要展示未读系统通知数量
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
    //获取套餐列表
    async getPackageList() {
        const res = await WXAPI.getConsultList({
            broadClassify: 2
        })
        if (res.code == 0 && res.data && res.data.length > 0) {

            this.setData({
                packageList: res.data,
            })


        } else {
            this.setData({
                packageList: []
            })
        }

    },
    //获取问诊列表
    async getConsultList() {
        const res = await WXAPI.getConsultList({
            broadClassify: 1
        })
        if (res.code == 0 && res.data && res.data.length > 0) {
            var conversationIDList = []
            res.data.forEach(item => {
                item.conversationID = 'GROUP' + item.imGroupId
                if (item.status.value == 3 && item.imGroupId && item.serviceItemTypes[0] == 101) {
                    //只查进行中的图文咨询
                    conversationIDList.push(item.conversationID)
                }
            })
            this.setData({
                conversationIDList: conversationIDList,
                appointList: res.data,
            })
            if (conversationIDList.length > 0) {
                this.getConversationList()
            } else {
                this.setData({
                    unreadConsult: 0
                })
            }


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
                } else {
                    that.setData({
                        unreadConsult: 0
                    })
                }
            }).catch(function (imError) {
                console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
            });
        }

    },
    //套餐详情
    goPackageDetailPage(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            wx.navigateTo({
                url: './detail-package/index?rightsId=' + info.rightsId + '&userId=' + info.userId + '&status=' + info.status.value,
            })

        }
    },
    //问诊详情
    goConsultDetail(e) {
        var info = e.currentTarget.dataset.item
        console.log("fff:", info)
        if (this.checkLoginStatus()) {
            if (info.serviceItemTypes[0] == 102) {
                wx.navigateTo({
                    url: './detail-tel/index?rightsId=' + info.rightsId + '&userId=' + info.userId + '&status=' + info.status.value,
                })
            } else if (info.serviceItemTypes[0] == 103) {
                wx.navigateTo({
                    url: './detail-video/index?rightsId=' + info.rightsId + '&userId=' + info.userId + '&status=' + info.status.value,
                })
            } else {
                wx.navigateTo({
                    url: './detail-text/index?rightsId=' + info.rightsId + '&userId=' + info.userId + '&status=' + info.status.value,
                })
            }


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
            url: './webpage/index?url=' + encodeUrl + '&type=' + type
        })
    },
    //设置已读
    setInquiriesAgencyRead(item) {
        if (item.readStatus.value == 1) {
            WXAPI.setInquiriesAgencyRead(item.id)
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
        if (this.checkLoginStatus()) {
            if (info.serviceItemTypes[0] == 101) {
                wx.navigateTo({
                    url: `/packageDoc/pages/health/detail/index?id=${info.commodityId}`
                })
            } else if (info.serviceItemTypes[0] == 102) {
                wx.navigateTo({
                    url: `/packageDoc/pages/doctor/detail/index?id=${info.commodityId}&docId=${info.doctorUserId}&docName=${info.doctorUserName}`
                })
            } else if (info.serviceItemTypes[0] == 103) {
                wx.navigateTo({
                    url: `/packageDoc/pages/doctor/detail/index?id=${info.commodityId}&docId=${info.doctorUserId}&docName=${info.doctorUserName}`
                })
            }


        }


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

    goTodoPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/pages/consult/todo/todo-list',
                    })
                    // IMUtil.goGroupChat(1447, 'navigateTo', '@TGS#1ZV5FEHME', 'textNum', 20, 'START')
                }
            }
        }

    },
    //AI咨询
    goIMPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/packageIM/pages/chat/AIChat',
                    })
                    // IMUtil.goGroupChat(1447, 'navigateTo', '@TGS#1ZV5FEHME', 'textNum', 20, 'START')
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