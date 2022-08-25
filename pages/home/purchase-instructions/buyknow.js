const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fileList: [],
        userId: "",
        targetId: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userId: options.userId,
            targetId: options.targetId,
        })
        console.log("用户ID,GOODID:", this.data.userId, this.data.targetId)
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


    //上传图片接口
    async uploadImgFile(filePath) {
        return await WXAPI.uploadImgFile(filePath, "DEFAULT")
    },

    //提交审核
    async Apply() {
        let fileUrlList = this.data.fileList.map(item => item.fileUrl).join(",");
        var postData = {
            "applyType": 1,
            "medRecordImages": fileUrlList,
            "userId": this.data.userId,
            "targetId": this.data.targetId
        }
        const result = await WXAPI.apply(postData)
        console.log(result)
        if (result.code == 0) {
            wx.showModal({
                title: '提交成功',
                content: '尊敬的用户您好,您的审核申请已提交,工作人员正在努力审核中,审核通过后,即可购买该服务套餐',
                showCancel: false,
                success (res) {
                    wx.navigateBack({
                        delta: 1
                    })
                  }
            })
        }
    },

    //退出当前界面
    cancel() {
        wx.navigateBack({
            delta: 1
        })
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