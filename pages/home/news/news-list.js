// pages/home/news/news-list.js
const WXAPI = require('../../../static/apifm-wxapi/index')

var page = 1

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isMoreLoading: false,
        deptName: '全部科室',
        screenName: '推荐服务',
        deptArray: [],
        screenData: [
            '推荐服务', '全部服务'
        ],
        keyWords: '',
        tagList: [],
        disease: '', //所属专病
        categoryId: '', //所属专病
        diseaseIndex: '',
        list: [],
        state: 1, //用于标识是否还有更多的状态
        pageSize: 10,
        APItype: 0, //0查询推荐文章 1搜索关键字 2点击专病(2新需求已作废)   
        tabs: [{
                title: '全部',
                status: '0'
            },
            {
                title: '待支付',
                status: '1'
            },
            {
                title: '进行中',
                status: '2'
            },
            {
                title: '已完成',
                status: '3'
            },
            {
                title: '已取消',
                status: '4'
            }
        ],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient')
        })
        page = 1;
        wx.showLoading({
            title: '加载中...',
        })

        this.getArticleCategoryListOut();

        // this.getTagsByClickNum()

    },
    async getArticleCategoryListOut() {
        var that = this;
        var list = this.data.list
        const res = await WXAPI.getArticleCategoryList({
            isVisible: true,
            pageSize: 10000,
            pageNo: 1
        })
        if (res.code == 0) {
            that.setData({
                tabs: res.data.records,
            })
        }
        this.setData({
            categoryId: this.data.tabs[0].id
        })
        that.getArticleByClickNum();

    },

    onTabsChange(e) {
        console.log('onTabsChange', e)
        console.log('onTabsChange id', this.data.tabs[e.detail.index].id)
        var status = e.detail.index
        this.setData({
            categoryId: this.data.tabs[e.detail.index].id
        })
        // this.articleListQuery()
        this.refresh()
    },
    //文章列表
    async articleListQuery() {
        //发起网络请求
        var that = this;
        var list = this.data.list
        const res = await WXAPI.articleListQuery({
            hospitalCode: getApp().globalData.currentHospital.hospitalCode,
            disease: this.data.disease,
            categoryId: this.data.categoryId,
            pageSize: that.data.pageSize,
            start: page
        })
        console.log(res)
        this.setData({
            isMoreLoading: false
        })
        if (res.code == 0) {
            if (page == 1) {
                list = res.data.list
            } else {
                list = list.concat(res.data.list)
            }

            that.setData({
                list: list,
                state: res.data.list.length < that.data.pageSize ? 0 : 1
            })
            page++;
            wx.hideLoading();

        } else {
            wx.showToast({
                title: '数据加载失败',
                icon: 'none',
            })
        }
    },
    //推荐文章列表
    async getArticleByClickNum() {
        //发起网络请求
        var that = this;
        var list = this.data.list
        const res = await WXAPI.getArticleByClickNum({
            hospitalCode: getApp().globalData.currentHospital.hospitalCode,
            userId: this.data.defaultPatient.userId,
            categoryId: this.data.categoryId,
            pageSize: that.data.pageSize,
            pageNo: page
        })
        console.log(res)
        this.setData({
            isMoreLoading: false
        })
        if (res.code == 0) {

            if (page == 1) {
                list = res.data.rows
            } else {
                list = list.concat(res.data.rows)
            }

            that.setData({
                list: list,
                state: res.data.rows.length < that.data.pageSize ? 0 : 1
            })
            page++;
            wx.hideLoading();

        } else {
            wx.showToast({
                title: '数据加载失败',
                icon: 'none',
            })
        }
    },
    //获取的是大家都在看
    async getTagsByClickNum() {

        const res = await WXAPI.getArticleByClickNum({
            hospitalCode: getApp().globalData.currentHospital.hospitalCode,
            pageSize: 100,
            pageNo: 1
        })

        if (res.code == 0) {
            var list = []
            res.data.rows.forEach(item => {
                var hased = false
                list.forEach(name => {
                    if (name == item.articleType) {
                        hased = true
                    }
                })
                if (!hased && item.articleType) {
                    list.push(item.articleType)
                }

            })
            console.log(list)
            this.setData({
                tagList: list
            })
        }
    },
    //搜索
    async articleByTitle() {
        //发起网络请求
        var that = this;
        var list = this.data.list
        const res = await WXAPI.articleByTitle({
            hospitalCode: getApp().globalData.currentHospital.hospitalCode,
            title: this.data.keyWords,
            categoryId: this.data.categoryId,
            pageSize: that.data.pageSize,
            start: page
        })
        console.log(res)
        this.setData({
            isMoreLoading: false
        })
        if (res.code == 0) {
            if (page == 1) {
                list = res.data.list
            } else {
                list = list.concat(res.data.list)
            }

            that.setData({
                list: list,
                state: res.data.list.length < that.data.pageSize ? 0 : 1
            })
            page++;
            wx.hideLoading();

        } else {
            wx.showToast({
                title: '数据加载失败',
                icon: 'none',
            })
        }
    },
    binddiseaseTop(event) {
        var item = event.currentTarget.dataset.item
        var index = event.currentTarget.dataset.index
        this.setData({
            disease: item,
            diseaseIndex: index,
            APItype: 2,
        })
        this.refresh()
    },
    //刷新数据 
    refresh() {
        console.log("refresh")
        page = 1
        this.setData({
            list: []
        });
        if (this.data.APItype === 0) { //查询推荐文章
            this.getArticleByClickNum();
        } else if (this.data.APItype === 1) { //搜索
            this.articleByTitle()
        } else if (this.data.APItype === 2) { //专病
            this.articleListQuery()
        }

    },
    //加载更多数据
    loadMore() {
        console.log("loadMore")
        var that = this;
        var state = that.data.state;
        if (state == 1) {
            this.setData({
                isMoreLoading: true
            })
            if (this.data.APItype === 0) { //查询推荐文章
                this.getArticleByClickNum();
            } else if (this.data.APItype === 1) { //搜索
                this.articleByTitle()
            } else if (this.data.APItype === 2) { //专病
                this.articleListQuery()
            }
        } else {

            wx.showToast({
                title: '没有更多数据了',
                icon: "none",
            })
        }
    },


    goNewsDetail(event) {
        var id = event.currentTarget.dataset.id

        wx.navigateTo({
            url: './news-detail?id=' + id,
        })
    },
    onChange(e) {
        this.setData({
            keyWords: e.detail,
        });
    },

    onSearch() {
        console.log('搜索' + this.data.keyWords);
        this.setData({
            APItype: this.data.keyWords ? 1 : 0,
            disease: '',
            diseaseIndex: ''
        })
        this.refresh()
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
        this.refresh()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log("onReachBottom")
        this.loadMore()
    },

    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})