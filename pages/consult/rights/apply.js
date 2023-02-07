const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const Config = require('../../../utils/config')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        rightsId: '',
        userId: '',
        isReminded: false,//是否已经提醒
        fromtype: '',//1购买成功 目前只有购买成功才传值
        detail: {},
        patient: {},
        hidePoupShow: true,
        nameColumns: [],
        rightsRecordList: [],
        steps: [],
        active: 0,
        CustUserId: '',//个案管理师
        CustUserName: ''//个案管理师
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            rightsId: options.rightsId,
            userId: options.userId
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
        this.getRightsInfo(this.data.rightsId)
        this.qryRightsUseLog(this.data.rightsId)
    },
    async getRightsInfo(id) {
        const res = await WXAPI.getRightsInfo({rightsId:id})
        var num = 0
        var nameColumns = []
        res.data.rightsItemInfo.forEach(attr => {
            
            var d = Number(attr.surplusQuantity) 
            num = num +d
           
            if (d > 0) {
                nameColumns.push(attr)
            }
        })


        this.setData({
            detail: res.data,
            nameColumns: nameColumns,
            numRights: num,
        })


    },
    async qryRightsUseLog(id) {
       
        const res = await WXAPI.qryRightsUseLog({dealType:'USE_LOG',rightsId:id})
        if (res.code == 0) {  
            this.setData({
                rightsRecordList: res.data,              
            })
        }


    },
    
    //申请
    async saveRightsUseRecord(rightInfo) {
    
            var postData = rightInfo
            postData.appointTime= Util.formatTime(new Date())
            postData.userId=this.data.userId
            postData.docId=rightInfo.doctorUserId
            postData.rightsItemId=rightInfo.id
       
  
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
//问卷
goWenjuanPage(url) {
    var encodeUrl = encodeURIComponent(url)
    console.log(encodeUrl)
    wx.navigateTo({
        url: '../webpage/index?url=' + encodeUrl
    })
},
    //去提醒
    async sysRemind() {
        if (this.data.item.requesting > 0) {//使用中  提醒
            if (getApp().globalData.remindedRights.indexOf(this.data.item.id) > -1) {
                wx.showToast({
                    title: '已提醒，请勿重复操作',
                    icon: "none",
                })
                return
            }
            var postData1 = {
                "remindType": 'videoRemind',
                "eventType": 2,
                "tradeId": this.data.rightsRecordList[0].tradeId,
                "userId": this.data.rightsRecordList[0].userId,

            }
            console.log(postData1)
            const res1 = await WXAPI.sysRemind(postData1)
            if (res1.code == 0) {
                this.setData({
                    isReminded: true
                })
                wx.showModal({
                    title: '提醒成功！',
                    content: '我们会尽快处理，请耐心等待。',
                    confirmText: '返回主页',
                    success(res) {
                        if (res.confirm) {
                            wx.switchTab({
                                url: '/pages/home/main',
                            })
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
                getApp().globalData.remindedRights.push(this.data.item.id)
            }

        }
    },


    goMain() {
        wx.switchTab({
            url: '/pages/home/main',
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