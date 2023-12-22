const WXAPI = require('../../../static/apifm-wxapi/index')
const Utils = require('../../../utils/util')


Page({
    data: {
      
        showPatientPop: false,
        showStatusPop: false,
        keyWords: '',
        activeId: null,
        activeName: '',
        mainActiveIndex: 0,
        professionalTitle: '',
        list: [],
        items: [],
        status:'',//状态
        isAllLoaded:false,
        pageNo: 1,
        pageSize: 20,
        selectUser:'',
        beginDate:Utils.formatTime7(new Date() ),
        beginDate2:Utils.formatTime8(new Date() ),
        currentDate: new Date().getTime(),
        maxDate: new Date().getTime(),
    },
    onLoad: function (options) {
        // 页面创建时执行
        this.setData({
          
            patientList: wx.getStorageSync('userInfo').account.user,
            selectUser: wx.getStorageSync('defaultPatient'),
        })

        var names = []
        this.data.patientList.forEach(item => {
            names.push(item.userName)
        })
        this.setData({
            nameColumns: names
        })

        this.getLists()
      
    },
    onShow: function () {
      
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

    onInput(event) {
        this.setData({
          currentDate: event.detail,
        });
      },
   
    getLists() {
        if(this.data.selectUser && this.data.selectUser.userId){
            WXAPI.listReports({
                reportType:'Exam',
                beginDate: this.data.beginDate2,
                endDate: '',
                userId:  this.data.selectUser.userId,
            }).then((res) => {
              
                this.setData({
                    list: res.data
                })
                console.log(this.data.list)
            })
        }


      
    },
 

   
   
    onDoctorTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: '../detail/index?bindId='+item.bindId+'&planId='+item.planId+'&userId='+item.userId
        })
    },

    goInspectionPage(event) {
        
        console.log('goInspectionPage', event)
        var item = event.currentTarget.dataset.item

        if(item.status==='1'){
            let urlPath
            if (item.reportType == 'Check') {
                urlPath = 'inspection-detail'
            } else {
                urlPath = 'examine-detail'
            }
    
            wx.navigateTo({
              
                url: './' + urlPath + '/index?id=' + item.reportId + '&userId=' + this.data.selectUser.userId +
                    '&name='+item.name +'&userName='+ this.data.selectUser.userName +'&userSex=' + this.data.selectUser.userSex+'&userAge=' + this.data.selectUser.userAge + '&reportTime=' + item.reportTime,
            })
        }else{
            wx.showToast({
              title: '等待发布',
              icon:'none'
            })
        }


    },

    bindStatusTap(){
        this.setData({
            showStatusPop: true
        })
    },
    closeStatusPopup() {
        this.setData({
            showStatusPop: false
        })
    },
    onZhiJiCancel() {
        this.setData({
            showStatusPop: false
        })
    },
    onZhiJiConfirm(event) {
        console.log(event)
        this.setData({
            showStatusPop: false,
            status: event.detail.value.status,
            activeName:event.detail.value.name,
            pageNo:1,
        })
       this.getLists()
    },
    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
     
        this.setData({
            showPatientPop: false,
            selectUser:selectPatient,
            pageNo:1,
        });
        this.getLists()
    },
    onPatientPickerCancel() {
        this.setData({
            showPatientPop: false
        })
        
    },
    bindPatientTap: function () {
        this.setData({
            showPatientPop: true
        })
    },
    closePatientTap: function () {
        this.setData({
            showPatientPop: false
        })
    },

    ondatePickerCancel:function () {
        this.setData({
            showStatusPop: false
        })
    },
    ondatePickerConfirm(event) {
        console.log(event)
       
        console.log(Utils.formatTime7(new Date(event.detail) ))
        
        this.setData({
            showStatusPop: false,
            beginDate:Utils.formatTime7(new Date(event.detail) ),
            beginDate2:Utils.formatTime8(new Date(event.detail) )
        });
        this.getLists()
    },
})
