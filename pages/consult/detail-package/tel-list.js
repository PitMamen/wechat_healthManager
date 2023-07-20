const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id:'',
        rightsId:'',
        applyStatus:false,
        status: '',
        topIcon: '',
        topTitle: '',
        topText: '',
        isUsed: false,
        detail: {},
        rightsItem:{},
        nameColumns: [],
        numRights: 0,
        reqInfo: {},
        hidePoupShow: true,
        radioList: [],
        appointList: [],
        showTime: false,
        activeAppoint: null,
        selectAppoint: null

    },
    innerAudioContext: null,
    myInterval: null,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId: options.rightsId,
            id: options.id,


        })
        this.getRightsInfo(this.data.id)
       
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
    async getRightsInfo(id) {

        const res = await WXAPI.getServiceRightsInfo({ rightsId: id })
        if (res.code == 0) {

            this.setData({
                detail: res.data,
            })
            
        var  rightsItem=   res.data.rightsItemInfo.find(item=>{
                return item.id==this.data.rightsId
            })
            if (res.data.status.value == 4) {
                //套餐已结束
                rightsItem.surplusQuantity=0
            } 
            var applyStatus=false
            if(rightsItem.rightsUseRecords.length>0){
                //2待接诊 3问诊中 4已结束 5已中止
                if(rightsItem.rightsUseRecords[0].status == 4 || rightsItem.rightsUseRecords[0].status == 5){
                   if(rightsItem.surplusQuantity>0){
                    applyStatus=true
                   }
                }
            }else{
                applyStatus=true
            }

            this.setData({
                applyStatus:applyStatus,
                status:rightsItem.rightsUseRecords.length>0 ? rightsItem.rightsUseRecords[0].status  : 1
            })
            if (this.data.status == 2) {
                this.setData({
                    topIcon: '/image/dengdai.png',
                    topTitle: '等待医生接诊',
                    topText: '申请时间：' + rightsItem.rightsUseRecords[0].appointPeriod || ''
                })
            } else if (this.data.status == 3) {
                this.setData({
                    topIcon: '/image/jiezhen.png',
                    topTitle: '已接诊',
                    topText: '确认时间：' +  rightsItem.rightsUseRecords[0].confirmPeriod || ''
                })
            } else if (this.data.status == 4) {
                this.setData({
                    topIcon: '/image/wancheng_2.png',
                    topTitle: '已完成',
                    topText: '结束时间：' + rightsItem.rightsUseRecords[0].updatedTime || ''
                })
            } else if (this.data.status == 5) {
                this.setData({
                    topIcon: '/image/yijuzhen.png',
                    topTitle: '已拒诊',
                    topText: '处理时间：' +  rightsItem.rightsUseRecords[0].updatedTime || ''
                })
            }
            console.log(rightsItem)
            rightsItem.rightsUseRecords.forEach((record,index)=>{
                var voicelist=[]
                if (record.voiceTapeInfo && record.voiceTapeInfo.length > 0) {
                     voicelist = record.voiceTapeInfo.map(((item) => {
                        return {
                            src: item.callTape,
                            isPlay: false,
                            currentTime: 0,
                            duration: item.duration
                        }
                    }))
                    
                }
                // if(index == 0){
                //     voicelist.push({
                //         src: 'https://webfs.ali.kugou.com/202304071435/fd991c75110942b968b8f2a9e005ab24/KGTX/CLTX001/12e8f5a8eb4bb521a83cc723c5d373fb.mp3',
                //                 isPlay: false,
                //                 currentTime: 0,
                //                 duration: 202
                //     })
                //     voicelist.push({
                //         src: 'https://webfs.ali.kugou.com/202304071437/c241e0f0ad1ecccb429496a9f0057d22/KGTX/CLTX001/d2cf20dcb16cfa27eb38895243d22639.mp3',
                //                 isPlay: false,
                //                 currentTime: 0,
                //                 duration: 288
                //     })
                // }else{
                //     voicelist.push({
                //         src: 'https://webfs.ali.kugou.com/202304071438/8e700e13bba381d39ffec52580e95072/KGTX/CLTX001/0e872913445c032d9385da2d5fab4ce5.mp3',
                //                 isPlay: false,
                //                 currentTime: 0,
                //                 duration: 197
                //     })
                //     voicelist.push({
                //         src: 'https://webfs.ali.kugou.com/202304071435/6303b64ce5df2fdad7b8ce294a5b2432/KGTX/CLTX001/ea13e9f873b3b61b07085ecb71c786a0.mp3',
                //                 isPlay: false,
                //                 currentTime: 0,
                //                 duration: 197
                //     })
                // }

                record.radioList=voicelist
            })
          

            this.setData({
                rightsItem: rightsItem
            })

 
        }

    },
    async getRightsReqData(id) {
        const res = await WXAPI.getRightsReqData({ rightsId: id })
        if (res.code == 0) {
            if (res.data.images) {
                var imgArr = res.data.images.split(",");
                console.log(imgArr)
                res.data.healthImagesList = imgArr

            }
            this.setData({
                reqInfo: res.data,
            })
        }

    },


    play(e) {
       
        var index = e.currentTarget.dataset.index
        var idx = e.currentTarget.dataset.idx
        var item =this.data.rightsItem.rightsUseRecords[index].radioList[idx]
        if (!this.innerAudioContext) {
            this.innerAudioContext = wx.createInnerAudioContext()
        }
        clearInterval(this.myInterval)
        if (item.isPlay) {
            this.innerAudioContext.pause() // 暂停

        } else {
            this.innerAudioContext.src = item.src
            var duration = this.innerAudioContext.duration
            console.log("时长：" + duration)
            this.innerAudioContext.startTime = item.currentTime// 开始时间
            this.innerAudioContext.play() // 播放
           

            this.myInterval = setInterval(() => {

                 item.currentTime =item.currentTime + 1
                if (item.currentTime > item.duration) {
                    clearInterval(this.myInterval)
                    item.isPlay = false
                    
                    this.setData({
                        rightsItem: this.data.rightsItem
                    })
                }

                this.setData({
                    rightsItem: this.data.rightsItem
                })
            }, 1000)

        }
        console.log(this.data.rightsItem.rightsUseRecords[index].radioList[idx])
        this.data.rightsItem.rightsUseRecords.forEach((it,index1)=>{
            it.radioList.forEach((el,index2) => {
                if(index1==index && index2==idx){
                    el.isPlay = !el.isPlay
                }else{
                    el.isPlay = false
                }
               
            })
        })
       
        console.log(this.data.rightsItem.rightsUseRecords[index].radioList[idx])
        this.setData({
            rightsItem: this.data.rightsItem
        })
    },
 
    onSliderChange(e) {
        console.log(e)
        var index = e.currentTarget.dataset.index
        var idx = e.currentTarget.dataset.idx
        var item =this.data.rightsItem.rightsUseRecords[index].radioList[idx]
        item.currentTime = e.detail
        this.setData({
            rightsItem: this.data.rightsItem
        })
        if (this.innerAudioContext) {
            if (this.innerAudioContext.src == item.src) {
                // this.innerAudioContext.play()
                this.innerAudioContext.seek(e.detail)
            }

        } else {
            console.log("innerAudioContext是空")
        }

    },

    //再次申请
    applyAgain() {
        wx.redirectTo({
            url: `/pages/consult/detail-package/telinfo/index?id=${this.data.id}&rightsId=${this.data.rightsId}`
        })
    },

    //排班
    async doctorAppointInfos() {
        const res = await WXAPI.doctorAppointInfos({
            doctorUserId: this.data.detail.docInfo.userId
        })
        if (res.code == 0) {
            this.setData({
                appointList: res.data || [],
                showTime: true,

            })

            if (this.data.appointList.length > 0) {
                if (!this.data.activeAppoint) {
                    this.setData({
                        activeAppoint: this.data.appointList[0]
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

        this.saveRightsUseRecord()
    },
    closeTimePopup() {
        this.setData({
            showTime: false
        })
    },
    //申请
    async saveRightsUseRecord() {
        let that = this
        var postData = this.data.rightsItem
        postData.appointTime = this.data.selectAppoint.fullVisitDate
        postData.appointPeriod = this.data.selectAppoint.visitStartTime + '-' + this.data.selectAppoint.visitEndTime
        postData.userId = this.data.detail.userId
        postData.docId = postData.doctorUserId
        postData.rightsItemId = postData.id

        const res = await WXAPI.saveRightsUseRecordNew(postData)
        if (res.code == 0) {

            wx.showToast({
                title: '申请成功！',
                duration: 2000
            })
            setTimeout(() => {
                wx.navigateBack()
            }, 2000)
        }


    },
    //进入诊室
    enterRoom() {
        if (this.checkLoginStatus()) {
            if (getApp().globalData.sdkReady) {
                IMUtil.goGroupChat(this.data.detail.userId, 'navigateTo', this.data.detail.imGroupId, 'textNum', this.data.rightsItem.rightsUseRecords[0].id, 'START')
            }
        }
    },
        //查询历史咨询
        onHistroyBtnClick() {
            if (this.checkLoginStatus()) {
                wx.navigateTo({
                    url: `/packageIM/pages/chat/groupHistoryChat?groupID=${this.data.detail.imGroupId}&inquiryType=${'textNum'}&tradeId=${this.data.rightsItem.rightsUseRecords[0].id}&tradeAction=${'END'}&userId=${this.data.detail.userId}`,
                })
            }
    
    
        },
    //再次购买
    bugAgain() {
        // wx.navigateTo({
        //     url: `/packageDoc/pages/doctor/info/index?id=${this.data.detail.docInfo.userId}&title=${this.data.detail.docInfo.userName}`
        // })
        wx.navigateTo({
            url: `/packageDoc/pages/doctor/detail/index?id=${this.data.detail.commodityId}&docId=${this.data.detail.docInfo.userId}&docName=${this.data.detail.docInfo.userName}`
        })
    },
    checkLoginStatus() {

        if (getApp().globalData.loginReady) {
            return true
        } else {
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth',
                        })
                    }
                }
            })
            return false
        }

    },

    //图片预览
    onImageTap: function (e) {
        var url = e.currentTarget.dataset.url

        wx.previewImage({
            urls: this.data.reqInfo.healthImagesList,
            current: url
        })
    },
    apply() {
        this.setData({
            hidePoupShow: false
        })

    },
    onPoupPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index

        this.saveRightsUseRecord(this.data.nameColumns[index])


        this.setData({
            hidePoupShow: true
        });

    },

    onPoupPickerCancel() {
        this.setData({
            hidePoupShow: true
        })
    },
    checkLoginStatus() {

        if (getApp().globalData.loginReady) {
            return true
        } else {
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth',
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
        if (this.innerAudioContext) {
            this.innerAudioContext.pause() // 暂停
        }

        clearInterval(this.myInterval)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        if (this.innerAudioContext) {
            this.innerAudioContext.destroy()
            this.innerAudioContext = null
        }

        clearInterval(this.myInterval)

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