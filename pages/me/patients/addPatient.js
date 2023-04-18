
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const UserManager = require('../../../utils/UserManager')
Page({

    /**
     * 页面的初始数据
     */
    data: {
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
        if (that.data.cardNo.length <= 0) {
            wx.showToast({
                title: '请输入就诊卡号',
                icon: 'none',
                duration: 1500
            })
            return;
        }
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
            userSex: idInfo.sex == 0 ? '女' : '男'
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
                    if (that.data.isFirst) {
                        wx.switchTab({
                            url: '../../home/main'
                        })

                    } else {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }
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