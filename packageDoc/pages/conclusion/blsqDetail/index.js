const WXAPI = require('../../../../static/apifm-wxapi/index')

import bus from '../../../../utils/EventBus.js'
// const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: {},
        id: '',
        jianyanList: [],
        jianchaList: [],
        otherList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("EEEE:", options.id)
        this.setData({
            id: options.id,
        })
        this.getCaseSynDetailOut(this.data.id)

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

    },


     //图片预览
     onImageTap: function (e) {
         var url = e.currentTarget.dataset.url
        wx.previewImage({
            current: url,
            urls: this.data.jianyanList,
        })
    },

    //图片预览
    onImageTap1: function (e) {
        var url = e.currentTarget.dataset.url
       wx.previewImage({
           current: url,
           urls: this.data.jianchaList,
       })
   },

    //图片预览
    onImageTap2: function (e) {
        var url = e.currentTarget.dataset.url
       wx.previewImage({
           current: url,
           urls: this.data.otherList,
       })
   },


    // 拒绝
    refuseTap: function () {
        let that = this
        wx.showModal({
            title: '提示',
            content: '是否确认拒绝授权',
            confirmText: '确认',
            cancelText: '取消',
            success(res) {
                if (res.confirm) {
                    that.grantCaseOut(2)
                }
            }
        })
       
    },

    // 同意
    agreeTap: function () {
        let that = this
        that.grantCaseOut(1)
    },


    async grantCaseOut(type) {
        wx.showLoading({
            title: '加载中',
        })
        const res = await WXAPI.grantCase({
            id: this.data.id,
            status: type
        })
        wx.hideLoading()
        if (res.code == 0) {
            wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 2000
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000)
            bus.emit('Success', '')
        }
    },

    // 授权病历详情
    async getCaseSynDetailOut(id) {
        wx.showLoading({
            title: '加载中',
        })
        const res = await WXAPI.getCaseSynDetail(id)
        wx.hideLoading()
        if (res.code == 0) {
            var imgType1 = []
            var imgType2 = []
            var imgType3 = []

            if (res.data) {
                if (res.data.caseImgs) {
                    res.data.caseImgs.forEach(item => {
                        if (item.imgType == 1) {
                            imgType1.push(item.imgPath)
                        } else if (item.imgType == 2) {
                            imgType2.push(item.imgPath)
                        } else if (item.imgType == 3) {
                            imgType3.push(item.imgPath)
                        }
                    });

                    this.setData({
                        jianyanList: imgType1,
                        jianchaList: imgType2,
                        otherList: imgType3
                    })
                }
            }
            this.setData({
                authorizationStatus: res.data.authorizationStatus,
                list: res.data || {},
            })

        }
    }






})