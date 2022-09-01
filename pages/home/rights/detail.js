const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const Config = require('../../../utils/config')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: '',
        userId: '',
        isReminded: false,//是否已经提醒
        fromtype: '',//1购买成功 目前只有购买成功才传值
        item: {},
        patient: {},
        hidePoupShow: true,
        nameColumns: [],
        rightsRecordList: [],
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
            orderId: options.orderId,
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
        this.getOrderById(this.data.orderId)
        this.queryRightsUserRecord(this.data.orderId)
    },
    async getOrderById(id) {
        const res = await WXAPI.queryMyRights(this.data.userId, id, '', '')
        var num = 0
        var nameColumns = []
        res.data[0].userGoodsAttr.forEach(attr => {
            attr.attrTypeName = getApp().getRightsType(attr.attrName).value
            var d = Number(attr.attrValue) - Number(attr.usedValue)
            num = num + d
            //目前只允许这几种申请使用
            if (d > 0) {
                if (attr.attrName === 'videoNum') {
                    //视频咨询
                    nameColumns.push(attr)
                } else if (attr.attrName === 'textNum') {
                    //图文咨询
                    nameColumns.push(attr)
                } else if (attr.attrName === 'ICUConsultNum') {
                    //重症会诊
                    nameColumns.push(attr)
                }else if (attr.attrName === 'telNum') {
                    //电话咨询
                    nameColumns.push(attr)
                }else if (attr.attrName === 'appointNum') {
                    //复诊开方
                    nameColumns.push(attr)
                }
            }
        })


        this.setData({
            item: res.data[0]
        })


        this.setData({
            nameColumns: nameColumns,
            numRights: num,
            isReminded: this.data.item.requesting > 0 && getApp().globalData.remindedRights.indexOf(this.data.item.id) > -1
        })
        console.log(this.data.nameColumns)
        this.getCustUserIdByDeptId(this.data.item.belong, this.data.userId)

    },
    async queryRightsUserRecord(id) {
        let that=this
        const res = await WXAPI.queryRightsUserRecord(this.data.userId, id)
        if (res.code == 0) {
            var steps = []
            res.data.rows.forEach((element, index) => {
                var checkInfo = ""
                var checkInfo2 = ""
                var checkTitle = ""
                //（1：已完成 0：申请2：个案师处理完成3：已中止）
                if (element.execFlag === 0 && element.checkFlag === 0) {//资料审核未通过
                    checkTitle = '——上传资料审核未通过'
                    if (element.checkInfo && element.checkInfo.length > 0) {
                        checkInfo = "（" + element.checkInfo[0].dealDetail + "）"
                        checkInfo2 = element.checkInfo[0].dealDetail
                    }
                    wx.showModal({
                        title: '提示:上传资料审核未通过',
                        content: checkInfo2,
                        success(res) {
                            if (res.confirm) {
                                if (element.uploadDocFlag === 1) {//重症
                                    wx.navigateTo({
                                        url: '../upload/rightsUpload?userId=' + element.userId + '&tradeId=' + element.tradeId + '&checkFlag=' + element.checkFlag + '&checkInfo=' + checkInfo2+  '&CaseManagerName=' + that.data.CustUserName
                                    })
                                }
                            }
                        }
                    })
                }

                steps.push({
                    text: Util.formatTime(new Date(element.createTime))  + checkTitle,
                    desc: element.statusDescribe + checkInfo,
                })

            });
            this.setData({
                rightsRecordList: res.data.rows,
                steps: steps
            })
        }


    },
    async getCustUserIdByDeptId(deptId, userId) {


        const res = await WXAPI.getCaseManagerByDeptIdAndUserId(deptId, userId)
        if (res.code == 0) {
            this.setData({
                CustUserId: res.data.userId,
                CustUserName: res.data.userName
            })
        }


    },
    async saveRightsUseRecord(attrName) {
        var rightContent;
        this.data.item.userGoodsAttr.forEach(e => {

            if (e.attrName === attrName) {
                rightContent = e
            }
        })

        if (!rightContent) {
            return
        }

        if (rightContent.attrValue - rightContent.usedValue < 1) {
            wx.showToast({
                title: '此权益已使用完',
                icon: 'error',
                duration: 2000
            })
            return
        }


        //不需要个案管理师参与  直接填写资料 分配给医生
        if (rightContent.remark && rightContent.remark.whoDeal!=='nurse' &&  rightContent.remark.caseFlag === 0) {
            var extraData={
                userId:this.data.userId,
                tradeId: '',
                rightsId:this.data.orderId,
                execFlag:0,
                attrName:rightContent.attrName,
                execUser: rightContent.remark.docId,
                departmentId:this.data.item.belong 
            }
            if(this.data.item.belong ===Config.getConstantData().RheumatologyID  ){
                //如果是风湿免疫科门诊  风湿免疫科
                //需要去填风湿科的问卷 从提交结果页面去跳转互联网小程序
                getApp().extraData=extraData
                this.goWenjuanPage( WXAPI.getAPI_BASE_URL()+Config.getConstantData().RheumatologyQuestionnaire+ '?showDas28=show&userId='+this.data.userId)
            }else {
                wx.navigateToMiniProgram({
                    appId: 'wxe0cbf88bcc095244',
                    envVersion:Config.getConstantData().envVersion,
                    path:'/pages/login/auth?type=FROMPROGRAM&action=1&userId='+this.data.userId,
                    extraData:extraData
                  })
            }
           
              return
           
        }else { //需要个案参与
            if (!this.data.CustUserId) {
                wx.showToast({
                    title: '获取个案管理师列表失败',
                    icon: 'none',
                    duration: 2000
                })
                return
            }
    
            var postData = {
                "execFlag": 0,
                "execUser": this.data.CustUserId,
                "rightsId": this.data.item.id,
                "rightsName": rightContent.attrTypeName,
                "rightsType": rightContent.attrName,
                "statusDescribe": '用户申请使用【' + rightContent.attrTypeName + '】,已分配个案管理师【' + this.data.CustUserName + '】处理',
                "tradeId": Util.formatTime4(new Date()),
                "userId": this.data.userId
            }
        }
        
       
        console.log(postData)
        const res = await WXAPI.saveRightsUseRecord(postData)
        if (res.code == 0) {
            if (rightContent.remark && rightContent.remark.caseFlag === 0) {
                 //不需要个案管理师参与  直接填写资料 分配给医生
                 wx.navigateToMiniProgram({
                    appId: 'wxe0cbf88bcc095244',
                    envVersion:Config.getConstantData().envVersion,
                    path:'/pages/login/auth?type=FROMPROGRAM&action=1&userId='+res.data.userId,
                    extraData:{
                        userId:res.data.userId,
                        tradeId:res.data.tradeId,
                        execFlag:0,
                        attrName:rightContent.attrName,
                        execUser: rightContent.remark.docId,
                        departmentId:this.data.item.belong 
                    }
                  })
            } else if (rightContent.remark && rightContent.remark.uploadDocFlag === '1') {
                //重症会诊 需要填写资料
                wx.navigateTo({
                    url: '../upload/rightsUpload?userId=' + res.data.userId + '&tradeId=' + res.data.tradeId + '&CaseManagerName=' + this.data.CustUserName,
                })
            } else {
                wx.navigateTo({
                    url: './success?title=' + rightContent.attrTypeName + '申请成功！' + '&des=' + '您的申请已提交到您专属的个案管理师[' + this.data.CustUserName + ']，稍后个案管理师会尽快处理，请留意消息。',
                })
            }


        }


    },
