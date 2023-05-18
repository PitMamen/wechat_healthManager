const WXAPI = require('../../static/apifm-wxapi/index')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        diagnosisData:[],
        departmentId:'',
        checkedId:'',
        checkedName:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            departmentId:options.departmentId,
        })
        this.getDiseaseOut(this.data.departmentId)
    },



    async getDiseaseOut(departmentId) {
        //发起网络请求
        var that = this;
        const res = await WXAPI.getDiseaseTypeForDepartmentId(departmentId)
        if (res.code == 0) {
          that.setData({
            diagnosisData: res.data,
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'error',
            duration: 2000
          })
        }
        // console.log("PPP:", this.data.diagnosisData)
      },

      //病种选中切换
      goCheck:function(e){
        var index=e.currentTarget.dataset.index
        // var idx=e.currentTarget.dataset.id
        this.data.diagnosisData[index].checked=!this.data.diagnosisData[index].checked
        this.setData({
            diagnosisData:this.data.diagnosisData
        })
        // console.log(this.data.diagnosisData)
    },

 //保存
 saveData:function(){
    for (let index = 0; index < this.data.diagnosisData.length; index++) {
        if(this.data.diagnosisData[index].checked){
            this.data.checkedId += this.data.diagnosisData[index].id+","
            this.data.checkedName += this.data.diagnosisData[index].typeName+","
           }
    }
    if(this.data.checkedId.length==0){
        wx.showToast({
            title: '请选择出院诊断',
            icon: 'none',
            duration: 1500
        })
        return
    }
    this.data.checkedId = this.data.checkedId.substring(0,this.data.checkedId.lastIndexOf(","))
    this.data.checkedName = this.data.checkedName.substring(0,this.data.checkedName.lastIndexOf(","))
    //  console.log("GGGG:",this.data.checkedId,this.data.checkedName)
     let pages= getCurrentPages()
     let prePage = pages[pages.length-2]
     prePage.setData({
        selectDiaIds: this.data.checkedId,
        selectName: this.data.checkedName
     })
     setTimeout(() => {
        wx.navigateBack({
            delta: 1,
        })
    }, 1000)


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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})