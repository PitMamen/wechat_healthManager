const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        showTime: false,
        selectUser: {},
        info: {},//医生信息和套餐信息
       
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        checkedCase: {},//所选病历
        activeAppoint: null,//所选号源
        selectAppoint: null,//最终确认号源
        radioIndex: null,//所选时间段index
        gatherHealthFlag: '',//是否采集健康档案;0否;1是
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("choosepatient-options", options)
        this.setData({
            docId: options.docId,
            gatherHealthFlag: options.gatherHealthFlag,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(',')
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
        this.setData({
            loading: false,
            columns: wx.getStorageSync('userInfo').account.user,

        })
    },

    //选择就诊人
    onChooseRadioItem(e) {
        var index = e.currentTarget.dataset.index
        this.setData({
            radioIndex: index,
        });
        this.onConfirm(this.data.radioIndex)
    },
    //选择就诊人监听
    onRadioChange(e) {
        console.log(e)
        this.setData({
            radioIndex: e.detail,
        });
        this.onConfirm(this.data.radioIndex)
    },

    onConfirm(index) {

        var selectUser = this.data.columns[index]
        if (this.data.selectUser.userId == selectUser.userId) {
            this.setData({
                show: false
            })
        } else {
            this.setData({
                show: false,
                selectUser: this.data.columns[index],
                checkedCase: null
            })
        }

    },
    //添加就诊人
    goAddPatientPage() {
        wx.navigateTo({
            url: '/packageSub/pages/me/patients/addPatient',
        })
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





//防抖动
    debounced: false,
    nextAction() {
        if (!this.data.selectUser.userId) {
            wx.showToast({
                title: '请选择就诊人',
                icon: 'none'
            })
            return
        }

        var that = this;

        if (that.debounced) {
            return
        }
        that.debounced = true
        setTimeout(() => {
            that.debounced = false
        }, 3000)

        this.getUserTagStatus()

    },

    async getUserTagStatus() {
        const res = await WXAPI.getUserTagStatus({
            userId: this.data.selectUser.userId,
            tagsType: 'jkzk',//标签分类;jkzk健康状况(默认)
        })

        if (res.code == 0) {
            //状态;1未采集/2部分采集/3全部采集
            if (res.data.status == 3) {
                //直接下订单
                this.createOrder()
            } else {
               
                wx.navigateTo({
                    url: `/packageDoc/pages/health/files/base-info?docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}&userId=${this.data.selectUser.userId}`
                })
            }

        }
    },
    async createOrder(){
        var postdata2={
            channel: 'wechat',
            medicalCaseId: 0,
            collectionIds: this.data.collectionIds || [],
            commodityId: this.data.commodityId,
            doctorUserId: this.data.docId,
            userId: this.data.selectUser.userId,
          
           
        }
       

            const res2 = await WXAPI.createStewardOrder(postdata2)

            if (res2.code == 0) {
               
                wx.navigateTo({
                    url: `/packageDoc/pages/doctor/buy/index?id=${res2.data.orderId}&orderType=${res2.data.orderType}`
                })
            } else if (res2.code == 99302) {
                //超过限购次数
                wx.showModal({
                    title: '提示',
                    content: '您购买此服务已超过次数限制，您可以关注医生的其他服务',
                    confirmText: '医生服务',
                    confirmColor: '#409EFF',
                    success(res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: `/packageDoc/pages/doctor/info/index?id=${that.data.docId}`
                            })
                        }
                    }
                })

            }else {
                
                wx.showModal({
                    title: '提示',
                    content: res2.message,
                    success(res) {
                        if (res.confirm) {
                        }
                    }
                })
            }
            wx.hideLoading()
            
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