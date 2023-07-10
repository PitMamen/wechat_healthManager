const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')
const Util = require('../../../utils/util')

Page({
    data: {
        keyWords:'',
        keyWordsdiagnosis:'',
        minDate:'',
        icdCode: '',
        hosCode: '',
        clickName: '',
        hosName: '',
        diagnosisName: '',
        diagnosis: '',
        hideHospitalPicker: true,
        hideDiagnosisPicker: true,
        show: false,
        checked: true,
        offLinechecked: false,//是否线下就诊过
        loading: false,
        inputTxt: '',
        appealDesc: '',
        docId: null,
        commodityId: null,
        selectUser: {},
        collectionIds: [],
        fileList: [],
        hospitalList: [],
        DiagnosisList: [],
        columns: [],
        caseId: null,//病历ID 没有则代表新增
        doctorAppointId: null,//电话咨询排版ID
        consultType: '',//'101': 图文咨询,'102': 电话咨询,'103': 视频咨询
        showData:false,
        diagnosisDate:'',
    },
    onLoad: function (options) {
        var currentDate = new Date().getTime()
        var minDate = currentDate - 1825 * 24 * 60 * 60 * 1000;
        console.log("fill-options", options)
        // 页面创建时执行
        var selectUser = {
            userId: options.userId,
            userName: options.userName
        }
        this.setData({
            minDate:minDate,
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

        this.getList('医院') //传空值 会直接搜索出3w条机构数据 会卡死
        this.searchDiagnosisList("感冒")
    },


    // 获取线下就诊机构
    async getList(keyword) {
        const res = await WXAPI.hospitalList({
            keyword: keyword,
        })
        if (res.code == 0) {
            this.setData({
                hospitalList: res.data.length>=100?res.data.slice(0, 98):res.data,

            })
        }
    },


    // 获取线下就诊诊断
    async searchDiagnosisList(keyword) {
        const res = await WXAPI.searchDiagnosis({
            keyWord: keyword,
        })
        if (res.code == 0) {
            this.setData({
                DiagnosisList: res.data.slice(0, 9),

            })
        }
    },




    //    点击机构item
    itemClickhos(e) {
        var itemData = e.currentTarget.dataset.item
        this.setData({
            keyWords:'',
            clickName: itemData.hosCode+"|"+itemData.hosName,
            hosName: itemData.hosName,
            hosCode: itemData.hosCode,
            hideHospitalPicker: true,
        })
        console.log("vvv:", this.data.clickName)
    },

    // 点击诊断item
    itemClick(e) {
        var diagnosisData = e.currentTarget.dataset.item
        this.setData({
            keyWordsdiagnosis:'',
            diagnosisName: diagnosisData.name,
            diagnosis: diagnosisData.icdCode+"|"+diagnosisData.name,
            icdCode: diagnosisData.icdCode,
            hideDiagnosisPicker: true,
        })
        console.log("vvv11:", this.data.diagnosisName)
    },

    //  诊断弹框
    changeDiagnosistab: function () {
        this.setData({
            hideDiagnosisPicker: false
        })
    },
    cloaseDiagnosistab: function () {
        this.setData({
            keyWordsdiagnosis:'',
            hideDiagnosisPicker: true
        })
    },


    // 机构搜索
    onInputChange(event) {
        this.setData({
            keyWords:event.detail
        })
        this.getList(event.detail)
    },

    // 诊断搜索
    diagnosisChange(event) {
        this.setData({
            keyWordsdiagnosis:event.detail
        })
        this.searchDiagnosisList(event.detail)
    },
    
    // 诊断输入
    inputdiagnosis(event){
        this.setData({
            hideDiagnosisPicker: false
        })
        // this.searchDiagnosisList("感冒")
    },

    // 显示日历弹框
    showcalendar(){
        this.setData({
            showData:true
        })
    },

    dateConfirm(event){
        var date=Util.formatTime2(new Date( event.detail))
        this.setData({
            diagnosisDate:date,
            showData:false
        })
        // console.log("ff:",date)
    },

    close(event){
        this.setData({
            showData:false
        })
    },

    // dateConfirm:function(event){
    //     console.log("ff:",formatDate(value.target.timeStamp))
    // },




    //机构弹框
    changeHospital: function () {
        this.setData({
            hideHospitalPicker: false
        })
    },
    closeHospitalTap: function () {
        this.setData({
            keyWords:'',
            hideHospitalPicker: true
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
                hosCode: res.data.hosCode,
                clickName: res.data.hosCode+"|"+res.data.hosName,
                hosName: res.data.hosName,
                icdCode: res.data.icd10Code,
                diagnosisName: res.data.icd10Diagnosis,
                diagnosis: res.data.icd10Code+"|"+res.data.icd10Diagnosis,
                offLinechecked:res.data.diagnosisFlag==1,
                diagnosisDate:res.data.diagnosisDate,

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
    checkoffLineChange(event) {
        this.setData({
            offLinechecked: event.detail
        })
    },
    onSchemeTap() { },
    async onNextClick() {
        let that = this
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

        if (this.data.offLinechecked) {
           if (!this.data.hosName) {
            wx.showToast({
                title: '请选择就诊机构',
                icon: 'none'
            })
            return
           }

           if (!this.data.diagnosisName) {
            wx.showToast({
                title: '请选择诊断结果',
                icon: 'none'
            })
            return
           }


           if (!this.data.diagnosisDate) {
            wx.showToast({
                title: '请选择诊断日期',
                icon: 'none'
            })
            return
           }
           
        }

        this.setData({
            loading: true
        })

        var postData = {
            appealDesc: this.data.appealDesc.trim(),
            diseaseDesc: this.data.inputTxt,
            userId: this.data.selectUser.userId,
            diagnosisFlag: this.data.offLinechecked ? 1 : 0,
            hosCode: this.data.offLinechecked?this.data.hosCode:'',
            hosName: this.data.offLinechecked?this.data.hosName:'',
            icd10Code: this.data.offLinechecked?this.data.icdCode:'',
            icd10Diagnosis: this.data.offLinechecked?this.data.diagnosisName:'',
            diagnosisDate: this.data.offLinechecked?this.data.diagnosisDate:'',

            images: this.data.fileList.map(item => {
                return item.url
            })
        }
        if (this.data.caseId) {
            //病历ID
            postData.id = this.data.caseId
        }
        wx.showLoading({
            title: '加载中',
        })
        //保存或者修改病历
        const res = await WXAPI.medicalCaseSave(postData)
        if (res.code == 0) {

            if (this.data.consultType + '' == '102') {
                //电话咨询 返回确认信息页面
                var checkedCase = {
                    id: res.data.id,
                    title: res.data.title
                }
                wx.setStorageSync('CheckedCase', checkedCase)
                wx.navigateBack({
                    delta: 2
                })
            } else {
                const res2 = await WXAPI.createStewardOrder({
                    channel: 'wechat',
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
                                    url: `/pages/doctor/info/index?id=${that.data.docId}`
                                })
                            }
                        }
                    })

                }
                wx.hideLoading()
                this.setData({
                    loading: false
                })
            }



        } else {
            wx.hideLoading()
            this.setData({
                loading: false
            })
        }

    }
})
