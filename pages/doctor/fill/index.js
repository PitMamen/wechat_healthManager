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
        columns: [],
        caseId: null,//病历ID 没有则代表新增
        doctorAppointId: null,//电话咨询排版ID
        consultType: '',//'101': 图文咨询,'102': 电话咨询,'103': 视频咨询
    },
    onLoad: function (options) {
        console.log("fill-options",options)
        // 页面创建时执行
        var selectUser = {
            userId: options.userId,
            userName: options.userName
        }
        this.setData({
            consultType: options.consultType,
            docId: options.docId,
            commodityId: options.commodityId,
            collectionIds: options.collectionIds.split(','),
            selectUser: selectUser,
            caseId: options.caseId,
            doctorAppointId: options.doctorAppointId
        })
        wx.setNavigationBarTitle({
            title: options.caseId ? '查看病历' : '添加病历',
        })
        if (options.caseId) {
            this.getMedicalCase(options.caseId)
        }
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.setData({
            loading: false,
            // selectUser: wx.getStorageSync('defaultPatient'),
            // columns: wx.getStorageSync('userInfo').account.user
        })
    },
    //查看病历
    async getMedicalCase(id) {
        const res = await WXAPI.medicalCaseGet({
            id: id,
        })
        if (res.code == 0) {
            this.setData({
                inputTxt: res.data.diseaseDesc,
                appealDesc: res.data.appealDesc,

            })
            var images = res.data.images || []
            var fileList = images.map((el, index) => {
                return {
                    url: el,
                    fileId: index,
                    fileUrl: el,
                    previewFileId: index,
                    previewFileUrl: el
                }
            })
            this.setData({
                fileList: fileList
            })
        }
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
    onSchemeTap() { },
    async onNextClick() {
        let that=this
        this.setData({
            inputTxt: this.data.inputTxt.trim()
        })
        if (!this.data.selectUser.userId) {
            wx.showToast({
                title: '请选择就诊人',
                icon: 'none'
            })
            return
        }
        if (this.data.inputTxt.length < 10) {
            wx.showToast({
                title: '病情描述至少输入十个字符',
                icon: 'none'
            })
            return
        }
        if (!this.data.checked) {
            wx.showToast({
                title: '请先阅读协议并勾选',
                icon: 'none'
            })
            return
        }

        


        this.setData({
            loading: true
        })
        var postData = {
            appealDesc: this.data.appealDesc.trim(),
            diseaseDesc: this.data.inputTxt,
            userId: this.data.selectUser.userId,
            images: this.data.fileList.map(item => {
                return item.url
            })
        }
        if (this.data.caseId) {
            //病历ID
            postData.id = this.data.caseId
        }
        //保存或者修改病历
        const res = await WXAPI.medicalCaseSave(postData)
        if (res.code == 0) {

            if(this.data.consultType+'' == '102'){
                //电话咨询 返回确认信息页面
                var checkedCase={
                    id:res.data.id,
                    title:res.data.title
                }
                wx.setStorageSync('CheckedCase',checkedCase )
                wx.navigateBack({
                    delta: 2
                  })
            }else{
                const res2 = await WXAPI.createStewardOrder({
                    channel:'wechat',
                    medicalCaseId: res.data.id,
                    collectionIds: this.data.collectionIds || [],
                    commodityId: this.data.commodityId,
                    doctorUserId: this.data.docId,
                    userId: this.data.selectUser.userId,
                    doctorAppointId: this.data.doctorAppointId
                })
               
                if (res2.code == 0) {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    })
                    wx.navigateTo({
                        url: `/pages/doctor/buy/index?id=${res2.data.orderId}&userName=${this.data.selectUser.userName}&orderType=${res2.data.orderType}`
                    })
                }else if(res2.code == 99302){
                    //超过限购次数
                    wx.showModal({
                        title: '提示',
                        content: '您购买此服务已超过次数限制，您可以关注医生的其他服务',
                        confirmText:'医生服务',
                        confirmColor:'#409EFF',
                        success(res) {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: `/pages/doctor/info/index?id=${that.data.docId}`
                                })
                            }
                        }
                    })

                }
                this.setData({
                    loading: false
                })
            }



        }

    }
})
