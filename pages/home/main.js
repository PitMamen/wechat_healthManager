const WXAPI = require('../../static/apifm-wxapi/index')
const Util = require('../../utils/util')
const IMUtil = require('../../utils/IMUtil')
const Config = require('../../utils/config')
const APP = getApp()

Page({
    data: {

        loadingHidden: false, // loading
        selectCurrent: 0,
        activeCategoryId: 0,
        scrollTop: 0,
        hidePatientShow: true,
        nameColumns: [],
        userInfo: null,
        defaultPatient: null,
        patientList: [],
        unreadIMmessageCount: 0,//在线咨询消息数
        unreadMymessageCount: 0,//我的消息数
        taskList: [],
        lastConversation: null,
        healthRecordPercentage: '',//健康档案完成度
        rightsList: [],
        myRightsCount: 0
    },






    onLoad: function (e) {

        this.setData({
            navHeight: APP.globalData.navHeight,
            navTop: APP.globalData.navTop,
            windowHeight: APP.globalData.windowHeight,
            menuButtonObject: APP.globalData.menuButtonObject, //小程序胶囊信息

        })

        wx.showShareMenu({
            withShareTicket: true,
        })
        //监听app.js里登录完成状态
        getApp().watch('loginReady', this.watchBack);
        //监听客服和个案管理师发来的消息数
        getApp().watch('unreadServerMessageCount', this.watchBack);


    },
    watchBack: function (name, value) {
        console.log('name==' + name);
        console.log(value);
        if (name === 'loginReady') {
            //监听到app.js里登录完成状态
            if (value) {
                this.onShow()
            }
        } else if (name === 'unreadServerMessageCount') {
            this.setData({
                unreadMymessageCount: value
            })
        }

    },
    onShow: function (e) {

        var userInfoSync = wx.getStorageSync('userInfo')

        if (!userInfoSync || userInfoSync === undefined) {
            console.log("无用户信息")
            return
        }
        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient'),
            patientList: wx.getStorageSync('userInfo').account.user,
            userInfo: wx.getStorageSync('userInfo').account
        })
        if (this.data.patientList && this.data.patientList.length > 0) {
            var names = []
            this.data.patientList.forEach(item => {
                names.push(item.userName)
            })
            this.setData({
                nameColumns: names
            })
            this.allTallskRequset()
            IMUtil.LoginOrGoIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig)
            IMUtil.getConversationList()
        }





    },
    testBtn() {
        // wx.navigateTo({
        //     url: '/pages/login/confirm-patient?ks=1030400'
        // })
        wx.navigateTo({
            url: '/pages/login/follow-checkin'
        })
    },
    //我的消息
    goMyMessagePage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/packageIM/pages/chat-list/chat-list?userId=' + this.data.defaultPatient.userId,
                    })
                }
            }
        }
    },
    onReady() {
        var header = {
            'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : ''
        };
        // wx.redirectTo({
        //     url: '/packageIM/pages/chat/historyChat?userId=712&toUserId=606'
        //   })


    },



    //就医记录
    async cureHistoryListQuery() {

        const postData = {
            "dataOwnerId": this.data.defaultPatient.userId,
            "dataUserId": this.data.defaultPatient.userId,
            "recordType": "",
            "pastMonths": "60"
        }
        console.log(postData)
        const res = await WXAPI.qryPatientMedicalRecords(postData)
        if (res.code == 0) {
            this.getRecord(res.data[0].docId, res.data[0].recordType)
        }
    },


    //我的权益 数量
    async queryMyRights() {


        const res = await WXAPI.queryMyRights(this.data.defaultPatient.userId, '', '', '')

        // var num = 0

        // res.data.forEach(item => {
        //     if (item.userGoodsAttr && item.userGoodsAttr.length > 0) {
        //         item.userGoodsAttr.forEach(at => {
        //             if (at.attrName === 'videoNum' || at.attrName === 'textNum') {
        //                 var d = Number(at.attrValue) - Number(at.usedValue)      
        //                 num = num + d
        //             }


        //         });
        //     }
        // });

        this.setData({
            myRightsCount: res.data.length,
        })
    },



    //首页任务需要请求的接口
    allTallskRequset() {

        //查询未完成的任务 和 查询正在使用的权益
        this.qryUnfinishedTaskListAndRightsUsingRecord()

        //查询全部权益 计算权益算
        this.queryMyRights()
        //查询权益类型集合
        this.qryRightsTypeCodeValue()
    },
    avatarBinderror(e) {

        this.data.userInfo.avatarUrl = '/image/avatar.png'
        this.setData({
            userInfo: this.data.userInfo
        })
    },

    //查询未完成的任务 和 查询正在使用的权益
    async qryUnfinishedTaskListAndRightsUsingRecord() {
        //先查正在使用的权益 
        var allTaskList = []
        const res = await WXAPI.queryRightsUsingRecord(this.data.defaultPatient.userId, '')
        if (res.code == 0) {
            res.data.forEach(item => {
                //时效限制
                item.serviceExpire = 0
                //条数限制
                item.textNumLimit = 0
                if (item.userAttrInfo && item.userAttrInfo.length > 0 && item.userAttrInfo[0].remark) {
                    if (item.userAttrInfo[0].remark.serviceExpire) {
                        item.serviceExpire = item.userAttrInfo[0].remark.serviceExpire
                    }
                    if (item.userAttrInfo[0].remark.textNumLimit) {
                        item.textNumLimit = item.userAttrInfo[0].remark.textNumLimit
                    }
                }
                var nameTitle = '会诊医生：'
                var docName = '医生'
                if (item.userAttrInfo && item.userAttrInfo.length > 0 && item.userAttrInfo[0].remark && item.userAttrInfo[0].remark.whoDeal && item.userAttrInfo[0].remark.whoDeal === 'nurse') {
                    nameTitle = '会诊护士：'
                    docName = '护士'
                }
                //处理完成
                if (item.execFlag === 2) {
                    item.planType = item.rightsType

                    if (item.rightsType === 'ICUConsultNum') {
                        //重症会诊 不需要操作 只是显示
                        item.planDescribe = "会诊开始：" + item.execTime + '\n' + nameTitle + item.execName + "\n会诊科室：" + item.deptName + "\n(请耐心等待" + docName + "会诊结果)"
                    } else if (item.rightsType === 'videoNum' || item.rightsType === 'telNum') {
                        item.planDescribe = "问诊开始：" + item.execTime + "\n问诊时长：" + item.remark + "分钟" + '\n' + nameTitle + item.execName + "\n问诊科室：" + item.deptName
                    } else if (item.rightsType === 'textNum') {

                        item.planDescribe = "问诊开始：" + item.execTime + '\n' + nameTitle + item.execName + "\n问诊科室：" + item.deptName + "\n问诊时效：" + item.serviceExpire + '小时' + "\n条数限制：" + item.textNumLimit + '条'

                    } else if (item.rightsType === 'appointNum') {

                        item.planDescribe = "问诊开始：" + item.execTime + '\n' + nameTitle + item.execName + "\n问诊科室：" + item.deptName

                    }

                    allTaskList.push(item)
                } else if (item.execFlag === 0) {

                    if (item.userAttrInfo && item.userAttrInfo.length > 0 && item.userAttrInfo[0].remark && +item.userAttrInfo[0].remark.caseFlag == 0) {
                        //不需要个案参与 
                        if (item.rightsType === 'videoNum' || item.rightsType === 'telNum') {
                            //视频咨询 电话咨询  需要确认咨询时间
                            item.planType = item.rightsType
                            item.planDescribe = nameTitle + item.execName + "\n问诊科室：" + item.deptName + '\n申请时间：' + Util.formatTime(new Date(item.createTime))
                            item.caseFlag = 0
                        } else if (item.rightsType === 'textNum') {
                            //图文咨询 等待接诊
                            item.planType = item.rightsType
                            item.planDescribe = '等待' + docName + '接诊' + '\n' + nameTitle + item.execName + "\n问诊科室：" + item.deptName + '\n申请时间：' + Util.formatTime(new Date(item.createTime))
                            item.caseFlag = 0
                        } else if (item.rightsType === 'appointNum') {
                            //复诊开方 等待接诊
                            item.planType = item.rightsType
                            item.planDescribe = '等待' + docName + '接诊' + '\n' + nameTitle + item.execName + "\n问诊科室：" + item.deptName + '\n申请时间：' + Util.formatTime(new Date(item.createTime))
                            item.caseFlag = 0
                        }


                        allTaskList.push(item)
                        return
                    }
                    if (item.checkFlag === 0) {
                        //资料审核未通过
                        item.planType = item.rightsType
                        item.planDescribe = '上传资料审核未通过,请重新上传'
                        allTaskList.push(item)
                        return
                    }

                }

            })

            //后查未完成的任务
            const res2 = await WXAPI.getUnfinishedTaskList(this.data.defaultPatient.userId)

            res2.data.forEach(plan => {
                plan.userPlanDetailList.forEach(item => {
                    item.goodsId = plan.goodsId
                    item.owner = plan.owner
                    item.planName = plan.planName
                    allTaskList.push(item)
                })

            })


            this.setData({
                taskList: allTaskList
            })

            console.log(this.data.taskList)
        }
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

    onTaskItemClick(e) {
        var task = e.currentTarget.dataset.item
        var type = task.planType
        //随访任务类
        if (type == '1') {
            wx.navigateTo({
                url: './health-records/index',
            })
        } else if (type == '2') {
            wx.navigateTo({
                url: 'package-list/packagelist',
            })

        } else if (type == 'Exam') {//检验单
            wx.navigateTo({
                url: './upload/jy-record?userId=' + this.data.defaultPatient.userId + '&planDescribe=' + task.planDescribe + '&contentId=' + task.contentId + '&goodsId=' + task.goodsId,
            })

        } else if (type == 'Check') {//检查单
            wx.navigateTo({
                url: './upload/yc-record?userId=' + this.data.defaultPatient.userId + '&planDescribe=' + task.planDescribe + '&contentId=' + task.contentId + '&goodsId=' + task.goodsId,
            })

        } else if (type == 'Quest') {//问卷
            this.queryHealthPlanContent(task)

        } else if (type == 'DailyRecord') {//日常记录
            wx.navigateTo({
                url: './upload/daily?userId=' + this.data.defaultPatient.userId,
            })

        } else if (type == 'Knowledge') {//文章
            this.queryHealthPlanContent(task)

        } else if (type == 'Remind') {//健康消息
            wx.navigateTo({
                url: './health-remind/index?userId=' + this.data.defaultPatient.userId + '&contentId=' + task.contentId + '&planType=' + task.planType,
            })

        } else if (type == 'Evaluate') {//健康评估
            wx.navigateTo({
                url: './evaluate/index?userId=' + this.data.defaultPatient.userId + '&contentId=' + task.contentId,
            })

        }else if (type == 'Rdiagnosis' || type == 'Ddiagnosis') {//复诊提醒 用药提醒
            this.updateUnfinishedTaskStatus(task.contentId)
            wx.showToast({
              title: '已完成',
            })
            this.qryUnfinishedTaskListAndRightsUsingRecord()
        }
        //权益类
        if (task.rightsId > 0) {
            console.log(task)
            var DoctorType = 'Doctor'
            if (task.userAttrInfo && task.userAttrInfo.length > 0 && task.userAttrInfo[0].remark && task.userAttrInfo[0].remark.whoDeal && task.userAttrInfo[0].remark.whoDeal === 'nurse') {
                DoctorType = 'Nurse'
            }
            if (task.execFlag === 2) {
                //权益确定成功 权益待办
                if (type == 'videoNum' || type == 'textNum' || type == 'telNum' || type == 'appointNum') {//视频咨询 图文咨询 电话咨询 复诊开方
                    if (DoctorType == 'Nurse') {

                        IMUtil.goIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig, 'navigateTo', task.execUser, 'Nurse', type, task.tradeId, 'START')
                    } else if (DoctorType = 'Doctor') {
                        this.getRegisterTradeByRights(task)
                    }

                } else if (type === 'ICUConsultNum') {//重症会诊
                    if (task.execFlag === 2) {
                        wx.navigateTo({
                            url: './rights/detail?orderId=' + task.rightsId + '&userId=' + task.userId,
                        })
                    }

                }
            } else if (task.execFlag === 0) {
                //权益申请中
                if (task.caseFlag == 0) {
                    if (DoctorType == 'Nurse') {
                        IMUtil.goIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig, 'navigateTo', task.execUser, 'Nurse', type, task.tradeId, 'START')
                    } else {
                        //不需要个案参与  需要确认咨询时间 或者 等待接诊
                        this.getRegisterTradeByRights(task)
                    }


                    return
                }
                if (task.uploadDocFlag === 1) {
                    //重症会诊 需要填写资料
                    var checkInfo = '资料审核未通过'
                    if (task.checkInfo && task.checkInfo.length > 0) {
                        checkInfo = task.checkInfo[0].dealDetail
                    }
                    wx.navigateTo({
                        url: './upload/rightsUpload?userId=' + task.userId + '&tradeId=' + task.tradeId + '&checkFlag=' + task.checkFlag + '&checkInfo=' + checkInfo + '&CaseManagerName=' + task.execName
                    })
                    return
                }
            }


        }

    },

    //内容详情
    async queryHealthPlanContent(item) {
        var goodsId = item.goodsId
        var owner = item.owner

        const res = await WXAPI.queryHealthPlanContent(item.contentId, item.planType, this.data.defaultPatient.userId)
        if (res.data) {

            var planType = item.planType
            if (planType === 'Quest') {//问卷   问卷需要提交之后由后台设置已完成状态
                var groupId = goodsId + owner + this.data.defaultPatient.userId
                var url = res.data.questUrl + '?userId=' + this.data.defaultPatient.userId + '&groupId=' + groupId + '&contentId=' + item.contentId + '&execTime=' + Util.formatTime2(new Date()) + '&title=' + item.questName
                url = url.replace("/r/", "/s/")
                console.log(url)
                this.goWenjuanPage(url)
            } else if (planType === 'Knowledge') {//健康宣教

                wx.navigateTo({
                    url: './news/news-detail?id=' + res.data.articleId
                })

                if (item.execFlag !== 1) {
                    this.updateUnfinishedTaskStatus(item.contentId)
                }
            }




        }
    },
    //更新内容成已完成
    async updateUnfinishedTaskStatus(contentId) {
        await WXAPI.updateUnfinishedTaskStatus(contentId)
    },

    //获取权益类别集合
    async qryRightsTypeCodeValue() {
        const res = await WXAPI.qryCodeValue('GOODS_SERVICE_TYPE')
        if (res.code === 0 && res.data.length > 0) {
            getApp().globalData.rightTypeList = res.data
        }
    },
    //获取权益申请互联网挂号支付记录
    async getRegisterTradeByRights(task) {
        const res = await WXAPI.getRegisterTradeByRights(task.tradeId, task.userId)
        if (res.data && res.data.orderId) {

            if (res.data.status === 11) {
                if (task.execFlag === 2) {
                    //myFlag = '进行中'
                    this.goInternetHostpitalIMChat(task.execUser, 'Doctor', task.rightsType, task.tradeId, 'START')
                } else if (task.execFlag === 1) {
                    //myFlag = '已完成'

                } else if (task.execFlag === 0) {
                    //item.myFlag = '待使用'
                    this.goInternetHostpitalIMChat(task.execUser, 'Doctor', task.rightsType, task.tradeId, 'CONFIRM2')
                }
            } else if (res.data.status === 10) {
                //item.myFlag = '待支付'
                wx.navigateToMiniProgram({
                    appId: 'wxe0cbf88bcc095244',
                    envVersion: Config.getConstantData().envVersion,
                    path: '/pages/login/auth?type=FROMPROGRAM&action=3&userId=' + task.userId,
                    extraData: {
                        orderId: res.data.orderId,
                    }
                })
            } else if (res.data.status === 6) {
                //item.myFlag = '已取消'
                wx.navigateToMiniProgram({
                    appId: 'wxe0cbf88bcc095244',
                    envVersion: Config.getConstantData().envVersion,
                    path: '/pages/login/auth?type=FROMPROGRAM&action=1&userId=' + task.userId,
                    extraData: {
                        userId: task.userId,
                        tradeId: task.tradeId,
                        rightsId: task.rightsId,
                        execFlag: task.execFlag,
                        attrName: task.rightsType,
                        execUser: task.execUser,
                        departmentId: task.execDept
                    }
                })
            }


        } else {
            //跳转到资料填写
            wx.navigateToMiniProgram({
                appId: 'wxe0cbf88bcc095244',
                envVersion: Config.getConstantData().envVersion,
                path: '/pages/login/auth?type=FROMPROGRAM&action=1&userId=' + task.userId,
                extraData: {
                    userId: task.userId,
                    tradeId: task.tradeId,
                    rightsId: task.rightsId,
                    execFlag: task.execFlag,
                    attrName: task.rightsType,
                    execUser: task.execUser,
                    departmentId: task.execDept
                }
            })
        }

    },
    goPlanListPage() {
        wx.navigateTo({
            url: '../me/my-plan/index',
        })
    },
    //问卷
    goWenjuanPage(url) {
        // var url='https://hmg.mclouds.org.cn/s/8a755f7c24ad49c9a2be6e6f79c3ee60?userId=195&groupId=162109195&contentId=164031276865637402&execTime=2021-12-24'

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
    //预约病床
    gobedPage() {
        wx.navigateTo({
            url: '/pages/me/bed/certificate',
        })
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
            this.allTallskRequset()
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
    //日常记录
    uploadDailyRecords() {
        wx.navigateTo({
            url: './upload/daily?userId=' + this.data.defaultPatient.userId,
        })
    },
    /**
     * 跳转到互联网医院聊天
     * @param {*} doctorId 对方ID
     * @param {*} DocType 医生：Doctor  个案管理师：CaseManager   护士：Nurse
     * @param {*} inquiryType 问诊类型  图文textNum  视频videoNum
     * @param {*} tradeId 权益工单类型  
     */
    goInternetHostpitalIMChat(doctorId, DocType, inquiryType, tradeId, tradeAction) {
        var routUrl = `/packageIM/pages/chat/chat?type=C2C&userID=` + doctorId + '&DocType=' + DocType + '&conversationID=' + 'C2C' + doctorId + '&inquiryType=' + inquiryType + '&tradeId=' + tradeId + '&tradeAction=' + tradeAction

        console.log('跳转聊天'.routUrl)

        if (DocType === 'Doctor') {
            //如果师医生 则跳转到互联网医院咨询
            wx.navigateToMiniProgram({
                appId: 'wxe0cbf88bcc095244',
                envVersion: Config.getConstantData().envVersion,
                path: '/pages/login/auth?type=FROMPROGRAM&action=2&userId=' + this.data.defaultPatient.userId,
                extraData: {
                    routUrl: routUrl
                }
            })
            return
        }
    },


    checkLoginStatus() {
       
        if (this.data.userInfo) {
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