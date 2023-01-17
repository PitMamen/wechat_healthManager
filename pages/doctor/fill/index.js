const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

Page({
    data: {
        show: false,
        checked: true,
        loading: false,
        inputTxt: '',
        appealDesc: '',
        docId: null,
        commodityId: null,
        selectUser: {},
        collectionIds: [],
        fileList: [],
        columns: []
    },
    onLoad: function (options) {
        // 页面创建时执行
        this.setData({
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(',')
        })
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.setData({
            loading: false,
            selectUser: wx.getStorageSync('defaultPatient'),
            columns: wx.getStorageSync('userInfo').account.user
        })
    },
    onReady: function () {
        // 页面首次渲染完毕时执行
    },
    onHide: function () {
        // 页面从前台变为后台时执行
    },
    onUnload: function () {
        // 页面销毁时执行
    },
    onPullDownRefresh: function () {
        // 触发下拉刷新时执行
    },
    onReachBottom: function () {
        // 页面触底时执行
    },
    onShareAppMessage: function () {
        // 页面被用户分享时执行
    },
    onPageScroll: function () {
        // 页面滚动时执行
    },
    onResize: function () {
        // 页面尺寸变化时执行
    },
    onTabItemTap(item) {
        // tab 点击时执行
    },

    afterRead(event) {
        const files = event.detail.file
        files.forEach(item => {
            WXAPI.uploadImgFile(item.url, "DEFAULT").then((res) => {
                this.data.fileList.push({
                    url: res.fileLinkUrl,
                    fileId: res.id,
                    fileUrl: res.fileLinkUrl,
                    previewFileId: res.previewFileId,
                    previewFileUrl: res.previewUrl
                })
                this.setData({
                    fileList: this.data.fileList
                })
            })
        })
    },
    delete(event) {
        const index = event.detail.index
        this.data.fileList.splice(index, 1)
        this.setData({
            fileList: this.data.fileList
        })
    },
    closePopup() {
        this.setData({
            show: false
        })
    },
    onCancel() {
        wx.navigateTo({
            url: '/pages/me/patients/addPatient'
        })
    },
    onConfirm(event) {
        const index = event.detail.index
        this.setData({
            show: false,
            selectUser: this.data.columns[index]
        })
    },
    onSelectTap() {
        this.setData({
            show: true
        })
    },
    onRadioChange(event) {
        this.setData({
            checked: event.detail
        })
    },
    onSchemeTap() {},
    onNextClick() {
        this.setData({
            inputTxt: this.data.inputTxt.trim()
        })
        if (!this.data.selectUser.userId){
            wx.showToast({
                title: '请选择就诊人',
                icon: 'none'
            })
            return
        }
        if (this.data.inputTxt.length < 10){
            wx.showToast({
                title: '病情描述至少输入十个字符',
                icon: 'none'
            })
            return
        }
        if (!this.data.checked){
            wx.showToast({
                title: '请先阅读协议并勾选',
                icon: 'none'
            })
            return
        }
        this.setData({
            loading: true
        })
        WXAPI.createStewardOrder({
            appealDesc: this.data.appealDesc.trim(),
            collectionIds: this.data.collectionIds || [],
            commodityId: this.data.commodityId,
            doctorUserId: this.data.docId,
            diseaseDesc: this.data.inputTxt,
            userId: this.data.selectUser.userId,
            images: this.data.fileList.map(item => {
                return item.url
            })
        }).then((res) => {
            wx.showToast({
                title: '保存成功',
                icon: 'success'
            })
            wx.navigateTo({
                url: `/pages/doctor/buy/index?id=${res.data.orderId}&userName=${this.data.selectUser.userName}`
            })
        })
    }
})
