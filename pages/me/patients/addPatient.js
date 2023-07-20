
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const UserManager = require('../../../utils/UserManager')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        greaterthanSix:true,
        radio: '男',
        checked: false,
        relationArray: [
            {
                id: 0,
                name: '本人'
            },
            {
                id: 1,
                name: '配偶'
            },
            {
                id: 2,
                name: '子'
            },
            {
                id: 3,
                name: '女'
            },
            {
                id: 4,
                name: '父母'
            },
            {
                id: 5,
                name: '其他'
            }
        ],


        accountId: '',
        userName: '',
        cardNo: '',
        identificationNo: '',
        guardianIdcard:'',
        guardianName:'',
        identificationType: '01',
        isDefault: true,
        phone: '',
        code: '',
        birthday: '',
        relationship: '',
        index: 0,
        currentTime: 60,
        btn: false,
        disabled: false,
        fromType: '', //FirstTime第一次添加
        topText: '添加就诊人',
        isFirst: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var account = wx.getStorageSync('userInfo').account

        this.setData({
            fromType: options.fromType,
            accountId: account.accountId
        })

        if (!account.user || account.user.length == 0) {
            this.setData({
                topText: '请先添加就诊人',
                relationship: '本人',
                isDefault: true,
                isFirst: true
            })
        }


    },
    onChange(event) {
        this.setData({
            radio: event.detail,
        });

    },
    bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            relationship: this.data.relationArray[e.detail.value].name
        })
    },
    //切换默认状态
    switchTap: function (e) {

        var isDefault = this.data.isDefault;
        this.setData({
            isDefault: !isDefault
        })
    },
    /**
     * 事件监听,实现单选效果
     * e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
     */
    radioButtonTap: function (e) {
        console.log(e)
        let id = e.currentTarget.dataset.id
        console.log(id)
        for (let i = 0; i < this.data.buttons.length; i++) {
            if (this.data.buttons[i].id == id) {
                //当前点击的位置为true即选中
                this.data.buttons[i].checked = true;
            } else {
                //其他的位置为false
                this.data.buttons[i].checked = false;
            }
        }
        this.setData({
            buttons: this.data.buttons,
            identificationType: id,
        })
    },

    getUserNameValue(e) {
        this.setData({
            userName: e.detail.value
        })
    },
    getIDCardNoValue(e) {
        this.setData({
            identificationNo: e.detail.value
        })
    },

    //监听 就诊人填写的身份证号码年龄
    changeidcard(e){
        var idInfo = Util.getBirthdayAndSex(e.detail.value)
        var isBigSix = this.getAge(idInfo.birthDayformate.split('-'))[0]
        this.setData({
            greaterthanSix:isBigSix>6
        })
        console.log("fff:",isBigSix,this.data.greaterthanSix)
    },


     getAge(birthday) {
        // 新建日期对象
        let date = new Date()
        // 今天日期，数组，同 birthday
        let today = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        // 分别计算年月日差值
        let age = today.map((value, index) => {
            return value - birthday[index]
        })
        // 当天数为负数时，月减 1，天数加上月总天数
        if (age[2] < 0) {
            // 简单获取上个月总天数的方法，不会错
            let lastMonth = new Date(today[0], today[1], 0)
            age[1]--
            age[2] += lastMonth.getDate()
        }
        // 当月数为负数时，年减 1，月数加上 12
        if (age[1] < 0) {
            age[0]--
            age[1] += 12
        }
        return age
    },





    // 监护人身份证号码
    getguardianCardNo(e){
        this.setData({
            guardianIdcard: e.detail.value
        })
        // console.log("ddd:",this.data.guardianIdcard)
    },
    
    // 监护人姓名
    getguardianName(e){
        this.setData({
            guardianName: e.detail.value
        })
        // console.log("2222:",this.data.guardianName)
    },



    getCardNoValue(e) {
        this.setData({
            cardNo: e.detail.value
        })
    },
    getVScodeValue(e) {
        this.setData({
            code: e.detail.value
        })
    },
    getBirthdayValue(e) {
        this.setData({
            birthday: e.detail.value
        })
    },
    getRelationValue(e) {
        this.setData({
            relationship: e.detail.value
        })
    },
    onCheckChange(event) {
        this.setData({
            checked: event.detail,
        });

    },
    //提交
    nextAction: function () {

        let that = this
        var userName = that.data.userName
        var identificationNo = that.data.identificationNo
        if(!that.data.greaterthanSix){
            var guardianIdcard = that.data.guardianIdcard
            var guardianName = that.data.guardianName
        }
        var relationship = that.data.relationship

        if (userName.length <= 0) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none',
                duration: 1500
            })
            return;
        }

        if (identificationNo.length <= 0) {
            wx.showToast({
                title: '请输入身份证号',
                icon: 'none',
                duration: 1500
            })
            return;
        }

      if(!that.data.greaterthanSix){
        if (guardianIdcard.length <= 0) {
            wx.showToast({
                title: '请输入监护人身份证号',
                icon: 'none',
                duration: 1500
            })
            return;
        }

        if (guardianName=='') {
            wx.showToast({
                title: '请输入监护人姓名',
                icon: 'none',
                duration: 1500
            })
            return;
        }
      }
       




        // if (that.data.cardNo.length <= 0) {
        //     wx.showToast({
        //         title: '请输入就诊卡号',
        //         icon: 'none',
        //         duration: 1500
        //     })
        //     return;
        // }
        // if (!Util.idValidator(identificationNo)) {
        //   wx.showToast({
        //     title: '身份证号码有误',
        //     icon: 'error',
        //     duration: 1500
        //   })
        //   return;
        // }

        if (relationship.length <= 0) {
            wx.showToast({
                title: '请选择与本人关系',
                icon: 'none',
                duration: 1500
            })
            return;
        }


        that.addPatientQuery();

    },
    //防抖动
    debounced: false,
    addPatientQuery(e) {

        var that = this;

        if (that.debounced) {
            return
        }
        that.debounced = true
        setTimeout(() => {
            that.debounced = false
        }, 3000)

        var idInfo = Util.getBirthdayAndSex(that.data.identificationNo)

        const postData = {
            tenantId: getApp().globalData.currentHospital.tenantId,
            hospitalCode: getApp().globalData.currentHospital.hospitalCode,
            accountId: that.data.accountId,
            userName: that.data.userName,
            identificationNo: that.data.identificationNo,
            identificationType: '01',//默认身份证
            phone: that.data.phone,
            code: that.data.code,
            birthday: idInfo.birthDay,
            relationship: that.data.relationship,
            isDefault: that.data.isDefault,
            cardNo: that.data.cardNo,
            userSex: idInfo.sex == 0 ? '女' : '男',
            guardianIdcard:that.data.greaterthanSix?that.data.guardianIdcard:'',
            guardianName:that.data.greaterthanSix?that.data.guardianName:'',
        }
        //统一添加微信用户手机号
        postData.phone = wx.getStorageSync('userInfo').account.phone


        WXAPI.addPatientQuery(postData).then(res => {
            if (res.code == 0) {
                console.log(res.data)

                wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                    duration: 2000
                })



                UserManager.savePatientInfoList(res.data)

                //获取缓存的路径地址
                //如果是非正常路径进入的小程序 由于没有用户信息转添加页的 
                let routPage = wx.getStorageSync('routPage-w');
                if (routPage) {
                    //跳转记录地址
                    wx.reLaunch({
                        url: '/' + routPage
                    });
                    //使用后删除
                    wx.removeStorageSync('routPage-w');
                } else {
                    
                        wx.navigateBack({
                            delta: 1,
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

    goConsentPage(e) {
        var type = e.currentTarget.dataset.type
        wx.navigateTo({
            url: '/pages/home/consent/index?type=' + type+'&showbtn=true',
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