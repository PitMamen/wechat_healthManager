
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hidePatientShow: true,
        hideVlueShow: true,
        fileList: [],
        yylx: ['检查', '检验'],
        jcList: ['CT'],
        jyList: ['血清'],
        lxType: '',
        lxValue: '',
        hideLXShow: true,
        date: '',
        timeList: ['09:00-12:00', '12:00-13:30', '15:30-18:00', '18:00-22:00'],
        timeActive: 0,
        diagnosis: '',
        btnText: '提交',
        loading: false,
        disabled: false,
        success: false,
        inputTxt: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        this.setData({
            rightsDetail: getApp().rightsDetail
        })
        if(!this.data.rightsDetail  || this.data.rightsDetail==null ){
            wx.showToast({
                icon:'none',
              title: '无参数',
            })
        }
    },
    formatTimeNext(date) {
        const year = date.getFullYear() + 1
        const month = date.getMonth() + 1
        const day = date.getDate()


        return year + '-' + month + '-' + day
    },
    /**
   * 生命周期函数--监听页面显示
   */
    onShow: function () {
        this.setData({
            defaultPatient: getApp().getDefaultPatient(),
            patientList: wx.getStorageSync('userInfo').account.user,

        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
      * 获取检查检验配置表
      */
    async getDictList(type) {
        var postData = {
            pageSize: 10000,
            start: 1,
            type: type
        }

        const res = await WXAPI.getDictList(postData)
        if (type === 'Exam') {
            this.setData({
                jyList: res.data.rows
            })
        } else if (type === 'Check')
            this.setData({
                jcList: res.data.rows
            })

    },

    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
        if (selectPatient.userId !== this.data.defaultPatient.userId) {
            this.setData({
                defaultPatient: this.data.patientList[index],
            });
        }
        this.setData({
            hidePatientShow: true
        });

    },
    onPatientPickerCancel() {
        wx.navigateTo({
            url: '/pages/me/patients/addPatient',
        })
    },
    bindPatientTap: function () {
        this.setData({
            hidePatientShow: false
        })
    },
    closePatientTap: function () {
        this.setData({
            hidePatientShow: true
        })
    },
    bindLXTap() {
        this.setData({
            hideLXShow: false
        })
    },
    closeLXTap() {
        this.setData({
            hideLXShow: true
        })
    },

    onLXConfirm(event) {
        console.log(event)
        var value = event.detail.value
        if (value === this.data.lxType) {
            this.setData({
                hideLXShow: true
            })
            return
        } else {
            this.setData({
                lxType: value,
                lxValue: '',
                hideLXShow: true
            })
        }

    },
    bindValueTap() {
        this.setData({
            hideVlueShow: false
        })
    },
    closeValueTap() {
        this.setData({
            hideVlueShow: true
        })
    },
    onValueConfirm(event) {
        console.log(event)
        var value = event.detail.value
        this.setData({
            lxValue: value.name,
            hideVlueShow: true
        })
    },
    bindDateChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            date: e.detail.value
        })
    },
    checkTimeTap: function (event) {
        var index = event.currentTarget.dataset.index
        if (index !== this.data.timeActive) {
            this.setData({
                timeActive: index
            })

        }
    },


    async queryUserInfo(userId) {


        const res = await WXAPI.queryUserInfo(userId)
        if (res.code == 0) {
            this.setData({
                defaultPatient: res.data.user
            })
        }


    },
    //添加图片
    afterRead(event) {
        console.log(event)
        const { file, name } = event.detail;

        let that = this
        const uploadTasks = file.map((file) => this.uploadImgFile(file.url));
        Promise.all(uploadTasks)
            .then(data => {

                const healthImagesVoList = []
                data.map((file) => {
                    var fileInfo = {
                        fileId: file.id,
                        fileUrl: file.fileLinkUrl,
                        url: file.fileLinkUrl,
                        previewFileId: file.previewFileId,
                        previewFileUrl: file.previewUrl
                    }
                    healthImagesVoList.push(fileInfo)
                })

                var fileList = that.data.fileList.concat(healthImagesVoList)

                that.setData({ fileList: fileList });
            })
            .catch(e => {
                wx.showToast({ title: '上传失败,请重试', icon: 'error' });

                console.log(e);

            });
    },

    //删除图片
    delete(event) {
        console.log(event)
        const { index, name } = event.detail;

        this.data.fileList.splice(index, 1);
        this.setData({ fileList: this.data.fileList });
    },

    checkNull() {

        if (this.data.inputTxt == '') {
            wx.showToast({
                icon: "none",
                title: '请描述病情',
            })
            return false
        }
        if (this.data.inputTxt.length < 10) {
            wx.showToast({
                icon: "none",
                title: '至少需要描述10个字',
            })
            return false
        }

        if (this.data.fileList.length === 0) {
            wx.showToast({
                icon: "none",
                title: '上传检查报告或患处图片',
            })
            return false
        }

        return true
    },




    async uploadBtn() {
        if (this.checkNull()) {
            var postData = {
                "execFlag":  0,
                "execUser": this.data.rightsDetail.remark.docId,
                "rightsId": this.data.rightsDetail.usergoodsId,
                "rightsName": this.data.rightsDetail.attrTypeName,
                "rightsType": this.data.rightsDetail.attrName,
                "statusDescribe": '用户申请使用【' + this.data.rightsDetail.attrTypeName + '】,已提交给医生处理',
                "tradeId": Util.formatTime4(new Date()),
                "userId": this.data.rightsDetail.userId
            }

            const res = await WXAPI.saveRightsUseRecord(postData)

            if (res.code === 0) {
                this.saveRightsUserLog(res.data.tradeId)
            }
        }

    },
    async saveRightsUserLog(tradeId) {


        let fileUrlList = this.data.fileList.map(item => item.fileUrl).join(",");
        console.log(fileUrlList)
        var dealResult=''
        if(this.data.rightsDetail.attrName == 'videoNum' || this.data.rightsDetail.attrName == 'telNum'){
            dealResult=this.data.timeList[this.data.timeActive]
        }else{
            dealResult=Util.formatTime(new Date())
        }
        const data = {
            dealDetail: this.data.inputTxt,
            dealResult: dealResult,
            dealImages: fileUrlList,
            dealType: 'REQUEST_DATA',
            dealUser: this.data.rightsDetail.remark.docId,
            tradeId: tradeId,
            userId: this.data.rightsDetail.userId
        }

        const res = await WXAPI.saveRightsUserLog(data)

        if(res.code === 0){
            getApp().rightsDetail.dealDetail=this.data.inputTxt
            getApp().rightsDetail.dealResult=this.data.timeList[this.data.timeActive]
            getApp().rightsDetail.dealImages=fileUrlList
           
            IMUtil.goIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig, 'navigateTo',this.data.rightsDetail.remark.docId,'Doctor',this.data.rightsDetail.attrName,res.data.tradeId,'CONFIRM')
        }
    },
    async uploadImgFile(filePath) {
        return await WXAPI.uploadImgFile(filePath, "DEFAULT")
    },
    onShareAppMessage: function () {
        // 页面被用户转发
      },
      onShareTimeline: function () {
        // 页面被用户分享到朋友圈
      },
})