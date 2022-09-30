// pages/list/list.js
import TIM from 'tim-wx-sdk';
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
/**
 * 聊天页面
 * MSG_TEXT:"TIMTextElem",文本消息
 * MSG_IMAGE:"TIMImageElem",图片消息
 * MSG_AUDIO:"TIMSoundElem",音频消息
 * MSG_FILE:"TIMFileElem",文件消息
 * MSG_FACE:"TIMFaceElem",
 * MSG_VIDEO:"TIMVideoFileElem",视频消息
 * MSG_GEO:"TIMLocationElem",位置消息
 * MSG_GRP_TIP:"TIMGroupTipElem",群提示消息
 * MSG_GRP_SYS_NOTICE:"TIMGroupSystemNoticeElem",群系统通知消息
 * MSG_CUSTOM:"TIMCustomElem",自定义消息
 * MSG_MERGER:"TIMRelayElem",合并消息（v2.10.1起支持）
 */
Page({
    /**
     * extraArr: [{
            picName: 'choose_picture',
            description: '图片'
        }, {
            picName: 'take_photos',
            description: '视频'
        }, {
            picName: 'voice_call',
            description: '语音通话'
        }, {
            picName: 'video_call',
            description: '视频通话'
        }]
     * 页面的初始数据
     */
    onMessageReceived: '',
    onMessageReadByPeer: '',
    _freshing: false,
    data: {
        showChatInput: true,
        hideTimeShow: true,
        type: '',
        config: {},
        toUserID: '',//聊天对象ID 或者群ID
        toAvatar:'../../../image/avatar.png',//聊天对象头像
        myAvatar:'../../../image/avatar.png',//自己头像
        conversationID: '',//聊天会话ID

        DocType: '',//Doctor医生  CaseManager个案管理师  ServiceAccount 客服人员
        userProfile: {},//聊天对象信息
        groupProfile: {},//群信息

        tradeId: '',//工单id
        isTradeReminded: false,//是否已经提醒过
        textNumRecord: 0,//当前图文咨询计数
        videoNumRecord: 0,//当前视频咨询已使用时长

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
        extraArr: [{
            picName: 'choose_picture',
            description: '图片'
        }, {
            picName: 'take_photos',
            description: '视频'
        }],
        topArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("chat page: onLoad")
        console.log(options)

        var config = {
            sdkAppID: getApp().globalData.sdkAppID,
            userID: getApp().globalData.IMuserID,
            userSig: getApp().globalData.IMuserSig,
            type: 1,
            tim: getApp().tim, // 参数适用于业务中已存在 TIM 实例，为保证 TIM 实例唯一性
        }

        var defaultPatient = getApp().getDefaultPatient()
        //统一用微信账号的头像
        var myAvatar = wx.getStorageSync('userInfo').account.avatarUrl
        this.setData({
            config: config,
            pageHeight: wx.getSystemInfoSync().windowHeight,
            type: options.type,
            DocType: options.DocType,
            defaultPatient: defaultPatient,
            toUserID: options.userID,
            conversationID: options.conversationID,
            myAvatar: myAvatar,
            inquiryType: options.inquiryType,//问诊类型  图文textNum  视频videoNum 电话telNum
            tradeId: options.tradeId,//工单ID   
            //工单进程 CONFIRM:确认  REFUSED:已拒诊  START:开始咨询 END:已完成
            tradeAction: options.tradeAction,

        })
        this.getUserInfo()
        this.updateChatStatus()
        this.getMessageList()
        this.voiceManager = new voiceManager(this)
        this.onIMReceived()

        if (this.data.DocType == 'Doctor' || this.data.DocType == 'Nurse') {//医生

            if(this.data.tradeAction == 'END'){
                this.setData({
                    showChatInput:false
                })
            }else {
                if (this.data.tradeAction == 'START') {
                    //开始咨询问诊
                    //查询是否添加过发送记录  没有则在发送消息后添加
                    this.qryRightsUserLog()
                }
                //查询工单详情
                this.queryRightsUserRecord()
            }

            
        }

   


        //禁止截屏录屏
        wx.setVisualEffectOnCapture({
            visualEffect: 'hidden',
            success: function (res) {

            },
        })
    },
    onShow: function (e) {
        console.log("chat page: onShow")
        this.qryVideoNumRecord()
    },
    goHome(){
        wx.switchTab({
          url: '/pages/consult/index',
        })
      },
      goDoctorDetail(){
        wx.navigateTo({
          url: '/pages/home/package-list/packagelist',
        })
      },
      //查看历史记录
      goHistoryPage(){
        wx.navigateTo({
            url: '/packageIM/pages/chat/historyChat?userId='+this.data.config.userID+'&toUserId='+this.data.toUserID,
          })
      },
   //模拟收到文本消息和发送文字消息
   onGetMessageEvent_local(flow, content) {

    // 发送文本消息，Web 端与小程序端相同
    // 1. 创建消息实例，接口返回的实例可以上屏
    console.log(content)
    let message = getApp().tim.createTextMessage({
        to: String(this.data.defaultPatient.userId),
        conversationType: this.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
        payload: {
            text: content
        },
    });
    message.flow = flow
    message.avatar = flow === 'in' ? '/image/ai_icon.png' : '',
        console.log(message)
    var index = this.setOneItemAndScrollPage(message)
    this.updateChatItemStatus(index, "success")
},
    //监听
    onIMReceived() {
        let that = this
        //监听新消息
        let onMessageReceived = function (event) {
            // event.data - 存储 Message 对象的数组 - [Message]
            console.log("event", event)
            const newItems = []
            event.data.forEach(item => {
                if (item.conversationID == that.data.conversationID) {

                    newItems.push(item)
                }
            });
            that.setMultItemAndScrollPage(newItems, true, true,false)
            // 将某会话下所有未读消息已读上报
            getApp().tim.setMessageRead({ conversationID: that.data.conversationID });
        };
        getApp().tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
        this.onMessageReceived = onMessageReceived

        //消息已读
        let onMessageReadByPeer = function (event) {
            // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
            // console.log(event)
            // var isPeerRead=false
            // event.data.forEach(item=>{
            //     if(item.to === that.data.toUserID){
            //         isPeerRead=true
            //     }
            // })
            // if(isPeerRead){
            //     that.data.chatItems.forEach(message=>{
            //         message.isPeerRead=true
            //     })
            //     that.setData({
            //         chatItems:that.data.chatItems
            //     })
            // }
        };
        getApp().tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, onMessageReadByPeer);
        this.onMessageReadByPeer = onMessageReadByPeer

        //网络状态变法
        let onNetStateChange = function (event) {
            console.log(event)
            // v2.5.0 起支持
            // event.data.state 当前网络状态，枚举值及说明如下：
            // TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
            // TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
            // TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
            if (event.data.state == TIM.TYPES.NET_STATE_CONNECTING) {

                wx.showToast({
                    icon: "none",
                    title: '当前网络不稳定...',
                })
            } else if (event.data.state == TIM.TYPES.NET_STATE_DISCONNECTED) {

                wx.showToast({
                    icon: "none",
                    title: '当前网络不可用',
                })
            }

        };
        getApp().tim.on(TIM.EVENT.NET_STATE_CHANGE, onNetStateChange);
        this.onNetStateChange = onNetStateChange
    },

    onReady() {

        this.chatInput = this.selectComponent('#chatInput');
        this.TUICallingInit()
        this.videoContext = wx.createVideoContext('myVideo')
    },

    //视频语音通话初始化
    TUICallingInit() {


        // 将初始化后到TUICalling实例注册到this.TUICalling中，this.TUICalling 可使用TUICalling所以方法功能。
        this.TUICalling = this.selectComponent('#TUICalling-component');
        //初始化TUICalling
        this.TUICalling.init()
    },
    onUnload() {
        console.log("chat page: onUnload")
        //放开截屏录屏
        wx.setVisualEffectOnCapture({
            visualEffect: 'none',
        })
        this.voiceManager.stopAllVoicePlay(true);
        this.TUICalling.destroyed()
        getApp().tim.off(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived);
        getApp().tim.off(TIM.EVENT.MESSAGE_READ_BY_PEER, this.onMessageReadByPeer);
        getApp().tim.off(TIM.EVENT.NET_STATE_CHANGE, this.onNetStateChange);
      
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
    //获取聊天对象信息 群聊
    getGroupProfile() {
        let that = this

        let promise = getApp().tim.getGroupProfile({
            groupID: this.data.toUserID,

        });
        promise.then(function (imResponse) {
            console.log("获取群资料成功", imResponse);
            var groupProfile = imResponse.data.group;

            wx.setNavigationBarTitle({
                title: groupProfile.name || groupProfile.groupID
            });
            that.setData({
                groupProfile: groupProfile,

            });


        }).catch(function (imError) {
            console.warn('获取群资料失败:', imError); // 获取其他用户资料失败的相关信息
        });

    },
    //第一次获取消息列表
    getMessageList() {
        // 打开某个会话时，第一次拉取消息列表
        let that = this;
     var   postdata={
            conversationID: this.data.conversationID,
            count: 15//需要拉取的消息数量，默认值和最大值为15。
        }
    
        let promise = getApp().tim.getMessageList(postdata);
        promise.then(function (imResponse) {
            console.log(imResponse.data.messageList)
            const messageList = imResponse.data.messageList; // 消息列表。
            const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
            const isCompleted = imResponse.data.isCompleted; // 表示是否已经拉完所有消息。


            that.setMultItemAndScrollPage(messageList, false, that.data.chatItems.length === 0,false)


            that.setData({
                nextReqMessageID: nextReqMessageID,
                isCompleted: isCompleted
            })
            that.setData({
                triggered: false,
            })
            that._freshing = false
            // 将某会话下所有未读消息已读上报
           getApp().tim.setMessageRead({ conversationID: that.data.conversationID });
        
            if(that.data.DocType === 'ServiceAccount'){
                that.onGetMessageEvent_local('in', '您好，我是医生助理，请输入并提交您想询问的内容，我会竭诚为您服务。')
            }
           
             //为了防止发送消息上屏 获取列表又上屏的情况 ，再获取到列表后再发送卡片
             if(that.data.tradeAction !== 'END'){
                if (that.data.DocType == 'Doctor') {//医生
                    //查询是否发送过病情卡片记录 没有则查询填写资料并发送卡片
                    that.qrySendCardsUserLog()
                }
            }
            

        }).catch(function (imError) {
            console.error(imError)
            that.setData({
                triggered: false,
            })
            that._freshing = false
            wx.showToast({
                title: '获取聊天列表失败',
                icon: "none",
                duration: 2000
            })
        });;
    },
    // 下拉获取更多消息记录
    getMoreMessageList() {
       
        let that = this;
     var   postdata={
            conversationID: this.data.conversationID,
            nextReqMessageID:this.data.nextReqMessageID,
            count: 15//需要拉取的消息数量，默认值和最大值为15。
        }
     
        let promise = getApp().tim.getMessageList(postdata);
        promise.then(function (imResponse) {
            console.log(imResponse.data.messageList)
            const messageList = imResponse.data.messageList; // 消息列表。
            const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
            const isCompleted = imResponse.data.isCompleted; // 表示是否已经拉完所有消息。


            that.setMultItemAndScrollPage(messageList, false, that.data.chatItems.length === 0,true)


            that.setData({
                nextReqMessageID: nextReqMessageID,
                isCompleted: isCompleted
            })
            that.setData({
                triggered: false,
            })
            that._freshing = false
            // 将某会话下所有未读消息已读上报
            getApp().tim.setMessageRead({ conversationID: that.data.conversationID });
            

        }).catch(function (imError) {
            console.error(imError)
            that.setData({
                triggered: false,
            })
            that._freshing = false
            wx.showToast({
                title: '获取聊天列表失败',
                icon: "none",
                duration: 2000
            })
        });;
    },
    // 下拉查看更多消息
    onRefresh: function (e) {
        console.log("onRefresh")
        if (this._freshing) return
        this._freshing = true
        if (this.data.isCompleted) {
            if(this.data.tradeAction === 'END'){
                wx.showToast({
                    icon: 'none',
                    title: "已全部加载完，点击下方按钮可查看更多历史消息",
                    duration: 4000
                })
            }else {
                wx.showToast({
                    icon: 'none',
                    title: "没有更多消息了",
                    duration: 2000
                })
            }
            
            this.setData({
                triggered: false,
            })
            this._freshing = false
            return
        }
        this.getMoreMessageList()

    },
    async queryRightsUserRecord() {

        const res = await WXAPI.queryRightsUserRecord(this.data.config.userID, '', this.data.tradeId)
        console.log("queryRightsUserRecord1")
        if (res.code == 0 && res.data && res.data.rows && res.data.rows.length > 0) {
            console.log("queryRightsUserRecord2", res.data.rows)
            var tradeDetail = res.data.rows[0]
            this.setData({
                tradeDetail: tradeDetail,
            })
            if (tradeDetail.userAttrInfo && tradeDetail.userAttrInfo.length > 0 && tradeDetail.userAttrInfo[0].remark) {
                this.setData({
                    tradeRemark: tradeDetail.userAttrInfo[0].remark
                })
            }
            console.log("queryRightsUserRecord3---tradeRemark", this.data.tradeRemark)
            this.qryTextNumRecord()
            this.qryVideoNumRecord()
        }


    },
    //查询填写的资料
    async qryInputUserLog() {
        if (!this.data.tradeId) {
            return
        }
        const postData = {
            dealType: 'REQUEST_DATA',
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.qryRightsUserLog(postData)

        console.log("查询填写的资料并发送卡片",res)
        if (res.code === 0 && res.data.length > 0) {

            // //发送病情简介
            this.sendIllnessMessageEvent(res.data[0])

            if (res.data[0].execFlag === 0) {
                if (this.data.inquiryType == 'videoNum' || this.data.inquiryType == 'telNum') {
                    //视频和电话需要患者医生双方确认时间
                    this.sendAppointmentTimeMessageEvent('预约时间', res.data[0].dealResult)
                }
            }else if (res.data[0].execFlag === 2) {
                this.setData({
                    tradeAction:'START'
                })
            }
            //保存已发送的记录
          this.saveSendCardsUserLog()

        }

    },
       //查询是否添加发送过病情描述卡片  没有则在发送
       async qrySendCardsUserLog() {
        console.log("qrySendCardsUserLog:", this.data.tradeId)
        if (!this.data.tradeId) {
            return
        }
        const postData = {
            dealType: 'SEND_CARD_DATA',
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.qryRightsUserLog(postData)
        if (res.code === 0 ) {
           if( !res.data || res.data.length === 0){    
               //没有记录
               this.qryInputUserLog()
           }
        }

    },
    //查询是否添加过发送记录  没有则在发送消息后添加
    async qryRightsUserLog() {
        console.log("qryRightsUserLog:", this.data.tradeId)
        if (!this.data.tradeId) {
            return
        }
        const postData = {
            dealType: 'TextTimeoutRemind',
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.qryRightsUserLog(postData)

        if (res.code === 0 && res.data.length > 0) {
            //有记录
            this.setData({
                isTradeReminded: true
            })
        }

    },
    //查询当前工单图文咨询计数条数
    async qryTextNumRecord() {
        if (!this.data.tradeId) {
            return
        }
        const postData = {
            dealType: 'USED_TEXTNUM',
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.qryRightsUserLog(postData)

        if (res.code === 0 && res.data.length > 0) {
            //有记录
            this.setData({
                textNumRecord: Number(res.data[0].dealResult)
            })

        }
        this.updateChatStatus()
    },
    //查询当前工单视频咨询时长
    async qryVideoNumRecord() {
        if (!this.data.tradeId) {
            return
        }
        const postData = {
            dealType: 'USED_VIDEONUM',
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.qryRightsUserLog(postData)

        if (res.code === 0 && res.data.length > 0) {
            //有记录
            this.setData({
                videoNumRecord: Number(res.data[0].dealResult)
            })

        }
        this.updateChatStatus()
    },
    //图文咨询计数
    async recordTradeTextNum() {

        if (!this.data.tradeId) {
            return
        }
        if(!this.data.tradeRemark.textNumLimit){
            return
        }
        const postData = {
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.recordTradeTextNum(postData)

        if (res.code === 0) {
            this.setData({
                textNumRecord: res.data.dealResult
            })
            this.updateChatStatus()
        }

    },

 //保存已经发送过病情卡片
 async saveSendCardsUserLog() {
    if (!this.data.tradeId) {
        return
    }
    const postData = {
        dealType: 'SEND_CARD_DATA',
        tradeId: this.data.tradeId,
        userId: this.data.config.userID        
          
    }
    await WXAPI.saveRightsUserLog(postData)

},
    //患者给医生发送第一条消息
    async sendFirstMsgToDoc() {
        if (!this.data.tradeId) {
            return
        }
        const postData = {
            docId: this.data.toUserID,
            tradeId: this.data.tradeId,
            userId: this.data.config.userID
        }
        const res = await WXAPI.sendFirstMsgToDoc(postData)

        if (res.code === 0) {
            this.setData({
                isTradeReminded: true
            })
            console.log("sendFirstMsgToDoc success")
        }

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

    onVideoPlayClick(e){
        console.log(e)
        var videoObj=e.currentTarget.dataset.item
        this.setData({
            videoObj:videoObj,
            showVideo:true,
        })
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
        url = url + '?userId=' + this.data.defaultPatient.userId + '&execTime=' + Util.formatTime2(new Date())
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
        var userId = this.data.defaultPatient.userId
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


    //发生文本消息
    onSendMessageEvent(e) {
        let content = e.detail.value;
        // 发送文本消息，Web 端与小程序端相同
        // 1. 创建消息实例，接口返回的实例可以上屏
       
        let message = getApp().tim.createTextMessage({
            to: this.data.toUserID,
            conversationType: this.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
            payload: {
                text: content
            },
            cloudCustomData: this.data.conversationID
        });
        this.sendMsg(message)
    },
    //发送图片消息
    sendImageMessage() {
        let that = this
        wx.chooseImage({
            sourceType: ['album', 'camera'], // 从相册选择
            count: 1, // 只选一张，目前 SDK 不支持一次发送多张图片
            success: function (res) {
                // 2. 创建消息实例，接口返回的实例可以上屏
                let message = getApp().tim.createImageMessage({
                    to: that.data.toUserID,
                    conversationType: that.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
                    payload: { file: res },
                    onProgress: function (event) { console.log('file uploading:', event) }
                });
                that.sendMsg(message)
            }
        })
    },
    //发送视频消息
    sendVideoMessage() {
        let that = this
        wx.chooseVideo({
            sourceType: ['album', 'camera'], // 来源相册或者拍摄
            maxDuration: 60, // 设置最长时间60s
            camera: 'back', // 后置摄像头
            success(res) {
                // 2. 创建消息实例，接口返回的实例可以上屏
                let message = getApp().tim.createVideoMessage({
                    to: that.data.toUserID,
                    conversationType: that.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
                    payload: {
                        file: res
                    },
                })
                that.sendMsg(message)
            }
        })
    },
    //发送语音
    onVoiceRecordEvent(e) {
        var recordStatus = e.detail.recordStatus
        console.log("onVoiceRecordEvent recordStatus=", recordStatus)
        if (recordStatus == 2) {
            console.log(e)
            console.log("可以发送了")

            // 4. 创建音频消息
            const message = getApp().tim.createAudioMessage({
                to: this.data.toUserID,
                conversationType: this.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
                payload: {
                    file: e.detail
                },
            });
            console.log("createAudioMessage:", message)

            this.sendMsg(message)

        } else {
            console.log("不能发送")
        }

    },
    //发生文病情简介
    sendIllnessMessageEvent(inputData) {
       console.log("病情描述:",inputData)
       var sendData;
        if (inputData.dealType=='USED_INQUIRYFORM') {
             sendData = {
                type: 'FengshikeIllnessMessage',
                title:'病情咨询',
                content: '我已向您发起咨询问题',
                question1: inputData.question1,
                question2: inputData.question2,
                question3: inputData.question3,
                imageList: inputData.dealImages,
                time: inputData.dealResult,
                tradeId: inputData.tradeId
            }
        }else{
             sendData = {
                type: 'CustomIllnessMessage',
                content: inputData.dealDetail,
                imageList: inputData.dealImages,
                time: inputData.dealResult,
                tradeId: inputData.tradeId
            }
        }
        let message = getApp().tim.createCustomMessage({
            to: this.data.toUserID,
            conversationType: TIM.TYPES.CONV_C2C,
            payload: {
                data: JSON.stringify(sendData),
                description: '病情概述',
                extension: ''

            },
        });

        this.sendMsg(message)
    },
    //发生预约时间
    sendAppointmentTimeMessageEvent(description, time) {

        const sendData = {
            type: 'CustomAppointmentTimeMessage',
            description: description,
            time: time,
            tradeId: this.data.tradeId
        }

        let message = getApp().tim.createCustomMessage({
            to: this.data.toUserID,
            conversationType: TIM.TYPES.CONV_C2C,
            payload: {
                data: JSON.stringify(sendData),
                description: description,
                extension: ''

            },
        });

        this.sendMsg(message)
    },
    // 展示消息时间
    messageTimeForShow(messageTime) {
        const interval = 5 * 60;
        const nowTime = messageTime.time;
        if (this.data.chatItems && this.data.chatItems.length > 0) {
            const lastTime = this.data.chatItems.slice(-1)[0].time;
            
            Object.assign(messageTime, {
                isShowTime: nowTime - lastTime > interval,
            })
        } else {
            Object.assign(messageTime, {
                isShowTime: true,
            })
        }

    },

    //模拟上传文件，注意这里的cbOk回调函数传入的参数应该是上传文件成功时返回的文件url，这里因为模拟，我直接用的savedFilePath
    simulateUploadFile({ savedFilePath, duration, itemIndex }) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let urlFromServerWhenUploadSuccess = savedFilePath;
                resolve({ url: urlFromServerWhenUploadSuccess });
            }, 1000);
        });
    },

    /**
     * 自定义事件
     */
    myFun() {
        wx.showModal({
            title: '小贴士',
            content: '演示更新会话状态',
            confirmText: '确认',
            showCancel: true,
            success: (res) => {

            }
        })
    },

    resetInputStatus() {
        // this.chatInput.closeExtraView();
    },




    /**
     * 发送消息
     */
    async sendMsg(message) {
        if (this.data.tradeAction == 'REFUSED') {
            wx.showToast({
                icon: "none",
                title: '医生已拒诊，无法发送',
            })
            return
        }
        let that = this
        console.log("sendMessage", message)
        var index;
        //技术原因 自定义消息先发送后上屏  其他消息先上屏后发送
        //非自定义消息
        if (message.type !== 'TIMCustomElem') {
            if (this.data.DocType == 'Doctor'||this.data.DocType == 'Nurse') {   
              if(this.data.tradeRemark && this.data.tradeRemark.textNumLimit){
                var dNum = this.data.tradeRemark.textNumLimit - this.data.textNumRecord
              
                if (dNum < 1) {
                    wx.showToast({
                        icon: "none",
                        title: '图文条数已用完，无法发送',
                    })
                    return
                }
              }
              
           }        
           index = this.setOneItemAndScrollPage(message)

        }
        // 2. 发送消息
        let promise = getApp().tim.sendMessage(message);
        promise.then(function (imResponse) {
            // 发送成功
            console.log(imResponse);
            if (message.type == 'TIMCustomElem') {
                index = that.setOneItemAndScrollPage(message)
            }
            that.updateChatItemStatus(index, "success")
            if (that.data.tradeAction == 'START' && !that.data.isTradeReminded) {
                //记录第一次发送了消息
                that.sendFirstMsgToDoc()
            }
            //非自定义消息计数
            if (message.type !== 'TIMCustomElem') {

                that.recordTradeTextNum()
            }

        }).catch(function (imError) {
            // 发送失败
            console.warn('sendMessage error:', imError);
            that.updateChatItemStatus(index, "fail")
            wx.showToast({
                title: imError.message,
                icon: 'error',
                duration: 2000
            })
        });
    },
    /**
     * 重发消息
     * @param e
     */
    async resendMsgEvent(e) {
        let that = this
        const index = parseInt(e.currentTarget.dataset.resendIndex);
        const item = this.data.chatItems[index];

        that.updateChatItemStatus(index, "unSend")

        // 重发消息
        let promise = getApp().tim.resendMessage(item); // 传入需要重发的消息实例
        promise.then(function (imResponse) {
            // 重发成功
            console.log(imResponse);
            that.updateChatItemStatus(index, "success")
            if (that.data.tradeAction == 'START' && !that.data.isTradeReminded) {
                //记录第一次发送了消息
                that.sendFirstMsgToDoc()
            }
              //非自定义消息计数
              if (message.type !== 'TIMCustomElem') {

                that.recordTradeTextNum()
            }
        }).catch(function (imError) {
            // 重发失败
            console.warn('resendMessage error:', imError);
            that.updateChatItemStatus(index, "fail")
            wx.showToast({
                title: imError.message,
                icon: 'error',
                duration: 2000
            })
        });
    },


    //更新消息状态
    updateChatItemStatus(index, status) {

        this.data.chatItems[index].status = status;
        this.setData({
            chatItems: this.data.chatItems
        })

    },

    /**
     * 添加多个消息在尾部或者顶部 刷新列表
     * @param {*} newItems 
     * @param {*} isIMReceived 是否监听来的消息
     * @param {*} isScrollToBootom 是否滑动到底部
     * @param {*} isLoadmore true添加到头部 false添加到尾部
     */
    setMultItemAndScrollPage(newItems, isIMReceived = false, isScrollToBootom = true,isLoadmore) {
        if(newItems.length===0){
            return
        }
        let that = this
        newItems.forEach(function (item, index) {
            //计算是否显示时间
            if(isLoadmore){
                item.isShowTime=true
            }else{
                that.messageTimeForShow(item)
            }
            
            if (item.type == "TIMCustomElem") {

                item = that.getInfoFromCallMessage(item, isIMReceived)
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
    //添加单个个消息在尾部 刷新列表并滚动到底部
    setOneItemAndScrollPage(newItem) {
        //计算是否显示时间
        this.messageTimeForShow(newItem)
        if (newItem.type == "TIMCustomElem") {

            newItem = this.getInfoFromCallMessage(newItem)
        }
        var length = this.data.chatItems.push(newItem)

        this.setData({
            chatItems: this.data.chatItems,
        });
        this.setData({
            scrollTopVal: this.data.chatItems.length * 999,
        });

        return length - 1;
    },
    //聊天状态
    updateChatStatus() {
        var content = ''
        if (this.data.DocType == 'Doctor'||this.data.DocType == 'Nurse') { 
            if (this.data.tradeRemark ) {
                var textNumContent=''
                if(this.data.tradeRemark.textNumLimit){
                    var dTextNum = parseInt(this.data.tradeRemark.textNumLimit) - this.data.textNumRecord
                    if (dTextNum < 0) {
                        dTextNum = 0
                    }
                    textNumContent = '当前剩余图文' + dTextNum + '条'
                }else{
                    dTextNum='无限'
                    //不显示
                }
                
                
    
                var second = parseInt(this.data.videoNumRecord % 60)
                var min = parseInt(this.data.videoNumRecord / 60)
                if (second > 30) {
                    min = min + 1
                }
                var dTimeNum = parseInt(this.data.tradeRemark.timeLimit) - min
    
                if (dTimeNum < 0) {
                    dTimeNum = 0
                }
    
                if (this.data.inquiryType == 'videoNum') {
                    content = '视频咨询:' + textNumContent + ' 剩余通话时长' + dTimeNum + '分钟'
                } else if (this.data.inquiryType == 'telNum') {
                    content = '电话咨询:' + textNumContent + ' 剩余通话时长' + dTimeNum + '分钟'
                } else if (this.data.inquiryType == 'textNum') {
                    content = '图文咨询:' + textNumContent
                }
            }
        }




        this.setData({
            chatStatue: this.data.DocType,
            chatStatusContent: content
        })
        // console.log(this.data.chatStatue+content)
    },
    videoErrorCallback(e) {
        console.log('视频错误信息:')
        console.log(e)
      },
      bindwaiting(e){
        console.log('视频出现缓冲时触发:')
        console.log(e)
      },
      bindloadedmetadata(e){
        console.log('视频元数据加载完成时触发:')
        console.log(e)
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
                    if (signalingData.tradeId == this.data.tradeId) {
                        this.setData({
                            tradeAction:'START'
                        })
                    }
                } else if (type == 'CustomDoctorRefuseMessage') {//医生拒诊
                    item.payload.customType = "CustomDoctorRefuseMessage"
                    console.log(signalingData.tradeId)
                    console.log(this.data.tradeId)
                    if (signalingData.tradeId == this.data.tradeId) {
                        this.setData({
                            tradeAction: 'REFUSED'
                        })
                    }
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