//问卷
goWenjuanPage(url) {
    var encodeUrl = encodeURIComponent(url)
    console.log(encodeUrl)
    wx.navigateTo({
        url: '../webpage/index?url=' + encodeUrl
    })
},
    //去提醒
    async sysRemind() {
        if (this.data.item.requesting > 0) {//使用中  提醒
            if (getApp().globalData.remindedRights.indexOf(this.data.item.id) > -1) {
                wx.showToast({
                    title: '已提醒，请勿重复操作',
                    icon: "none",
                })
                return
            }
            var postData1 = {
                "remindType": 'videoRemind',
                "eventType": 2,
                "tradeId": this.data.rightsRecordList[0].tradeId,
                "userId": this.data.rightsRecordList[0].userId,

            }
            console.log(postData1)
            const res1 = await WXAPI.sysRemind(postData1)
            if (res1.code == 0) {
                this.setData({
                    isReminded: true
                })
                wx.showModal({
                    title: '提醒成功！',
                    content: '我们会尽快处理，请耐心等待。',
                    confirmText: '返回主页',
                    success(res) {
                        if (res.confirm) {
                            wx.switchTab({
                                url: '/pages/home/main',
                            })
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
                getApp().globalData.remindedRights.push(this.data.item.id)
            }

        }
    },


    goMain() {
        wx.switchTab({
            url: '/pages/home/main',
        })
    },

    apply() {

        if (this.data.item.requesting > 0) {//使用中  去提醒
            this.sysRemind()
        } else {
            // if (this.data.nameColumns.length === 1) {
            //   this.saveRightsUseRecord(this.data.nameColumns[0].attrName)
            // } else {
            //   this.setData({
            //     hidePoupShow: false
            //   })
            // }
            this.setData({
                hidePoupShow: false
            })
        }



    },
    onPoupPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index

        this.saveRightsUseRecord(this.data.nameColumns[index].attrName)


        this.setData({
            hidePoupShow: true
        });

    },

    onPoupPickerCancel() {
        this.setData({
            hidePoupShow: true
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


})