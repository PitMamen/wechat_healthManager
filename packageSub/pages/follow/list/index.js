const WXAPI = require('../../../../static/apifm-wxapi/index')


Page({
    data: {
        isMoreLoading: false,
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
        columns: [{status:'',name:'全部状态'},
        {status:1,name:'进行中'},
        {status:3,name:'已完成'},
        {status:5,name:'已终止'},]
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
 /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log("onReachBottom")
        if (!this.data.isAllLoaded) {
            if(this.data.isMoreLoading){
                return
            }
            this.setData({
                isMoreLoading: true,
                pageNo:this.data.pageNo+1
            })
            this.getLists()
         
        } else {

            wx.showToast({
                title: '没有更多数据了',
                icon: "none",
            })
        }
    },
   
    getLists() {
        
        WXAPI.qryMyFollowPlan({
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize,
            status: this.data.status,
            userId: (this.data.selectUser && this.data.selectUser.userId)?this.data.selectUser.userId:'',
           
        }).then((res) => {
            this.setData({
                isMoreLoading: false
            })

            var list=this.data.list
            console.log(this.data.pageNo)
            if (this.data.pageNo == 1) {
                
                list= res.data.rows                
                
            } else {
                list = list.concat(res.data.rows)
            }
            this.setData({
                list: list,
                isAllLoaded:res.data.pageNo >= res.data.totalPage
            })
            console.log(this.data.list)
        })
    },
 

   
   
    onDoctorTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: '../detail/index?bindId='+item.bindId+'&planId='+item.planId+'&userId='+item.userId
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
})
