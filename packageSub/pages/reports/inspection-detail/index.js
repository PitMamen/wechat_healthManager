// pages/record/outpatient/index.js
const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {
            // jcmc:'冠脉造影',
            // name:'李二',
            // sqksmc:'内科',
            // jcksmc:'内科',
            // jclxmc:'超声检查',
            // jcbwff:'胸部',
            // jcbwacr:'--',
            // yxbxjcsj:'肾钙化是指因血钙升高，钙盐沉积在肾实质内，引起肾功能障碍。肾钙化症，多有肾小管酸中毒、先天性肾髓质病变、医源性疾患基础上发生。常见导致肾钙化的疾病有甲状旁腺功能亢进症、肾结核、海绵肾等。',
            // yxzdts:'本案例中的双肾钙化极为典型，钙化的致密影填充了肾脏的所有实质区，整个肾脏的轮廓清晰可见。',
            // bzhjy:'--',
            // bgsj:'2021-09-28'
        }
    },

    // /**
    //  * 生命周期函数--监听页面加载
    //  */
    // onLoad: function (options) {
    //     this.setData({
    //         detail: getApp().globalData.jcxq
    //     })
    //     console.log(this.data.detail)

    // },
    onLoad: function (options) {
   
        console.log('optionsInspect', options)

        this.setData({
            options:options,
            detailId: options.id,
            userId: options.userId,
            userName:options.userName,
            userSex:options.userSex,
            userAge:options.userAge,
            // appointNum: options.appointNum,
        })
   
        this.getExamDetail()
    },

    //报告详情
    async getExamDetail() {
        //发起网络请求
        var that = this;
        const res = await WXAPI.examDetail({
            reportId: this.data.detailId,
            userId: this.data.userId,
        })
        console.log(res)
        if (res.code == 0) {
            that.setData({
                detail: res.data,
            })

            wx.hideLoading();
        } else {
            wx.showToast({
                title: '数据加载失败',
                icon: 'none',
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    onTitleTap(e) {
        console.log(e)
        var index = e.currentTarget.dataset.index
        if (index == this.data.active) {
            return
        }
        let screenWidth = wx.getSystemInfoSync().windowWidth;
        let itemWidth = screenWidth / 4;
        let scrollX = itemWidth * index - itemWidth * 2;
        let maxScrollX = (this.data.titles.length + 1) * itemWidth;
        if (scrollX < 0) {
            scrollX = 0;
        } else if (scrollX >= maxScrollX) {
            scrollX = maxScrollX;
        }

        this.setData({
            x: scrollX,
            active: index,
        })
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

 
    onShareAppMessage: function () {
        // 页面被用户转发
      },
      onShareTimeline: function () {
        // 页面被用户分享到朋友圈
      },
})