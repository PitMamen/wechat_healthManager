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
        boolddTypeData: ["A型", "B型", "AB型", "O型"],
        marriageData: ["未婚", "已婚"],
        BearData: ["已生育", "未生育"],
        hidePatientShow: true,
        hideBloodtypeShow: true,
        hideMarriageShow: true,
        hideBearShow: true,
        currentDate: new Date().getTime(),
        selectData: "",
        minDate: new Date().getTime() - 100 * 365 * 24 * 60 * 60 * 1000,
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
        console.log("BBBF:", this.data.stature)
        //发起网络请求
        var requestData = {
            "address": "",
            "birthday": this.data.selectData,
            "bloodType": this.data.selectBlood,
            "havechild": this.data.selectBear === "已生育" ? 1 : 2,
            "height": this.data.stature,
            "weight": this.data.weight,
            "ismarry": this.data.selectMarriage === "已婚" ? 1 : 2,
            "rh": "",
            "tags": "",
            "userId": this.data.userId,
        }
        // console.log("请求参数：",requestData)
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
        // console.log("CCC:", event.detail.value)
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
        // console.log("VVVV:", event.detail.value)
        this.data.baseInfprData.ismarry = event.detail.value,
            this.setData({
                selectMarriage: event.detail.value,
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
        this.data.baseInfprData.havechild = event.detail.value,
            this.setData({
                selectBear: event.detail.value,
                hideBearShow: true,
                baseInfprData: this.data.baseInfprData
            })
    },






})