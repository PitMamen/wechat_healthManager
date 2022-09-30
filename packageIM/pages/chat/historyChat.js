// pages/list/list.js
import voiceManager from "./msg-type/voice-manager";
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

export const ACTION_TYPE = {
    INVITE: 1, // 邀请方发起邀请
    CANCEL_INVITE: 2, // 邀请方取消邀请
    ACCEPT_INVITE: 3, // 被邀请方同意邀请
    REJECT_INVITE: 4, // 被邀请方拒绝邀请
    INVITE_TIMEOUT: 5, // 被邀请方超时未回复
}

Page({

    onMessageReceived: '',
    onMessageReadByPeer: '',
    _freshing: false,
    data: {
        showVideo:false,
        videoObj:{},
        showChatInput: false,
        hideTimeShow: true,
        toAvatar:'../../../image/avatar.png',//聊天对象头像
        myAvatar:'../../../image/avatar.png',//自己头像
        pageNo:1,
        pageSize:20,
        userId:'',
        toUserID:'',
        tradeAction: 'END',
        textMessage: '',
        chatItems: [],//消息列表
        nextReqMessageID: '',//用于续拉，分页续拉时需传入该字段。
        isCompleted: '',//表示是否已经拉完所有消息。
        triggered: false,//设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
        latestPlayVoicePath: '',
        scrollTopVal: '',
        pageHeight: '',
        currentPlayItem: {},
        chatStatue: '',
        extraArr: [],
        topArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("chat page: onLoad")
        console.log(options)
        var myAvatar = wx.getStorageSync('userInfo').account.avatarUrl
        this.setData({
            pageHeight: wx.getSystemInfoSync().windowHeight,
            userId: options.userId,
            toUserID: options.toUserId,
            myAvatar: myAvatar,
        })

        this.getUserInfo()

        this.getHistoryMessageList()
      
        this.voiceManager = new voiceManager(this)
        


        //禁止截屏录屏
        wx.setVisualEffectOnCapture({
            visualEffect: 'hidden',
            success: function (res) {

            },
        })

    },
    onShow: function (e) {
        console.log("chat page: onShow")
        
    },
    goHome(){
        wx.switchTab({
          url: '/pages/consult/index',
        })
      },
      goDoctorDetail(){
        wx.navigateTo({
          url: '/pages/me/my-doctor/doctor-detail?doctorId='+this.data.toUserID,
        })
      },




    onUnload() {
        console.log("chat page: onUnload")
        //放开截屏录屏
        wx.setVisualEffectOnCapture({
            visualEffect: 'none',
        })
        this.voiceManager.stopAllVoicePlay(true);
       
      
    },

    //查询用户信息
    getUserInfo(){
        let that=this
        WXAPI.healthRecordUserInfo(this.data.toUserID)
        .then(res=>{
            wx.setNavigationBarTitle({
                title: res.data.baseInfo.userName || that.data.toUserID
            });

            that.setData({
                userProfile: res.data.baseInfo,
            });
        }).catch(e=>{
            wx.setNavigationBarTitle({
                title:  that.data.toUserID
            });
        })
    },
  //获取聊天对象信息 单聊
  getUserProfile() {
    let that = this
    let promise = getApp().tim.getUserProfile({
        userIDList: [this.data.toUserID] // 请注意：即使只拉取一个用户的资料，也需要用数组类型，例如：userIDList: ['user1']
    });
    promise.then(function (imResponse) {
        console.log(imResponse);
        const userProfile = imResponse.data[0];

        wx.setNavigationBarTitle({
            title: userProfile.nick || userProfile.userID
        });

    }).catch(function (imError) {
        console.warn('getUserProfile error:', imError); // 获取其他用户资料失败的相关信息
    });

},
    //获取医生信息
    async doctorDetailQuery() {

        var doctor_list = [this.data.toUserID]
       
        const res = await WXAPI.doctorInfoQuery(doctor_list)
     
        if (res.code == 0 && res.data.length>0) {
            wx.setNavigationBarTitle({
                title: res.data[0].userName 
            });
            this.setData({
                toAvatar:res.data[0].avatarUrl
            })
        }
    },
 

    async getHistoryMessageList() {
        let that=this
        const postData = {
            pageNo: this.data.pageNo,
            pageSize:this.data.pageSize,
            sort:1 ,
            toAccount: this.data.toUserID,
            fromAccount: this.data.userId
        }
        const res = await WXAPI.queryHistoryIMRecordPage(postData)

        if (res.code === 0 ) {
            const messageList = res.data.rows; // 消息列表。
            that.setMultItemAndScrollPage(messageList, false, this.data.pageNo===1,this.data.pageNo>1)
            that.setData({            
                isCompleted: res.data.pageNo>=res.data.totalPage,
                pageNo: res.data.pageNo+1
            })
            that.setData({
                triggered: false,
            })
            that._freshing = false
        }
    
    },

    onReady: function (res) {
        this.videoContext = wx.createVideoContext('myVideo')
      },
    // 下拉查看更多消息
    onRefresh: function (e) {
        console.log("onRefresh")
        if (this._freshing) return
        this._freshing = true
        if (this.data.isCompleted) {
            wx.showToast({
                icon: 'none',
                title: "没有更多消息了",
                duration: 2000
            })
            this.setData({
                triggered: false,
            })
            this._freshing = false
            return
        }
        this.getHistoryMessageList()

    },
    
    //图预览
    imageClickEvent(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url, // 当前显示图片的http链接
            urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
        })
    },
    //点击输入框上方按钮
    heathItemClickEvent(e) {
        console.log(e)
        let id = e.detail.item.id;


    },

    //点击视频看就诊
    CustomVideoCallClickEvent(e) {
        if(this.data.tradeAction == 'END'){
           return
        }
       
        if (this.data.inquiryType !== 'videoNum') {
            wx.showToast({
                title: '此会话非视频咨询,不能进入房间',
                icon: 'none',
                duration: 2000
            })
        } else {
            this.enterRoom(e.currentTarget.dataset.roomid)
        }

    },
    //点击随访跟踪
    CustomWenJuanClickEvent(e) {
        var url = e.currentTarget.dataset.url
        url = url + '?userId=' + this.data.userId + '&execTime=' + Util.formatTime2(new Date())
        console.log(url)
        var encodeUrl = encodeURIComponent(url)
        console.log(encodeUrl)
        wx.navigateTo({
            url: '/pages/home/webpage/index?url=' + encodeUrl
        })

    },
    //点击疾病知识
    CustomArticleMessageClickEvent(e) {
        var id = e.currentTarget.dataset.id
        console.log(id)
        wx.navigateTo({
            url: '/pages/home/news/news-detail?id=' + id,
        })
    },


    //点击上传资料
    CustomUploadClickEvent(e) {

    },
    //点击评估消息
    CustomAnalyseClickEvent(e) {

        // wx.navigateTo({
        //     url: '/pages/home/evaluate/index?msgDetailId=' + e.currentTarget.dataset.id,
        // })

    },

   //点击电子处方卡片进入详情
   CustomDianziChufangClickEven(e){
       var preNo = e.currentTarget.dataset.id
       var time = e.currentTarget.dataset.time
       console.log("处方编号：",time)
      wx.navigateTo({
            url: '/pages/home/electronic-prescription/prescription_detail_page?preNo=' + preNo+'&createTime='+time,
        })
   },

   // 医生回复问题 点击查看详情
   ClickQueryAdetail(e){
    var question1 = e.currentTarget.dataset.question1
    var question2 = e.currentTarget.dataset.question2
    var question3 = e.currentTarget.dataset.question3
    var answer1 = e.currentTarget.dataset.answer1
    var answer2 = e.currentTarget.dataset.answer2
    var answer3 = e.currentTarget.dataset.answer3
    var time = e.currentTarget.dataset.time
    console.log("详情内容",time)
   wx.navigateTo({
         url: '/pages/home/doctor-answer/doctor-answer?question1=' + question1+'&question2='+question2+'&question3='+question3+'&answer1='+answer1+'&answer2='+answer2+'&answer3='+answer3+'&time='+time
     })
},

    //点击健康消息
    CustomHealthClickEvent(e) {

    },

    //购买服务卡片点击
    onCustomHealthManageMessageClickEvent(e) {
        console.log(e)
        var goodsId = e.currentTarget.dataset.id
        this.queryPlanId(goodsId)
    },
    //根据就诊人ID，商品ID查询服务ID
    async queryPlanId(goodsId) {
        var userId = this.data.userId
        const res = await WXAPI.queryPlanId(goodsId, userId)
        var planId = res.data
        wx.navigateTo({
            url: '/pages/me/my-plan/plan-detail?planId=' + planId,
        })
    },
    //点击选择时间
    CustomAppointmentTimeClickEvent(e) {
        if(this.data.tradeAction == 'END'){
            return
         }
        console.log(e)
        var time = e.currentTarget.dataset.item.data.timeArr
        var tradeId = e.currentTarget.dataset.item.data.tradeId
        this.setData({
            timeColumns: time,
            confirmTimeTradeId: tradeId,
            hideTimeShow: false
        })

    },
    onTimePickerCancel() {
        this.setData({
            hideTimeShow: true
        })
    },
    onTimePickerConfirm(event) {
        console.log(event)
        var value = event.detail.value

        this.setData({
            hideTimeShow: true
        });


        this.updateRightsRequestTime(this.data.confirmTimeTradeId, value)
    },
    //确认时间
    async updateRightsRequestTime(tradeId, chooseTime) {
        var execTime = Util.formatTime2(new Date()) + ' ' + chooseTime.substring(0, 5) + ':00'

        const postData = {

            tradeId: tradeId,
            userId: this.data.config.userID,
            execTime: execTime
        }

        const res = await WXAPI.updateRightsRequestTime(postData)
        if (res.code === 0) {
            console.log('确认时间',this.data.inquiryType)
            if (this.data.inquiryType == 'videoNum' || this.data.inquiryType == 'telNum') {
                //视频和电话需要患者医生双方确认时间
                wx.showToast({
                    title: '确认成功',
                })
                this.sendAppointmentTimeMessageEvent('确认时间', chooseTime)
            }
            // else if(this.data.inquiryType == 'textNum'){
            //     //如果是图文则不用确认 直接聊天
            //     wx.showToast({
            //         icon:'none',
            //         title: '发送成功',
            //       })
            //     this.setData({
            //         tradeAction:'START'
            //     })
            // }

        }
    },
    //病历
    CustomCaseHistoryClickEvent(e) {

    },
    onVideoPlayClick(e){
      
        var videoObj=e.currentTarget.dataset.item
        this.setData({
            videoObj:videoObj,
            showVideo:true,
        })
        console.log(videoObj.videoUrl)
        this.videoContext.requestFullScreen()
    },
    onShowVideoBoxClick(){
        this.videoContext.stop()
        this.setData({           
            showVideo:false,
        })
    },
    bindfullscreenchange(event){
      
        this.setData({           
            showVideo:event.detail.fullScreen,
        })
    },
    //播放或暂停音频
    chatVoiceItemClickEvent(e) {
        this.voiceManager._page.chatVoiceItemClickEvent(e)
    },
    /**
  * 点击extra按钮时触发
  * @param e
  */
    onExtraClickEvent(e) {
        console.log("onExtraClickEvent", e);
        this.setData({
            scrollTopVal: this.data.chatItems.length * 999,
        });
    },
    /**
     * 点击extra中的item时触发
     * @param e
     */
    onExtraItemClickEvent(e) {
        console.warn(e);
        let that = this
        let chooseIndex = parseInt(e.detail.index);
        if (chooseIndex === 0) {//发送图片
            this.sendImageMessage()
        } else if (chooseIndex === 1) {//发送视频
            this.sendVideoMessage()
        }
        else if (chooseIndex === 2) {//语音通话
            this.setData({
                config: {
                    type: 1
                }
            })
            this.TRTCCalling.call({ userID: this.data.toUserID, type: 1 })
        } else if (chooseIndex === 3) {//视频通话
            // this.setData({
            //     config: {
            //         type: 2
            //     }
            // })
            // this.TRTCCalling.call({ userID: this.data.toUserID, type: 2 })

            // this.enterRoom(100)

        } else if (chooseIndex === 4) {
            wx.showModal({
                title: '提示',
                content: '发送资料给医生',
                success(res) {
                    if (res.confirm) {

                    }
                }
            })


            return;
        }

    },

    //进入房间
    enterRoom(roomID) {


        var dTime = parseInt(this.data.tradeRemark.timeLimit) * 60 - this.data.videoNumRecord
        if (dTime < 1) {
            wx.showModal({
                title: '提示',
                content: '通话时长已使用完，无法进入房间',
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    }
                }
            })
            return
        }
        const url = `./room/room?roomID=${roomID}&tradeId=${this.data.tradeId}&chatTime=${dTime}`

        this.checkDeviceAuthorize().then((result) => {
            console.log('授权成功', result)
            console.log(url)

            wx.navigateTo({
                url: url,
            })

        })
            .catch((error) => {
                console.log('没有授权', error)
            })



    },


    resetInputStatus() {
        // this.chatInput.closeExtraView();
    },



    /**
     * 添加多个消息在尾部或者顶部 刷新列表
     * @param {*} newItems 
     * @param {*} isIMReceived 是否监听来的消息
     * @param {*} isScrollToBootom 是否滑动到底部
     * @param {*} isLoadmore true添加到头部 false添加到尾部
     */
    setMultItemAndScrollPage(newItems, isIMReceived = false, isScrollToBootom = true,isLoadmore) {
        console.log("isScrollToBootom",isScrollToBootom)
        console.log("isLoadmore",isLoadmore)
        if(newItems.length===0){
            return
        }
        let that = this
        newItems.forEach(function (item, index) {
            //计算是否显示时间
            item.isShowTime=true
            item.time= new Date(Date.parse(item.msgTime)).getTime()/1000;
            item.type=item.msgType
            item.payload={}
            item.flow=item.fromAccount===that.data.userId?'out':'in'
            
            if (item.msgType == 'TIMCustomElem') {
                item.payload.data= JSON.parse(item.message).data
                item = that.getInfoFromCallMessage(item, isIMReceived)
            }else if(item.msgType == 'TIMTextElem'){
                item.payload.text=item.message
            }else if(item.msgType == 'TIMImageElem'){
                var imageInfoArray=[]
                imageInfoArray.push({url:item.message})
                imageInfoArray.push({url:item.message})
                item.payload.imageInfoArray=imageInfoArray
                
            }else if(item.msgType == 'TIMVideoFileElem'){
                item.payload.videoUrl=item.message+'?bitValueOsType=miniProgram'
            }else if(item.msgType == 'TIMSoundElem'){
                item.payload.url=item.message
            }


        })

        if (this.data.chatItems.length > 0) {
            var mergeChatList=[]
            if(isLoadmore){
                 mergeChatList =newItems.concat(this.data.chatItems)
            }else{
                 mergeChatList = this.data.chatItems.concat(newItems)
            }
           
            this.setData({
                chatItems: mergeChatList,
            });

        } else {
            this.setData({
                chatItems: newItems,
            });
        }

        this.setData({
            scrollTopVal: isScrollToBootom ? this.data.chatItems.length * 999 : 0,
        });
       
    },
    

    getInfoFromCallMessage(item, isIMReceived = false) {
        try {

            var signalingData = JSON.parse(item.payload.data)
            
            var type = signalingData.type
            if (type) {//自己业务的自定义消息
                if (type == 'CustomAnalyseMessage') {//问诊小结
                    item.payload.customType = "CustomAnalyseMessage"

                } else if (type == 'CustomHealthManageMessage') {//购买服务
                    item.payload.customType = "CustomHealthManageMessage"

                } else if (type == 'CustomHealthMessage') {//健康消息
                    item.payload.customType = "CustomHealthMessage"

                } else if (type == 'CustomUploadMessage') {//上传资料
                    item.payload.customType = "CustomUploadMessage"

                } else if (type == 'CustomVideoCallMessage') {//视频看诊
                    item.payload.customType = "CustomVideoCallMessage"
                    item.payload.isIMReceived = isIMReceived

                } else if (type == 'CustomCaseHistoryMessage') {//就诊病历
                    item.payload.customType = "CustomCaseHistoryMessage"

                } else if (type == 'CustomWenJuanMessage') {//问卷调查
                    item.payload.customType = "CustomWenJuanMessage"
                } else if (type == 'CustomArticleMessage') {//疾病知识
                    item.payload.customType = "CustomArticleMessage"
                } else if (type == 'CustomYuWenZhenMessage') {//预诊表单
                    item.payload.customType = "CustomYuWenZhenMessage"
                } else if (type == 'CustomIllnessMessage') {//病情概述
                    item.payload.customType = "CustomIllnessMessage"
                } else if (type == 'CustomDoctorChuFangMessage') { //电子处方/医生取消处方卡片   FengshikeIllnessMessage
                    item.payload.customType = "CustomDoctorChuFangMessage"    
                }else if (type == 'FengshikeIllnessMessage') { //风湿科问题概述  
                    item.payload.customType = "FengshikeIllnessMessage"    
                } else if (type == 'Fengshike2IllnessMessage') { //风湿科问题答复  
                    item.payload.customType = "Fengshike2IllnessMessage"    
                }  else if (type == 'CustomAppointmentTimeMessage') {//预约时间
                    item.payload.customType = "CustomAppointmentTimeMessage"

                    var timeArr = signalingData.time ? signalingData.time.split(",") : null
                    var timeArr2 = [];
                    timeArr.forEach(it => {
                        if (it) {
                            timeArr2.push(it)
                        }
                    })
                    signalingData.timeArr = timeArr2
                  
                } else if (type == 'CustomDoctorReceptionMessage') {//医生接诊
                    item.payload.customType = "CustomDoctorReceptionMessage"
                
                } else if (type == 'CustomDoctorRefuseMessage') {//医生拒诊
                    item.payload.customType = "CustomDoctorRefuseMessage"
                  
                }
                item.payload.data = signalingData
            } else {//解析其他消息 比如视频语音通话
                item.payload.description = "[自定义消息]"
                if (signalingData.businessID === 1) {
                    var data = JSON.parse(signalingData.data)
                    if (1 === data.call_type) {

                        item.payload.description = "[语音通话]"
                    } else if (2 === data.call_type) {

                        item.payload.description = "[视频通话]"
                    }
                }


            }



        } catch (error) {
            console.error(error)
            item.payload.description = "[自定义消息]"
        }
        return item

    },




    checkDeviceAuthorize() {
        this.hasOpenDeviceAuthorizeModal = false
        return new Promise((resolve, reject) => {
            if (!wx.getSetting || !wx.getSetting()) {
                // 微信测试版 获取授权API异常，目前只能即使没授权也可以通过
                resolve()
            }
            wx.getSetting().then((result) => {
                console.log('getSetting', result)
                this.authorizeMic = result.authSetting['scope.record']
                this.authorizeCamera = result.authSetting['scope.camera']
                if (result.authSetting['scope.camera'] && result.authSetting['scope.record']) {
                    // 授权成功
                    resolve()
                } else {
                    // 没有授权，弹出授权窗口
                    // 注意： wx.authorize 只有首次调用会弹框，之后调用只返回结果，如果没有授权需要自行弹框提示处理
                    console.log('getSetting 没有授权，弹出授权窗口', result)
                    wx.authorize({
                        scope: 'scope.record',
                    }).then((res) => {
                        console.log('authorize mic', res)
                        this.authorizeMic = true
                        if (this.authorizeCamera) {
                            resolve()
                        }
                    })
                        .catch((error) => {
                            console.log('authorize mic error', error)
                            this.authorizeMic = false
                        })
                    wx.authorize({
                        scope: 'scope.camera',
                    }).then((res) => {
                        console.log('authorize camera', res)
                        this.authorizeCamera = true
                        if (this.authorizeMic) {
                            resolve()
                        } else {
                            this.openConfirm()
                            reject(new Error('authorize fail'))
                        }
                    })
                        .catch((error) => {
                            console.log('authorize camera error', error)
                            this.authorizeCamera = false
                            this.openConfirm()
                            reject(new Error('authorize fail'))
                        })
                }
            })
        })
    },
    openConfirm() {
        if (this.hasOpenDeviceAuthorizeModal) {
            return
        }
        this.hasOpenDeviceAuthorizeModal = true
        return wx.showModal({
            content: '您没有打开麦克风和摄像头的权限，是否去设置打开？',
            confirmText: '确认',
            cancelText: '取消',
            success: (res) => {
                this.hasOpenDeviceAuthorizeModal = false
                console.log(res)
                // 点击“确认”时打开设置页面
                if (res.confirm) {
                    console.log('用户点击确认')
                    wx.openSetting({
                        success: (res) => { },
                    })
                } else {
                    console.log('用户点击取消')
                }
            },
        })
    },

});
