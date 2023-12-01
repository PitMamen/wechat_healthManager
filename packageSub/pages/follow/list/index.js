const WXAPI = require('../../../../static/apifm-wxapi/index')


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
        columns: []
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.getLists()
      
    },
    onShow: function () {
        this.setData({
          
            patientList: wx.getStorageSync('userInfo').account.user,
           
        })

        var names = []
        this.data.patientList.forEach(item => {
            names.push(item.userName)
        })
        this.setData({
            nameColumns: names
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

     //获取健康管理列表
     async qryMyFollow() {
        const res = await WXAPI.qryMyFollow({userId:2})
       
          this.setData({
            list: res.data || [],
            })  
        
      },
    getLists() {
        WXAPI.accurateDoctors({
            pageNo: 1,
            pageSize: 9999,
            queryText: this.data.keyWords.trim(),
            subjectClassifyId: this.data.activeId || '',
            professionalTitle: this.data.professionalTitle
        }).then((res) => {
            this.setData({
                list: res.data.rows || []
            })
        })
    },
 
    getColumns() {
        WXAPI.professionalTitles({
            type: 1
        }).then((res) => {
            const columns = (res.data || []).map(item => {
                return {
                    id: item.value,
                    text: item.value
                }
            })
            this.setData({
                columns
            })
        })
    },
   
   
    onDoctorTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: '../detail/index'
        })
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
        this.setData({
            showStatusPop: false,
            professionalTitle: event.detail.value.text
        })
        this.getLists()
    },
    onPatientPickerConfirm(event) {
        console.log(event)
        var index = event.detail.index
        var selectPatient = this.data.patientList[index]
     
        this.setData({
            showPatientPop: false
        });

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
})
