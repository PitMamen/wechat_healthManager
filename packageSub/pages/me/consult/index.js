const WXAPI = require('../../../../static/apifm-wxapi/index')
const IMUtil = require('../../../../utils/IMUtil')
const Config = require('../../../../utils/config')
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
        this.qryMyConsulation()
      
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
            this.qryMyConsulation()
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
    /**
        *我的咨询
        */
    async qryMyConsulation() {
        var postData = {
            userId: this.data.defaultPatient.userId,
            pageNo: 1,
            pageSize: 10000,
            source:'1'
        }

        const res = await WXAPI.qryMyConsulation(postData)
        if (res.code == 0) {
            var list = []
            res.data.rows.forEach(item => {
               
                
                //execFlag 2进行中 1已完成 0申请中 3已终止
                //status )工单状态（0：申请；1：审核通过；2：审核失败；3：预约成功；4：预约失败；5：取消预约申请；6：取消预约成功；7：取消预约失败；8：已报到；9：待支付；10：支付中；11：已支付 12已发送卡片 
                if (item.status === 11 || item.status === 3) {
                    
                        
                     if (item.rightsUseInfo && item.rightsUseInfo.execFlag === 1) {
                            item.myFlag = '已完成'
                            item.myStatus = 1
                            item.flagColor = '#36AF46'
                            list.push(item)
                        }
                    
                   
                } 
                
            })
            this.setData({
                appointList: list
            })
     
        }

    },

    
    bindItemTap(e){
        console.log(e)
        var item=e.currentTarget.dataset.item
        if(item.myStatus===1){//已完成
            if(item.tradeTypeCode==='register'){
                this.goInternetHostpitalIMChat( item.appointDoc,'Doctor',item.appointItem,item.hisId,'END') 
            }else {
                IMUtil.goIMChat( this.data.defaultPatient.userId,this.data.defaultPatient.userSig,'navigateTo',item.appointDoc,'Nurse',item.appointItem,item.hisId,'END')
            }
             
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