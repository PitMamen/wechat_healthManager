const WXAPI = require('../../../../static/apifm-wxapi/index')

const Util = require('../../../../utils/util')

Page({
    data: {
        disabled:false,
        showHidden:false,
        keyWords:'',
        keyWordsdiagnosis:'',
      
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
        appointStartTime:null,//时间段
        appointEndTime:null,//时间段
        consultType: '',//'101': 图文咨询,'102': 电话咨询,'103': 视频咨询
        phone:'',//咨询电话
        showData:false,
        diagnosisDate:'',
        checkDiagnosisList:[],
        minDate: new Date().getTime() - 10 * 365 * 24 * 60 * 60 * 1000,
        maxDate: new Date().getTime(),
        currentDate: new Date().getTime(),
        formatter(type, value) {
            if (type === 'year') {
                return `${value}年`;
            }
            if (type === 'month') {
                return `${value}月`;
            }
            if (type === 'day') {
                return `${value}日`;
            }
            return value;
        },
    },
    onLoad: function (options) {
     
        console.log("fill-options", options)
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
            phone: options.phone,
            doctorAppointId: options.doctorAppointId,
            appointStartTime:options.appointStartTime,
            appointEndTime:options.appointEndTime,
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
            clickName:itemData.hosName,
            hosName: itemData.hosName,
            hosCode: itemData.hosCode,
            hideHospitalPicker: true,
            show:false,
            disabled:false
        })
        console.log("vvv:", this.data.clickName)
    },

    // 点击诊断item
    itemClick(e) {
        var diagnosisData = e.currentTarget.dataset.item
      var  checkDiagnosisList= this.data.checkDiagnosisList
      var result=  checkDiagnosisList.every((item=>{
            return item.icdCode !== diagnosisData.icdCode
        }))
        console.log(result)
        
        if(result){
            checkDiagnosisList.push(diagnosisData)
            this.setData({
                checkDiagnosisList:checkDiagnosisList
            })
        }
        

    },
    //删除已选诊断
    onDiagnosisItemClick(e){
        var diagnosisData = e.currentTarget.dataset.item
        var  checkDiagnosisList= this.data.checkDiagnosisList
        var resultArr=  checkDiagnosisList.filter((item=>{
            return item.icdCode !== diagnosisData.icdCode
        }))
        this.setData({
            checkDiagnosisList:resultArr
        })
        console.log(this.data.checkDiagnosisList)
    },
    //  诊断弹框
    changeDiagnosistab: function () {
        this.setData({
            hideDiagnosisPicker: false,
            disabled:true
        })
    },
    cloaseDiagnosistab: function () {
        console.log('cloaseDiagnosistab')
       
        var icdCode = this.data.checkDiagnosisList.map(item=>{
            return item.icdCode
        }).join(',')
        console.log(icdCode)
        var diagnosisName = this.data.checkDiagnosisList.map(item=>{
            return item.name
        }).join(',')
        console.log(diagnosisName)
        this.setData({
            keyWordsdiagnosis:'',
            diagnosisName: diagnosisName,
            diagnosis:diagnosisName,
            icdCode: icdCode,
            hideDiagnosisPicker: true,
            show:false,
            disabled:false
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
            hideDiagnosisPicker: false,
            disabled:true,
            show:true
        })
    },

    // 显示日历弹框
    showcalendar(){
        this.setData({
            showData:true,
            show:true,
            showHidden:!this.data.showHidden
        })
    },
    closeDateTap(){
        this.setData({
            showData:false,
            show:false,
            showHidden:!this.data.showHidden
        })
    },
    onDatefirm: function (event) {
        var date=Util.formatTime2(new Date( event.detail))
        this.setData({
            diagnosisDate:date,
            showData:false,
            show:false,
        })
    },
 

    close(event){
        this.setData({
            showData:false,
            show:false,
        })
    },

    // dateConfirm:function(event){
    //     console.log("ff:",formatDate(value.target.timeStamp))
    // },




    //机构弹框
    changeHospital: function () {
        console.log("GGGG","11111111111111")
        this.setData({
            show:true,
            hideHospitalPicker: false,
            disabled:true
        })
    },
    //关闭机构弹框
    closeHospitalTap: function () {
        console.log("GGGG","22222222222")
        this.setData({
            show:false,
            keyWords:'',
            hideHospitalPicker: true,
            disabled:false
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
                clickName: res.data.hosName || '',
                hosName: res.data.hosName,
                icdCode: res.data.icd10Code,
                diagnosisName: res.data.icd10Diagnosis,
                diagnosis: res.data.icd10Diagnosis || '',
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
    onSwitchChange(event){
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

            var postdata2={
                channel: 'wechat',
                medicalCaseId: res.data.id,
                collectionIds: this.data.collectionIds || [],
                commodityId: this.data.commodityId,
                doctorUserId: this.data.docId,
                userId: this.data.selectUser.userId,
              
               
            }
            if (this.data.consultType == '102' || this.data.consultType == '103'){
                //电话和视频咨询 添加排班信息
                postdata2.doctorAppointId=this.data.doctorAppointId
                postdata2.visitBeginTime=this.data.appointStartTime
                postdata2.visitEndTime=this.data.appointEndTime
            }
         
            if (this.data.consultType == '102') {
                 //电话咨询 添加电话信息
                postdata2.phone=this.data.phone
            }

                const res2 = await WXAPI.createStewardOrder(postdata2)

                if (res2.code == 0) {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    })
                    wx.navigateTo({
                        url: `/packageDoc/pages/doctor/buy/index?id=${res2.data.orderId}&userName=${this.data.selectUser.userName}&orderType=${res2.data.orderType}`
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
                this.setData({
                    loading: false
                })
            



        } else {
            wx.hideLoading()
            this.setData({
                loading: false
            })
        }

    }
})
