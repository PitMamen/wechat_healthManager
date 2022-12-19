// pages/detail/detail.js


const WXAPI = require('../../../static/apifm-wxapi/index')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        article: {},
        id:'',
        recordId:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)

        if (options.scene) {
            const scene = decodeURIComponent(options.scene)
            console.log(scene)
            console.log(scene.split('&'))
            this.setData({
                id: scene.split('&')[0],
                recordId: scene.split('&')[1],
            })
        } else {
            this.setData({
                id: options.id,
                recordId: options.recordId || 0,
            })
        }

        this.articleById()
        // this.addArticleClickNum(this.data.id)

    },
    async articleById() {
        const res = await WXAPI.articleById(this.data.id, this.data.recordId)

        if (res.code == 0) {

            this.setData({
                article: res.data
            })
            wx.setNavigationBarTitle({
              title: res.title || '健康宣教',
            })
        }



    },
    //更新内容成已完成
    async updateUnfinishedTaskStatus(contentId) {
        await WXAPI.updateUnfinishedTaskStatus(contentId)
    },
    async addArticleClickNum(id) {
        await WXAPI.addArticleClickNum(id)
    },
    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})
