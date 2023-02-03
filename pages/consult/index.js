const WXAPI = require('../../static/apifm-wxapi/index')
const IMUtil = require('../../utils/IMUtil')
const Config = require('../../utils/config')
const Util = require('../../utils/util')
const APP = getApp()
Page({

    /**
     * 页面的初始数据
     * 1服务中2待接诊3问诊中4已结束
     */
    data: {
        appointList: [{ status: { value: 1, description: '服务中' } }, { status: { value: 2, description: '待接诊' } }, { status: { value: 3, description: '问诊中' } }, { status: { value: 4, description: '已结束' } }],
        todoList: [{ type: 1, title: '您申请的图文问诊已被接诊' }, { type: 2, title: '医生给您推送李健康宣教文章' }, { type: 3, title: '医生邀请您填写问卷' }],
        active: '0',
        unread: 6,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
 * 生命周期函数--监听页面显示
 */
    onShow: function () {

        this.setData({
            defaultPatient: wx.getStorageSync('defaultPatient')
        })

    },
    onTabsChange(e) {

        var status = e.detail.name
        this.setData({
            active: status
        })

    },
    //问诊详情
    goConsultDetail(e) {
        var rightInfo = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                wx.navigateTo({
                    url: './detail/index?rightsId=' + 60 + '&userId=' + this.data.defaultPatient.userId + '&status=' + rightInfo.status.value,
                })
            }
        }


    },
    //进入诊室
    enterRoom() {

    },
    //再次购买
    bugAgain() {

    },
    //使用权益
    goApplyRights(e) {
        // var id = e.currentTarget.dataset.id
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {

                wx.navigateTo({
                    url: './rights/apply?rightsId=' + 60 + '&userId=' + this.data.defaultPatient.userId,
                })

            }
        }

    },
    //在线咨询
    goIMPage() {
        if (this.checkLoginStatus()) {
            if (getApp().getDefaultPatient()) {
                if (getApp().globalData.sdkReady) {
                    wx.navigateTo({
                        url: '/packageIM/pages/chat/AIChat',
                    })
                }
            }
        }

    },
    async queryRightsUsingRecord() {


        const res = await WXAPI.queryRightsUsingRecord(this.data.defaultPatient.userId, '')

    },




    bindItemTap(e) {



    },

    checkLoginStatus() {

        if (getApp().globalData.loginReady) {
            return true
        } else {
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth',
                        })
                    }
                }
            })
            return false
        }

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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


})