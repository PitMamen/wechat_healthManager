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
        appointList: [],
        consultType: '',//'101': 图文咨询,'102': 电话咨询,'103': 视频咨询
        docId: null,//医生ID
        commodityId: null,//套餐ID
        collectionIds: [],//所选规格ID
        checkedCase: {},//所选病历
        phone:'',//咨询电话
        activeAppoint: null,//所选号源
        selectAppoint: null,//最终确认号源
        radioIndex:-1,//所选时间段index
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("telinfo-options", options)
        this.setData({
            docId: options.docId,
            commodityId: options.commodityId,
            consultType: options.consultType,
            collectionIds: options.collectionIds.split(',')
        })
        this.setData({
            loading: false,
            selectUser: wx.getStorageSync('defaultPatient'),
            columns: wx.getStorageSync('userInfo').account.user,
            phone: wx.getStorageSync('defaultPatient').phone
        })
       
        wx.setNavigationBarTitle({
          title: this.data.consultType == '102'?'电话咨询':'视频咨询',
        })

        this.docArrangeInfos()
    },
    getPhoneValue(e) {
        this.setData({
            phone: e.detail.value
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
    getInfo() {
        WXAPI.doctorCommodities({
            doctorUserId: this.data.docId
        }).then((res) => {
            this.setData({
                info: res.data || {},

            })
          
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
            doctorUserId: this.data.docId,
            type:this.data.consultType == '102'?1:2
        })
        if (res.code == 0) {
            var appointList= res.data || []
         
           
            if (appointList.length > 0) {
                if (!this.data.activeAppoint) {
                    this.setData({
                        activeAppoint: appointList[0],
                        selectAppoint: appointList[0]
                    })
                }

                if(appointList[0].weekDay == '今天'){
                    var mytimeRanges=[]
                    appointList[0].timeRanges.forEach(item=>{
                        if(this.CompareDate(item.endTime)){
                            mytimeRanges.push(item)
                        }
                    })
                    appointList[0].timeRanges=mytimeRanges
                }

            }
            this.setData({
                appointList: appointList,
                showTime: true,
                radioIndex:-1,
            })
        }
    },
        //比较号源和当前时间的大小 如：8:00-8:30
        CompareDate: function (source1) {
            var t1 = source1.split("-")[0]
            var date = new Date();
    
            var a = t1.split(":");
    
            date.setHours(a[0])
            date.setMinutes(a[1])
            date.setMilliseconds(0)
            console.log(date)
            return date >= new Date();
    
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
       
        if(this.data.consultType == '102'){
            if (!this.data.phone) {
                wx.showToast({
                    title: '请填写接听电话',
                    icon: 'none'
                })
                return
            }
        }

    
        if (!this.data.selectAppoint) {
            wx.showToast({
                title: '请选择意向预约时间',
                icon: 'none'
            })
            return
        }
        if (this.data.radioIndex < 0 ) {
            wx.showToast({
                title: '请选择咨询时间段',
                icon: 'none'
            })
            return
        }
        var  appointStartTime=this.data.selectAppoint.timeRanges[this.data.radioIndex].startTime
        var  appointEndTime=this.data.selectAppoint.timeRanges[this.data.radioIndex].endTime
        wx.navigateTo({
            url: `/packageDoc/pages/doctor/choose-patient/index?consultType=${this.data.consultType}&doctorAppointId=${this.data.selectAppoint.id}&appointStartTime=${appointStartTime}&appointEndTime=${appointEndTime}&phone=${this.data.phone}&docId=${this.data.docId}&commodityId=${this.data.commodityId}&collectionIds=${this.data.collectionIds.join(',')}`
        })
     
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