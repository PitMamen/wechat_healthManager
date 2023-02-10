const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: '',
        isUsed: false,
        detail: {},
        nameColumns: [],
        numRights: 0,
        reqInfo: {},
        hidePoupShow: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId: options.rightsId,
            userId: options.userId,
            status: options.status,
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
            var num = 0
            var nameColumns = []
            res.data.rightsItemInfo.forEach(attr => {

                //计算是否使用过权益 显示查看交流记录按钮
                if (Number(attr.equityQuantity) - Number(attr.surplusQuantity) > 0) {
                    this.setData({
                        isUsed: true
                    })
                }
                var d = Number(attr.surplusQuantity)
                num = num + d

                if (d > 0) {
                    nameColumns.push(attr)
                }
            })


            this.setData({
                detail: res.data,
                nameColumns: nameColumns,
                numRights: num,
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
    //进入诊室
    enterRoom() {
        wx.navigateBack()
    },
    //再次购买
    bugAgain() {
        wx.navigateTo({
            url: `/pages/health/detail/index?id=${this.data.detail.commodityId}`
        })
    },
    //查询历史咨询
    onHistroyBtnClick(){
        if (this.checkLoginStatus()) {
            if (getApp().globalData.sdkReady) {
                if(this.data.detail.imGroupId && this.data.detail.rightsUseRecordStatus && this.data.detail.rightsUseRecordStatus.id){
                    IMUtil.goGroupChat(this.data.detail.userId,  'navigateTo', this.data.detail.imGroupId, 'textNum',this.data.detail.rightsUseRecordStatus.id, 'END') 
                }
            }
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