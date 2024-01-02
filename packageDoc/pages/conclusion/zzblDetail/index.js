const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list:[1,1,1],
        checkList:[],
        examList:[]

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            caseId:options.caseId,
            hospital:options.hospital,
            date:options.date
        })
        this. getCaseCheck()
        this.getCaseExam()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },
     getCaseCheck() {
      
        WXAPI.getCaseCheck({
            caseId: this.data.caseId,
            encodeFlag : 0
        }).then(res=>{
            this.setData({
                checkList:res.data.data || []
            })
        })
        
    },
    getCaseExam() {
      
        WXAPI.getCaseExam({
            caseId: this.data.caseId,
            encodeFlag : 0
        }).then(res=>{
            this.setData({
                examList:res.data.data || []
            })
        })
        
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})