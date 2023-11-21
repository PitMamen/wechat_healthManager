const WXAPI = require('../../static/apifm-wxapi/index')
const UserManager = require('../../utils/UserManager')
const Util = require('../../utils/util')
Page({
    data: {
        showPositiveDialog: false,
        identificationNo: '',
        info: {},
        filterExecuteRecord: [],//已过滤重复的任务列表
        debounced: false,//防抖动
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            info: getApp().followInfo,
            identificationNo: getApp().followInfo.idCard || ''
        })
        console.log(this.data.info)
    },
    getIDCardNoValue(e) {
        this.setData({
            identificationNo: e.detail.value
        })
    },
    getPhoneValue(e) {
        this.setData({
            emergencyPhone: e.detail.value
        })
    },
    bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            relationship: this.data.relationArray[e.detail.value].name
        })
    },
    backAction: function () {
        wx.navigateBack({
            delta: 0,
        })
    },
    //提交
    nextAction: function () {

        
        if (!this.data.identificationNo || this.data.identificationNo.length <= 0) {

            wx.showModal({
                title: '温馨提示',
                content: '请补充身份证号码，若是新生儿可填写亲属身份证号码',

            })
            return;
        }

        if (this.data.debounced) {
            return
        }
        this.setData({
            debounced: true
        })
        setTimeout(() => {
            this.setData({
                debounced: false
            })
        }, 10000)


        var patientInfoList = wx.getStorageSync('allPatientList')
        console.log(patientInfoList)
        var user = null
        if (patientInfoList && patientInfoList.length > 0) {
            patientInfoList.forEach(item => {
                if (this.data.info.hospitalCode == item.hospitalCode) {
                    if (item.identificationNo == this.data.identificationNo + '') {
                        user = item
                    }
                }

            })
        }
        if (user) {
            this.addPatientMedicalRecords(user.userId)

        } else {
            this.addPatientQuery()
        }


    },

    addPatientQuery() {

        var that = this;

        var idInfo = Util.getBirthdayAndSex(that.data.identificationNo + '')
        var user = wx.getStorageSync('userInfo').account

        const postData = {
            tenantId: that.data.info.tenantId,
            hospitalCode: that.data.info.hospitalCode,
            accountId: user.accountId,
            userName: that.data.info.patName,
            identificationNo: that.data.identificationNo,
            identificationType: '01',//默认身份证
            phone: user.phone,//使用微信手机号
            code: '1',
            birthday: idInfo.birthDay,
            relationship: that.data.info.relationship,
            isDefault: true,
            cardNo: '',//就诊卡号
            userSex: idInfo.sex == 0 ? '女' : '男',
            ipNo: that.data.info.regNumber,//住院号
            contactTel: that.data.info.urgentTel || '',//紧急联系电话
        }
        WXAPI.addPatientQuery(postData).then(res => {
            if (res.code == 0) {
                var patientInfoList = res.data
                UserManager.savePatientInfoList(patientInfoList)

                if (patientInfoList && patientInfoList.length > 0) {
                    patientInfoList.forEach(item => {
                        if (item.isDefault) {

                            that.addPatientMedicalRecords(item.userId)
                        }
                    })
                }
            } else {
                wx.showModal({
                    title: '系统提示',
                    content: res.message,
                    showCancel: false,
                })


            }
        }).catch(e => {
            wx.showModal({
                title: '系统提示',
                content: '请求失败，请重试',
                showCancel: false,
            })

        })

    },
    /**
       * 提交
       */
    async addPatientMedicalRecords(userId) {

        var postData = this.data.info
        postData.userId = userId
        postData.idCard = this.data.identificationNo
        var user = wx.getStorageSync('userInfo').account
        postData.mobile = user.phone

        const res = await WXAPI.addFollowMedicalRecords(postData)

        if (res.code === 0) {
            this.switchHospital(userId)
        }

    },
    //切换医院
    async switchHospital(userId) {
        await WXAPI.switchHospital({ hospitalCode: this.data.info.hospitalCode })

        var currentHospital = {
            tenantId: this.data.info.tenantId,
            hospitalCode: this.data.info.hospitalCode,
            hospitalName: '',
            hospitalLevelName: ''
        }

        getApp().globalData.currentHospital = currentHospital

        this.qryFilterExecuteRecordByUserId(userId)

    },

    // 查询用户当天过滤的任务
    async qryFilterExecuteRecordByUserId(userId) {
        const res = await WXAPI.qryFilterExecuteRecordByUserId({ userId: userId })
        if (res.data && res.data.length > 0) {
            //去重
            var list=[]
            res.data.forEach(item1=>{
                var isRepeat=false
                list.forEach(item2=>{
                    if(item1.templateTitle == item2.templateTitle){
                        isRepeat=true
                    }
                })
                if(!isRepeat){
                    list.push(item1)
                }
            })

            this.setData({
                filterExecuteRecord: list,
                showPositiveDialog: true
            })
        } else {
            wx.showToast({
                title: '登记成功',
                icon: 'success',
                duration: 1500
            })

            setTimeout(() => {
                wx.reLaunch({
                    url: '/pages/home/main?type=1',
                })
            }, 1500)
        }

    },

    onDialogConfirm() {
        wx.reLaunch({
            url: '/pages/home/main?type=1',
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})