const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        rightsId: '',
        userId: '',
        isReminded: false,//是否已经提醒
        fromtype: '',//1购买成功 目前只有购买成功才传值
        detail: {},
        patient: {},
        hidePoupShow: true,
        nameColumns: [],
        rightsRecordList: [],
        rightsItemList: [],//服务项目
        steps: [],
        active: 0,
        CustUserId: '',//个案管理师
        CustUserName: ''//个案管理师
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            rightsId: options.rightsId,
            userId: options.userId
        })


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
        this.getRightsInfo(this.data.rightsId)

    },
    async getRightsInfo(id) {
        const res = await WXAPI.getServiceRightsInfo({ rightsId: id })
        if (res.code != 0) {
            return
        }

        // res.data.status.value = 4

        if (res.data.endTime) {
            var date = new Date(res.data.endTime)
            res.data.endTime2 = Util.formatTime5(date) + '到期'
        } else {
            res.data.endTime2 = '永久'
        }


        var caseArr = []
        if (res.data.teamInfo && res.data.teamInfo.length > 0) {
            caseArr = res.data.teamInfo.filter(
                function (element, index, arr) {
                    return element.userType == 'casemanager';
                }
            )
        }
        res.data.caseInfo = caseArr.length > 0 ? caseArr[0] : {}


        var rightsItemList = []
        res.data.rightsItemInfo.forEach(item => {
            //1服务中 2待接诊 3问诊中 4已结束 5已中止
            item.status = item.rightsUseRecords.length > 0 ? item.rightsUseRecords[0].status : 1
            if (item.rightsUseRecords.length > 0) {
                var inStatus = item.rightsUseRecords[0].status
                if (inStatus == 2 || inStatus == 3) {
                    item.status = inStatus
                } else {
                    if (item.surplusQuantity > 0) {
                        item.status = 1
                    } else {
                        item.status = 4
                    }
                }
            } else {
                item.status = 1
            }

            if (item.projectType == 101 || item.projectType == 102 || item.projectType == 103) { //图文 电话 视频
                item.iconUrl = res.data.docInfo.avatarUrl || '/image/docheader.png'
                item.itemName = res.data.docInfo.userName
                if (item.status == 1) {
                    if (res.data.status.value == 4) {
                        //套餐已结束
                        item.itemContent = '已结束'
                    } else {
                        item.itemContent = '剩余' + item.surplusQuantity + item.unit
                    }

                } else if (item.status == 2) {
                    item.itemContent = '待医生接诊'
                } else if (item.status == 3) {
                    if (item.projectType == 101) {
                        var dateExpireTime = item.rightsUseRecords[0].dateExpireTime
                        if (dateExpireTime) {
                            item.itemContent = Util.formatTime6(new Date(dateExpireTime)) + '到期'
                        } else {
                            item.itemContent = res.data.endTime2
                        }
                    } else {
                        var confirmPeriod = item.rightsUseRecords[0].confirmPeriod.replace('/', '-')

                        if (confirmPeriod) {
                            item.itemContent = confirmPeriod.substring(0, 5) + confirmPeriod.substring(8) + '联系您'
                        }
                    }

                } else if (item.status == 4) {
                    item.itemContent = '已结束'

                }

            } else if (item.projectType == 106) {//个案师服务
                item.itemName = res.data.caseInfo.userName
                item.iconUrl = res.data.caseInfo.avatarUrl || '/image/icon_fw3.png'

                if (res.data.status.value == 4) {
                    //套餐已结束
                    item.itemContent = '已结束'
                } else {
                    item.itemContent = '已开通'
                }
            } else {// 104 普通商品 105 随访服务 其他
                item.iconUrl = '/image/icon_ptsp.png'
                item.isCommonProjectType = true

                if (res.data.status.value == 4) {
                    //套餐已结束
                    item.itemName = '已结束'
                } else {
                    item.itemName = '已开通'
                }
            }
            rightsItemList.push(item)
        })

        this.setData({
            detail: res.data,
            rightsItemList: res.data.rightsItemInfo || [],
        })


    },


    //申请
    async saveRightsUseRecord(rightInfo) {



        var postData = rightInfo
        postData.appointTime = Util.formatTime(new Date())
        postData.userId = this.data.detail.userId
        postData.docId = rightInfo.doctorUserId
        postData.rightsItemId = rightInfo.id


        const res = await WXAPI.saveRightsUseRecordNew(postData)
        if (res.code == 0) {

            wx.showToast({
                title: '申请成功！',
            })
            let that = this
            setTimeout(() => {
                that.getRightsInfo(that.data.rightsId)
            }, 2000)
        }


    },


    onItemClick(e) {
        var item = e.currentTarget.dataset.item
        console.log(item)
        let that = this
        if (!this.checkLoginStatus()) {
            return
        }
        //1服务中 2待接诊 3问诊中 4已结束 5已中止
        if (item.projectType == 101) {//图文 
            if (item.status == 2) {
                return
            }
            if (item.status == 1) {
                if (item.rightsUseRecords.length == 0) {
                    if (this.data.detail.status.value == 4) {
                        //套餐已结束
                        return
                    }
                    //还未使用 先申请
                    wx.showModal({
                        title: '【图文咨询】剩余权益：' + item.surplusQuantity + '次',
                        content: '请确认是否使用？',
                        success(res) {
                            if (res.confirm) {
                                that.saveRightsUseRecord(item)
                            }
                        }
                    })
                } else {
                    //已使用过 进入历史咨询
                    this.goHistoryChat(item)
                }
            } else if (item.status == 4 || item.status == 5) {
                //进入历史咨询
                this.goHistoryChat(item)
            } else if (item.status == 3) {
                //进入在线咨询
                if (getApp().globalData.sdkReady) {
                    IMUtil.goGroupChat(this.data.detail.userId, 'navigateTo', this.data.detail.imGroupId, 'textNum', item.rightsUseRecords[0].id, 'START')
                }
            }


        } else if (item.projectType == 102) {//电话
            if (item.status == 2) {
                return
            }
            if (item.status == 1 && item.rightsUseRecords.length == 0) {
                if (this.data.detail.status.value == 4) {
                    //套餐已结束
                    return
                }
                //还未使用 先申请
                wx.showModal({
                    title: '【电话咨询】剩余权益：' + item.surplusQuantity + '次',
                    content: '请确认是否使用？',
                    success(res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: `/pages/consult/detail-package/telinfo/index?id=${that.data.detail.id}&rightsId=${item.id}`
                            })
                        }
                    }
                })

            } else {
                wx.navigateTo({
                    url: './tel-list?id=' + this.data.detail.id + '&rightsId=' + item.id,
                })
            }

        } else if (item.projectType == 103) {//视频
            wx.showToast({
                title: '等待服务',
                icon: 'none'
            })
        } else if (item.projectType == 106) {//个案师服务
            wx.navigateTo({
                url: './casemanager?rightsId=' + this.data.rightsId
            })
        } else if (item.projectType == 105) {//随访服务
            wx.navigateTo({
                url: '/pages/me/my-plan/index'
            })
        }else {
            wx.navigateTo({
                url: './common',
            })
        }

    },
    //进入历史咨询
    goHistoryChat(item) {
        var textChatNum=item.surplusQuantity
        if (this.data.detail.status.value == 4) {
            //套餐已结束
            textChatNum=0
        }
        wx.navigateTo({
            url: `/packageIM/pages/chat/groupHistoryChat?groupID=${this.data.detail.imGroupId}&inquiryType=${'textNum'}&tradeId=${item.rightsUseRecords[0].id}&textChatNum=${textChatNum}&userId=${this.data.detail.userId}&isTextNumDetail=true`,
        })
    },
    goMain() {
        wx.switchTab({
            url: '/pages/home/main',
        })
    },

    apply() {
        this.setData({
            hidePoupShow: false
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

    },


    //套餐详情
    goPackagePage() {
        wx.navigateTo({
            url: '/pages/health/service/index'
        })
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

    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})