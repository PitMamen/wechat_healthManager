const WXAPI = require('../../../static/apifm-wxapi/index')
const Config = require('../../../utils/config')

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
   
    },
    onLoad: function (options) {
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        this.getLists()
     
    },
    onShow: function () {
        // 页面出现在前台时执行
        this.getLists()
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

    getLists() {
        WXAPI.accurateDoctorsForFavourite({
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
   
   
    onInputChange(event) {
        this.getLists()
    },
  
   
    onDoctorTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: `/pages/doctor/info/index?id=${item.userId}&title=${item.userName}`
        })
    },
   
  
  
})
