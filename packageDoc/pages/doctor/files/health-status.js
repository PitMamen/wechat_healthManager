
const WXAPI = require('../../../../static/apifm-wxapi/index')

Page({

    /**
     * 页面的初始数据
     */
    data: {
      tagListInfo:[],
      userId:"",
      checkedId:"",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userId:options.userId,
        })
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
        this.getUserTagsListInfoOut()
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

    },

    goCheck:function(e){
        var index=e.currentTarget.dataset.index
        var idx=e.currentTarget.dataset.idx
        this.data.tagListInfo[index].value[idx].checked=!this.data.tagListInfo[index].value[idx].checked
        this.setData({
            tagListInfo:this.data.tagListInfo
        })
        console.log(this.data.tagListInfo)
    },


 
    async getUserTagsListInfoOut(e){
        const res = await WXAPI.getUserTagsListInfo(this.data.userId)
        if(res.code==0){
            this.setData({
                tagListInfo:res.data
            })
        }
        console.log("CCC:",this.data.tagListInfo)
    },

      //保存
      saveData:function(){
         for (let index = 0; index < this.data.tagListInfo.length; index++) {
             var listData = this.data.tagListInfo[index].value
            for (let index1 = 0; index1 < listData.length; index1++) {
                if(listData[index1].checked){
                 this.data.checkedId += listData[index1].id+","
                }
            }
         }
         this.data.checkedId = this.data.checkedId.substring(0,this.data.checkedId.lastIndexOf(","))
          console.log("GGGG:",this.data.checkedId)

        let that = this
        that.modifyUserExternalInfoOut()
    },


    async modifyUserExternalInfoOut(e) {
        //发起网络请求
        var requestData = {
            "tags": this.data.checkedId,
            "userId": this.data.userId,
        }
        console.log("请求参数：",requestData)
        const res = await WXAPI.modifyUserExternalInfo(requestData)
        if (res.code == 0) {   //TODO  处理保存后跳转

            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
            })
            // setTimeout(() => {
            //     wx.navigateBack({
            //         delta: 1,
            //     })
            // }, 1000)
        }
    },




})