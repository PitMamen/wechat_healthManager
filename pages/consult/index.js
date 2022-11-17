const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')
const Config = require('../../utils/config')
const Util = require('../../utils/util')
const APP = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        appointList: [],
        hidePatientShow: true,
        activeStatus: 'all',
        active: 0,
        appointItem: '',
        status: '',

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       
    },
 
    /**
 * 生命周期函数--监听页面显示
 */
    onShow: function () {
        this.setData({
            defaultPatient:getApp().getDefaultPatient(),
            patientList: wx.getStorageSync('userInfo').account.user,
 
        })
        this.queryRightsUsingRecord()
      
    },
    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
        if (selectPatient.userId !== this.data.defaultPatient.userId) {
            this.setData({
                defaultPatient: this.data.patientList[index],
            });
            wx.setStorageSync('defaultPatient', this.data.patientList[index])
            IMUtil.LoginOrGoIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig)
            this.queryRightsUsingRecord()
        }
        this.setData({
            hidePatientShow: true
        });

    },
    onPatientPickerCancel() {
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

async queryRightsUsingRecord(){
    var allTaskList = []
    const res = await WXAPI.queryRightsUsingRecord(this.data.defaultPatient.userId, '')
    if (res.code == 0) {
     
        res.data.forEach(item => {
            //时效限制
            item.serviceExpire = 0
            //条数限制
            item.textNumLimit = 0
            //时长
            item.timeLimit = 0
            if (item.userAttrInfo && item.userAttrInfo.length > 0 && item.userAttrInfo[0].remark) {
                if (item.userAttrInfo[0].remark.serviceExpire) {
                    item.serviceExpire = item.userAttrInfo[0].remark.serviceExpire
                }
                if (item.userAttrInfo[0].remark.textNumLimit) {
                    item.textNumLimit = item.userAttrInfo[0].remark.textNumLimit
                }
                if (item.userAttrInfo[0].remark.timeLimit) {
                    item.timeLimit = item.userAttrInfo[0].remark.timeLimit
                }
            }
            
            //医生护士类型
            item.DoctorName = '医生'
            item.DoctorType = 'Doctor'
            if (item.userAttrInfo && item.userAttrInfo.length > 0 && item.userAttrInfo[0].remark && item.userAttrInfo[0].remark.whoDeal && item.userAttrInfo[0].remark.whoDeal === 'nurse') {           
                item.DoctorName = '护士'
                item.DoctorType = 'Nurse'
            }
            //处理完成
            if (item.execFlag === 2) {
                var execTime = (new Date(item.execTime)).getTime();
                var nowTime=new Date().getTime()

                if(execTime>nowTime){
                    item.myFlag = '待进行'
                item.myStatus = 2
                item.flagColor = '#F0990F'
                }else{
                    item.myFlag = '进行中'
                    item.myStatus = 2
                    item.flagColor = '#F0990F'
                }
                allTaskList.push(item)
            }else if (item.execFlag === 0) {
                item.myFlag = '待使用'
                item.myStatus = 4
                item.flagColor = '#1880E8'
                allTaskList.push(item)
            } 
  
        })
        this.setData({
            appointList: allTaskList
        })
    }
},



    
    bindItemTap(e){
        var task = e.currentTarget.dataset.item
    
                if (task.DoctorType == 'Nurse') {

                    IMUtil.goIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig, 'navigateTo', task.execUser, 'Nurse', task.rightsType, task.tradeId, 'START')
                } else if (task.DoctorType = 'Doctor') {
                    this.getRegisterTradeByRights(task)
                }

            
      
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