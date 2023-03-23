const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        baseInfprData: null,
        userId: "",
        weight: "",
        stature: "",
        selectBlood: "",
        selectMarriage: "",
        selectBear: "",
        boolddTypeData: ["A型", "B型", "AB型", "O型","不详"],
        marriageData: ["未婚", "已婚"],
        BearData: ["已生育", "未生育","备孕期","怀孕期"],
        hidePatientShow: true,
        hideBloodtypeShow: true,
        hideMarriageShow: true,
        hideBearShow: true,
        currentDate: new Date().getTime(),
        selectData: "",
        minDate: new Date().getTime() - 100 * 365 * 24 * 60 * 60 * 1000,
        maxDate: new Date().getTime(),
        formatter(type, value) {
            if (type === 'year') {
                return `${value}年`;
            }
            if (type === 'month') {
                return `${value}月`;
            }
            return value;
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var data = JSON.parse(options.data)
        this.setData({
            userId: options.userId,
            baseInfprData: data,
            weight: data.weight,
            stature: data.height,
        })

        console.log("KKKD:", this.data.baseInfprData)
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },


    async modifyUserExternalInfoOut(e) {
        //发起网络请求
        var requestData = {
            "address": "",
            "birthday": this.data.selectData,
            "bloodType": this.data.selectBlood,
            "havechild": this.data.selectBear ,
            "height": this.data.stature,
            "weight": this.data.weight,
            "ismarry": this.data.selectMarriage ,
            "rh": "",
            "tags": "",
            "userId": this.data.userId,
        }
        console.log("66666：",requestData)
        const res = await WXAPI.modifyUserExternalInfo(requestData)
        if (res.code == 0) {   //返回上一页
            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000)
        }
    },

    //保存
    saveData: function (event) {
        let that = this
        that.modifyUserExternalInfoOut()
    },


    //身高
    getstature: function (event) {
        console.log("KKK:", event.detail.value)
        this.setData({
            stature: event.detail.value,
        })

    },

    //体重
    getweight: function (event) {
        this.setData({
            weight: event.detail.value,
        })
    },



    closePatientTap: function () {
        this.setData({
            hidePatientShow: true,
        })
    },

    bindPatientTap: function () {
        this.setData({
            hidePatientShow: false,
        })
    },


    onDatefirm: function (event) {
        // console.log("MMM:", Util.formatTime2(new Date(event.detail)))
        this.data.baseInfprData.birthday = Util.formatTime2(new Date(event.detail))
        this.setData({
            selectData: Util.formatTime2(new Date(event.detail)),
            hidePatientShow: true,
            baseInfprData: this.data.baseInfprData,
        })
    },


    closeBloodtypeTap: function () {
        this.setData({
            hideBloodtypeShow: true,
        })
    },

    bindbloodTag: function () {
        this.setData({
            hideBloodtypeShow: false,
        })
    },

    selectBloodComf: function (event) {
        this.data.baseInfprData.bloodType = event.detail.value
        this.setData({
            selectBlood: event.detail.value,
            hideBloodtypeShow: true,
            baseInfprData: this.data.baseInfprData,
        })
    },


    closeMarriageTap: function () {
        this.setData({
            hideMarriageShow: false,
        })
    },

    hideMarriageShow: function () {
        this.setData({
            hideMarriageShow: true,
        })
    },

    selectMarriageComf: function (event) {
        console.log("VVVV:", event.detail.value)
        this.data.baseInfprData.ismarry = event.detail.value=="已婚"?1:2,
        this.data.selectMarriage = event.detail.value=="已婚"?1:2,
        // console.log("VVVV111:", this.data.selectMarriage)
            this.setData({
                selectMarriage:  this.data.selectMarriage,
                hideMarriageShow: true,
                baseInfprData: this.data.baseInfprData
            })
    },


    closeBearTap: function () {
        this.setData({
            hideBearShow: false,
        })
    },

    hideBearShow: function () {
        this.setData({
            hideBearShow: true,
        })
    },


    selectBearComf: function (event) {
        this.data.baseInfprData.havechild = event.detail.value
       var databear = 0
        if(event.detail.value=="已生育"){
            databear=1
        }else if(event.detail.value=="未生育"){
            databear=2
        }else if(event.detail.value=="备孕期"){
            databear=3
        }else if(event.detail.value=="怀孕期"){
            databear=4
        }
        this.data.selectBear = databear,
        console.log("EEE:", this.data.selectBear )
            this.setData({
                selectBear:  this.data.selectBear,
                hideBearShow: true,
                baseInfprData: this.data.baseInfprData
            })
    },






})