const WXAPI = require('../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasHIS: -1,
        showNegativeDialog: false,
        showPositiveDialog:false,
        deptCode: '',//科室代码
        regNumber: '',
        deptName: '',
        realName:'',
        zyhNo:'',//住院号
        identificationNo:'',
        emergencyPhone:'',
        emergencyName:'',
        relationship:'本人',

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    getRegNoValue(e) {
        this.setData({
            regNumber: e.detail.value
        })
    },
    getPhoneValue(e) {
        this.setData({
            emergencyPhone: e.detail.value
        })
    },
    getNameValue(e) {
        this.setData({
            emergencyName: e.detail.value
        })
    },

    //有HIS接口的提交
    hasHisNextAction: function () {

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

    if(!this.checkLoginStatus()){
        return
    }

    let that = this

    if (that.data.deptCode.length <= 0) {
        wx.showToast({
          title: '科室代码为空',
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
   confirm () {

    var patientInfoList = UserManager.getPatientInfoList()
   console.log(patientInfoList)
    var user = null
    if (patientInfoList && patientInfoList.length > 0) {
        patientInfoList.forEach(item => {
            if (item.identificationNo === this.data.identificationNo) {
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
        accountId: user.accountId,
        userName: that.data.realName,
        identificationNo: that.data.identificationNo,
        identificationType: '01',//默认身份证
        phone:user.phone,
        code: '1',
        birthday: idInfo.birthDay,
        relationship:that.data.relationship,
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
    var postData={
        urgentTel:this.data.emergencyPhone,
        urgentName:this.data.emergencyName,
        relationship:this.data.relationship,
        idno:this.data.identificationNo,
        adm: this.data.zyhNo,//住院号
        mobile:user.phone,
        name:this.data.realName,
        sex: idInfo.sex == 0 ? 2 : 1 ,
        birthday: idInfo.birthDay,
        userId:userId,
        deptCode:this.data.deptCode,
        deptName:this.data.deptName
    }
  

    const res = await WXAPI.addFollowMedicalRecords(postData)

    if (res.code === 0) {
        this.setData({
            showPositiveDialog:true
        })
    }

},

onDialogConfirm() {
    wx.reLaunch({
        url: '/pages/home/main',
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