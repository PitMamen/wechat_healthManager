const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        showTime: false,
        selectUser: {},
        info: {},//医生信息和套餐信息
        appointList: [],
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        checkedCase: {},//所选病历
        activeAppoint: null,//所选号源
        selectAppoint: null,//最终确认号源
        radioIndex:null,//所选时间段index
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("telinfo-options", options)
        this.setData({
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(',')
        })
        this.setData({
            loading: false,
            selectUser: wx.getStorageSync('defaultPatient'),
            columns: wx.getStorageSync('userInfo').account.user,
            phone: wx.getStorageSync('defaultPatient').phone
        })
        // this.getInfo()
        this.docArrangeInfos()
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
    getInfo() {
        WXAPI.doctorCommodities({
            doctorUserId: this.data.docId
        }).then((res) => {
            this.setData({
                info: res.data || {},

            })
          
        })
    },
    onCaseTap() {

        wx.navigateTo({
            url: `/pages/doctor/case/index?docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&consultType=102&userId=${this.data.selectUser.userId}&userName=${this.data.selectUser.userName}`
        })
    },
    onSelectTap() {
        this.setData({
            show: true
        })
    },
    closePopup() {
        this.setData({
            show: false
        })
    },
    onCancel() {
        this.setData({
            show: false
        })
    },
    onConfirm(event) {
        const index = event.detail.index
        var selectUser = this.data.columns[index]
        if (this.data.selectUser.userId == selectUser.userId) {
            this.setData({
                show: false
            })
        } else {
            this.setData({
                show: false,
                selectUser: this.data.columns[index],
                phone: this.data.columns[index].phone,
                checkedCase: null
            })
        }

    },

    onTimeTap() {
        this.setData({
            showTime: true
        })
    },
    closeTimePopup() {
        this.setData({
            showTime: false
        })
    },
    getPhoneValue(e) {
        this.setData({
            phone: e.detail.value
        })
    },

    //排班
    async docArrangeInfos() {
        const res = await WXAPI.docArrangeInfos({
            doctorUserId: this.data.docId
        })
        if (res.code == 0) {
            this.setData({
                appointList: res.data || [],
                showTime: true,
                radioIndex:null,
            })
           
            if (this.data.appointList.length > 0) {
                if (!this.data.activeAppoint) {
                    this.setData({
                        activeAppoint: this.data.appointList[0],
                        selectAppoint: this.data.appointList[0]
                    })
                }

            }
        }
    },
    //选择号源
    chooseAppoint(e) {
        var item = e.currentTarget.dataset.item
        this.setData({
            activeAppoint: item
        })
    },
    //选择时间段
    onChooseRadioItem(e){
        var index = e.currentTarget.dataset.index
        this.setData({
            radioIndex: index,
          });
    },
    //选择时间段监听
    onRadioChange(e){
        console.log(e)
        this.setData({
            radioIndex: e.detail,
          });
    },
    //确定号源
    confirmTimePopup() {
        if (!this.data.activeAppoint) {
            wx.showToast({
                title: '请选择意向预约时间',
                icon: 'none'
            })
            return
        }
        this.setData({
            showTime: false,
            selectAppoint: this.data.activeAppoint
        })
    },
    async nextAction() {
       
       
    
        if (!this.data.selectAppoint) {
            wx.showToast({
                title: '请选择意向预约时间',
                icon: 'none'
            })
            return
        }
        if (!this.data.radioIndex) {
            wx.showToast({
                title: '请选择咨询时间段',
                icon: 'none'
            })
            return
        }
    
        wx.navigateTo({
            url: `/pages/doctor/choose-patient/index?docId=${this.data.docId}&commodityId=${this.data.docId}&collectionIds=${this.data.collectionIds.join(',')}`
        })
        return
        const res2 = await WXAPI.createStewardOrder({
            channel: 'wechat',
            medicalCaseId: this.data.checkedCase.id,
            collectionIds: this.data.collectionIds || [],
            commodityId: this.data.commodityId,
            doctorUserId: this.data.docId,
            userId: this.data.selectUser.userId,
            doctorAppointId: this.data.selectAppoint.id,
            phone: this.data.phone
        })
        if (res2.code == 0) {
            wx.showToast({
                title: '保存成功',
                icon: 'success'
            })
            wx.navigateTo({
                url: `/pages/doctor/choose-patient/index?id=${res2.data.orderId}&userName=${this.data.selectUser.userName}&orderType=${res2.data.orderType}`
            })
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