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
        appointList: [],
        todoList: [],
        active: '0',
        unreadConsult: 0,
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
        this.getConsultList()
        this.getInquiriesAgencyList()
    },
    onTabsChange(e) {

        var status = e.detail.name
        this.setData({
            active: status
        })

    },
  //获取待办列表
  async getInquiriesAgencyList() {
    const res = await WXAPI.getInquiriesAgencyList({
        "pageNo": 1,
        "pageSize": 9999
      })
    if (res.code == 0 && res.data && res.data.length>0) {                
            this.setData({
                todoList: res.data,
            })
       
    } else {
        this.setData({
            todoList: []
        })
    }

},
    //获取问诊列表
    async getConsultList() {
        const res = await WXAPI.getConsultList()
        if (res.code == 0 && res.data && res.data.length>0) {        
            var conversationIDArray=[]
                // var appointList=[] 
                res.data[0].imGroupId='@TGS#1MOLE7GMW'
                res.data[0].status={
                    value:3,description:'进行中'
                }
                
                res.data.forEach(item=>{
                    if(item.imGroupId){
                        conversationIDArray.push(item.imGroupId)
                    }
                    
                })
                
                this.setData({
                    appointList: res.data,
                })
                this.getConversationList(conversationIDArray)
            

            
        } else {
            this.setData({
                appointList: []
            })
        }

    },
    
    //获取问诊列表的未读数
    getConversationList(conversationIDArray) {
        if(conversationIDArray.length==0){
            return
        }
        if (getApp().globalData.sdkReady) {
            var appointList=this.data.appointList
            // 获取指定的会话列表
            let promise = getApp().tim.getConversationList(conversationIDArray);
            let that=this
            promise.then(function (imResponse) {
                const conversationList = imResponse.data.conversationList; // 缓存中已存在的指定的会话列表
                console.log("获取指定的会话列表",conversationList)
                var num=0
                if(conversationList && conversationList.length>0){
                    for(var i=0;i<conversationList.length;i++){
                        for(var j=0;j<appointList.length;j++){
                            if( conversationList[i].imGroupId == appointList[j].conversationID){
                                appointList[j].unreadCount= conversationList[i].unreadCount
                                num=num+conversationList[i].unreadCount
                            }
                        }
                    }
                    that.setData({
                        appointList:appointList,
                        unreadConsult:num
                    })
                }
            }).catch(function (imError) {
                console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
            });
        }

    },

    //问诊详情
    goConsultDetail(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {

            wx.navigateTo({
                url: './detail/index?rightsId=' + info.rightsId + '&userId=' + info.userId + '&status=' + info.status.value,
            })

        }


    },
    
     //设置已读
      getInquiriesAgencyRead(idid) {
        WXAPI.getInquiriesAgencyRead(idid)
    },
    //进入诊室
    enterRoom(e) {
        var info = e.currentTarget.dataset.item
      
        IMUtil.goGroupChat(info.userId,  'navigateTo', info.imGroupId, 'textNum', info.rightsId, 'START')
    },
    //再次购买
    bugAgain(e) {
        var info = e.currentTarget.dataset.item
        wx.navigateTo({
            url: `/pages/health/detail/index?id=${info.commodityId}`
        })
    },
    //使用权益
    goApplyRights(e) {
        var info = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {

            wx.navigateTo({
                url: './rights/apply?rightsId=' + info.rightsId + '&userId=' + info.userId,
            })


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