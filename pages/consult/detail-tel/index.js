const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: '',//2待接诊 3问诊中 4已结束 5已中止
        topIcon:'',
        topTitle:'',
        topText:'',
        isUsed: false,
        detail: {},
        nameColumns: [],
        numRights: 0,
        reqInfo: {},
        hidePoupShow: true,
        radioList: []

    },
    innerAudioContext: null,
    myInterval: null,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId: options.rightsId,
            userId: options.userId,
            
        })
        this.getRightsInfo(this.data.rightsId)
        this.getRightsReqData(this.data.rightsId)
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
        
        const res = await WXAPI.getRightsInfo({ rightsId: id })
        if (res.code == 0) {
          
            this.setData({
                detail: res.data,
               status:res.data.rightsUseRecordStatus.status
            })
            if(res.data.voiceTapeInfo && res.data.voiceTapeInfo.length>0 ){
             var  voicelist= res.data.voiceTapeInfo.map(((item)=>{
                    return {
                        src: item.callTape, 
                        isPlay: false,
                         currentTime: 0, 
                         duration: item.duration
                    }
                }))
            }
            this.setData({
                radioList: voicelist
        
            })
            if(this.data.status == 2){
                this.setData({
                    topIcon: '/image/dengdai.png',
                    topTitle:'等待医生接诊',
                    topText:'申请时间：'+this.data.detail.rightsUseRecordStatus.appointPeriod || ''
                })
            }else if(this.data.status == 3){
                this.setData({
                    topIcon: '/image/jiezhen.png',
                    topTitle:'已接诊',
                    topText:'确认时间：'+this.data.detail.rightsUseRecordStatus.confirmPeriod || ''
                })
            }else if(this.data.status == 4){
                this.setData({
                    topIcon: '/image/wancheng_2.png',
                    topTitle:'通话已完成',
                    topText:'确认时间：'+this.data.detail.rightsUseRecordStatus.confirmPeriod || ''
                })
            }else if(this.data.status == 5){
                this.setData({
                    topIcon: '/image/yijuzhen.png',
                    topTitle:'已拒诊',
                    topText:'处理时间'+this.data.detail.rightsUseRecordStatus.updateTime || ''
                })
            }
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
    //申请
    async saveRightsUseRecord(rightInfo) {

        var postData = rightInfo
        postData.appointTime = Util.formatTime(new Date())
        postData.userId = this.data.userId
        postData.docId = rightInfo.doctorUserId
        postData.rightsItemId = rightInfo.id

        const res = await WXAPI.saveRightsUseRecordNew(postData)
        if (res.code == 0) {

            wx.showToast({
                title: '申请成功！',
            })
            setTimeout(() => {
                wx.switchTab({
                    url: '/pages/consult/index',
                })
            }, 1000)
        }


    },

    play(e) {
        var item = e.currentTarget.dataset.item
        var index = e.currentTarget.dataset.index
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
            this.innerAudioContext.play() // 播放

            this.myInterval = setInterval(() => {
                this.data.radioList[index].currentTime = this.data.radioList[index].currentTime + 1
                if(this.data.radioList[index].currentTime>this.data.radioList[index].duration){
                    clearInterval(this.myInterval)
                    this.data.radioList[index].isPlay = false
                    this.setData({
                        radioList: this.data.radioList
                    })
                }

                this.setData({
                    radioList: this.data.radioList
                })
            }, 1000)

        }
        this.data.radioList.forEach(el => {
            el.isPlay = false
        })
        this.data.radioList[index].isPlay = !item.isPlay
        this.setData({
            radioList: this.data.radioList
        })
    },

    //进入诊室
    enterRoom() {
        if (this.checkLoginStatus()) {
            if (getApp().globalData.sdkReady) {
                IMUtil.goGroupChat(this.data.detail.userId, 'navigateTo', this.data.detail.imGroupId, 'textNum', this.data.detail.rightsUseRecordStatus.id, 'START')
            }
        }
    },
    //再次购买
    bugAgain() {
        // wx.navigateTo({
        //     url: `/pages/doctor/info/index?id=${this.data.detail.docInfo.userId}&title=${this.data.detail.docInfo.userName}`
        // })
        wx.navigateTo({
            url: `/pages/doctor/detail/index?id=${this.data.detail.commodityId}&docId=${this.data.detail.docInfo.userId}&docName=${this.data.detail.docInfo.userName}`
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
    //查询历史咨询
    onHistroyBtnClick() {
        if (this.checkLoginStatus()) {
            // if (getApp().globalData.sdkReady) {
            //     if(this.data.detail.imGroupId && this.data.detail.rightsUseRecordStatus && this.data.detail.rightsUseRecordStatus.id){
            //         IMUtil.goGroupChat(this.data.detail.userId,  'navigateTo', this.data.detail.imGroupId, 'textNum',this.data.detail.rightsUseRecordStatus.id, 'END') 
            //     }
            // }

            wx.navigateTo({
                url: `/packageIM/pages/chat/groupHistoryChat?groupID=${this.data.detail.imGroupId}&inquiryType=${'textNum'}&tradeId=${this.data.detail.rightsUseRecordStatus.id}&tradeAction=${'END'}&userId=${this.data.detail.userId}`,
            })
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