const WXAPI = require('../../../../static/apifm-wxapi/index')
const Config = require('../../../../utils/config')

Page({
    data: {
        show1: false,
        show2: false,
        keyWords: '',
        activeId: null,
        activeName: '',
        mainActiveIndex: 0,
        professionalTitle: '',
        list: [],
        status:'0',
        tabs: [{
            title: '关注的医生',
            status: '0'
        },
        {
            title: '关注的团队',
            status: '1'
        }
    ],
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
      
     
    },
    onTabsChange(e) {
        console.log('onTabsChange', e)
        var status = e.detail.name
        this.setData({
            status: status
        })
        this.getList()

    },
    onShow: function () {
        // 页面出现在前台时执行
        this.getList()
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

    getList(){
        if(this.data.status === '0'){
            this.getDoctorLists()
        }else {
            this.getTeamLists()
        }
    },
    //关注的医生
    getDoctorLists() {
        WXAPI.accurateDoctorsForFavourite({
            pageNo: 1,
            pageSize: 9999,
            hospitalCode: getApp().globalData.currentHospital.hospitalCode || undefined,
            queryText: this.data.keyWords.trim(),
            subjectClassifyId: this.data.activeId || '',
            professionalTitle: this.data.professionalTitle
        }).then((res) => {
            this.setData({
                list: res.data.rows || []
            })
        })
    },
    //关注的团队
    getTeamLists() {
        WXAPI.accurateTeamsForFavourite({
            pageNo: 1,
            pageSize: 9999,
            hospitalCode: getApp().globalData.currentHospital.hospitalCode || undefined,
            queryText: this.data.keyWords.trim(),
            subjectClassifyId: this.data.activeId || '',
            professionalTitle: this.data.professionalTitle
        }).then((res) => {
            this.setData({
                list: res.data.rows || []
            })
        })
    },
   
    onInputChange(event) {
        this.getLists()
    },
  
   
    onDoctorTap(event) {
        const item = event.currentTarget.dataset.item
        if(this.data.status === '0'){
            wx.navigateTo({
                url: `/packageDoc/pages/doctor/info/index?id=${item.userId}&title=${item.userName}`
            })
        }else {
            wx.navigateTo({
                url: `/packageDoc/pages/team/info/index?commodityId=${item.userId}&title=${item.userName}`
            })
        }
     
    },
   
  
  
})
