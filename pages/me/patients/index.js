// pages/me/patients/index.js
const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    data: {
        patients: [],
       
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.patientListQuery();
    },
    editClick(e) {
        let id = e.currentTarget.dataset.id
        console.log(id)
        wx.navigateTo({
            url: 'editUser?userId=' + id+'&patientsNum='+this.data.patients.length,
        })
    },

    addBtn() {
        wx.navigateTo({
            url: './addPatient',
        })
    },
    async patientListQuery(e) {
        //发起网络请求
        var that = this;
        const res = await WXAPI.patientListQuery()
       
        if (res.code == 0) {
           
            that.setData({
                patients: res.data.users,
            })
            
            wx.setNavigationBarTitle({
                title: '就诊人管理（' + res.data.users.length + '/4)',
            })    

        } else {
            wx.showToast({
                title: res.message,
                icon: 'error',
                duration: 2000
            })
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    onShareAppMessage: function () {
        // 页面被用户转发
      },
      onShareTimeline: function () {
        // 页面被用户分享到朋友圈
      },
})