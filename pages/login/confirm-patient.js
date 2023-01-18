const WXAPI = require('../../static/apifm-wxapi/index')
const UserManager = require('../../utils/UserManager')
const Util = require('../../utils/util')
import bus from '../../utils/EventBus.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasHIS: 0,//HIS接口状态;1开启,2关闭
        showNegativeDialog: false,
        showPositiveDialog: false,
        deptCode: '',//科室代码
        tenantId: '',//租户代码
        hospitalCode: '',//机构代码
        regNumber: '',
        deptName: '',
        realName: '',
        zyhNo: '',//住院号
        identificationNo: '',
        emergencyPhone: '',
        emergencyName: '',
        relationship: '本人',
        debounced:false,//防抖动
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.scene) {
            const scene = decodeURIComponent(options.scene)
            console.log(scene)
            console.log(scene.split('&'))
            this.setData({
                deptCode: scene.split('&')[0],
                tenantId: scene.split('&')[1],
                hospitalCode: scene.split('&')[2],
            })
        } else {
            this.setData({
                deptCode: options.ks,
                tenantId: options.tenantId,
                hospitalCode: options.hospitalCode,
            })
        }
        this.gethospitalInfo(this.data.hospitalCode)
        this.getDepartmentDetail(this.data.deptCode)
    },
    //住院号
    getRegNoValue(e) {
        this.setData({
            regNumber: e.detail.value
        })
    },
    //紧急联系电话
    getPhoneValue(e) {
        this.setData({
            emergencyPhone: e.detail.value
        })
    },
    //紧急联系人
    getNameValue(e) {
        this.setData({
            emergencyName: e.detail.value
        })
    },
    //真实姓名
    getRealNameValue(e) {
        this.setData({
            realName: e.detail.value
        })
    },
    //身份证号
    getIDCardNoValue(e) {
        this.setData({
            identificationNo: e.detail.value
        })
    },
    //住院号
    getzyhNoValue(e) {
        this.setData({
            zyhNo: e.detail.value
        })
    },

    //查询是否His接口
    async gethospitalInfo(hospitalCode) {
        const res = await WXAPI.gethospitalInfo({ hospitalCode: hospitalCode })
        if (res.code == 0) {
            this.setData({
                hasHIS: res.data.hisStatus.value
            })
        }
    },
  //查询科室接口
  async getDepartmentDetail(deptCode) {
      if(deptCode == 0 || deptCode == '0'){
          return
      }
    const res = await WXAPI.getDepartmentDetail(deptCode)
    if (res.code == 0) {
        this.setData({
            deptName: res.data.departmentName
        })
    }
},
    //有HIS接口的提交
    hasHisNextAction: function () {

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
        }, 2000)

        if (!this.checkLoginStatus()) {
            return
        }

        let that = this
        if (that.data.regNumber.length <= 0) {
            wx.showToast({
                title: '请输入住院号',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.emergencyName.length <= 0) {
            wx.showToast({
                title: '请输入紧急联系人姓名',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.emergencyPhone.length <= 0) {
            wx.showToast({
                title: '请输入紧急联系人电话',
                icon: 'none',
                duration: 1500
            })
            return;
        }


        this.qryPatientInfo()
    },
    /**
      * 获取患者信息
      */
    qryPatientInfo(idno) {
        let that = this
        var postdata = {
            "cardType": "",
            "cardNum": "",
            "idno": '',
            "ipNo": this.data.regNumber,
        }

        WXAPI.qryPatientInfo(postdata)
            .then(function (res) {
                if (res.code == 0 && res.data && res.data.IDCard) {
                    res.data.urgentTel = that.data.emergencyPhone
                    res.data.urgentName = that.data.emergencyName
                    res.data.relationship = that.data.relationship
                    res.data.tenantId = that.data.tenantId
                    res.data.hospitalCode = that.data.hospitalCode
                    

                    getApp().followInfo = res.data
                    wx.navigateTo({
                        url: './follow-info',
                    })
                } else {
                    that.setData({
                        showNegativeDialog: true
                    })
                }


            }).catch(function (error) {
                that.setData({
                    showNegativeDialog: true
                })
            });

    },

    //没有HIS接口提交
    noHisNextAction: function () {
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
        }, 2000)

        if (!this.checkLoginStatus()) {
            return
        }

        let that = this

        if (that.data.hospitalCode.length <= 0) {
            wx.showToast({
                title: '医疗机构代码为空，请重新扫码',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.realName.length <= 0) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.identificationNo.length <= 0) {
            wx.showToast({
                title: '请输入身份证号',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.zyhNo.length <= 0) {
            wx.showToast({
                title: '请输入住院号',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.emergencyName.length <= 0) {
            wx.showToast({
                title: '请输入紧急联系人姓名',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.emergencyPhone.length <= 0) {
            wx.showToast({
                title: '请输入紧急联系人电话',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (that.data.emergencyPhone.length != 11) {
            wx.showToast({
                title: '请输入正确的紧急联系人电话',
                icon: 'none',
                duration: 1500
            })
            return;
        }

        this.confirm()
    },

    //没有His接口提交
    confirm() {

        var patientInfoList = UserManager.getPatientInfoList()
        console.log(patientInfoList)
        var user = null
        if (patientInfoList && patientInfoList.length > 0) {
            patientInfoList.forEach(item => {
                if (item.identificationNo === this.data.identificationNo && this.data.hospitalCode == item.hospitalCode) {
                    user = item
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

        var idInfo = Util.getBirthdayAndSex(that.data.identificationNo)
        var user = wx.getStorageSync('userInfo').account
        const postData = {
            tenantId: this.data.tenantId,
            hospitalCode: this.data.hospitalCode,
            accountId: user.accountId,
            userName: that.data.realName,
            identificationNo: that.data.identificationNo,
            identificationType: '01',//默认身份证
            phone: user.phone,
            code: '1',
            birthday: idInfo.birthDay,
            relationship: that.data.relationship,
            isDefault: true,
            cardNo: '',//就诊卡号
            userSex: idInfo.sex == 0 ? '女' : '男',
            ipNo: that.data.zyhNo,//住院号
            contactTel: that.data.emergencyPhone,//紧急联系电话
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
        var idInfo = Util.getBirthdayAndSex(this.data.identificationNo)
        var user = wx.getStorageSync('userInfo').account
        var postData = {
            tenantId: this.data.tenantId,
            hospitalCode: this.data.hospitalCode,
            urgentTel: this.data.emergencyPhone,
            urgentName: this.data.emergencyName,
            relationship: this.data.relationship,
            idno: this.data.identificationNo,
            adm: this.data.zyhNo,//住院号
            mobile: user.phone,
            name: this.data.realName,
            sex: idInfo.sex == 0 ? 2 : 1,
            birthday: idInfo.birthDay,
            userId: userId,
            deptCode: this.data.deptCode,
            deptName: this.data.deptName
        }


        const res = await WXAPI.addFollowMedicalRecords(postData)

        if (res.code === 0) {
            this.switchHospital()

        }

    },
    //切换医院
    async switchHospital() {
        const res = await WXAPI.switchHospital({ hospitalCode: this.data.hospitalCode })
        if (res.code == 0) {
            var currentHospital = {
                tenantId:this.data.tenantId,
                hospitalCode: this.data.hospitalCode,
                hospitalName: '',
                hospitalLevelName: ''
            }

            getApp().globalData.currentHospital = currentHospital
            //保存机构
            wx.setStorageSync('currentHospital', currentHospital)

            this.setData({
                showPositiveDialog: true
            })
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
    checkLoginStatus() {

        if (getApp().globalData.loginReady) {
            return true
        } else {
            wx.showModal({
                title: '温馨提示',
                content: '您还没有登录，请先完成登录再登记。',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth?type=RELOGIN',
                        })
                    }
                }
            })
            return false
        }

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