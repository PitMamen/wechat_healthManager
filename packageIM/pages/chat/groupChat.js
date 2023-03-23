// pages/list/list.js
import TIM from 'tim-wx-sdk';
import voiceManager from "./msg-type/voice-manager";
const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')

Page({

    onMessageReceived: '',
    onMessageReadByPeer: '',
    _freshing: false,
    data: {
        showChatInput: true,
        hideTimeShow: true,
        config: {},
        toAvatar: '../../../image/docheader.png',//聊天对象头像
        myAvatar: '../../../image/avatar.png',//自己头像
        conversationID: '',//聊天会话ID
        groupID: '',//群ID
        DocType: 'Doctor',
        groupProfile: {},//群信息
        tradeId: '',//工单id
        isTradeReminded: false,//是否已经提醒过
        textNumCount:0,//总条数
        textNumRecord: 0,//当前图文咨询计数
        videoNumRecord: 0,//当前视频咨询已使用时长
        tradeRemark: {},//当前使用权益的详情
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
            description: '发送图片'
        }],
        topArr: [],
        bottomChatStatus: '',
        showTextPop: false,//文本消息点击放大
        showText: '',//文本消息点击放大
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

        this.setData({
            config: config,
            pageHeight: wx.getSystemInfoSync().windowHeight,
            groupID: options.groupID,
            conversationID: 'GROUP' + options.groupID,
            inquiryType: options.inquiryType,//问诊类型  图文textNum  视频videoNum 电话telNum
            tradeId: options.tradeId,//工单ID   
            //CONFIRM:确认  REFUSED:已拒诊  START:开始咨询 END:已完成
            //2:待接诊 3:问诊中 4:已结束 5:已中止（拒诊等）
            tradeAction: options.tradeAction,

        })
        this.qryRightsUseRecord()
        this.getGroupProfile()
        this.getMessageList()
        this.voiceManager = new voiceManager(this)
        this.onIMReceived()

        if (this.data.tradeAction == 'END') {
            this.setData({
                showChatInput: false
            })
        }

        // //禁止截屏录屏
        wx.setVisualEffectOnCapture({
            visualEffect: 'hidden',
            success: function (res) {

            },
        })
    },
    onShow: function (e) {
        console.log("chat page: onShow")
    },

    //查询使用中的权益详情
    async qryRightsUseRecord() {
        if (!this.data.tradeId) {
            return
        }
        const res = await WXAPI.qryRightsUseRecord({ id: this.data.tradeId })
        if (res.code == 0) {
            this.setData({
                tradeRemark: res.data[0],
                textNumCount:res.data[0].serviceFrequency ,
                textNumRecord: res.data[0].usedServiceFrequency || 0
            })
            wx.setNavigationBarTitle({
                title: res.data[0].docName + '团队'
            });
            var status = res.data[0].status
            var tradeAction = ''
            //工单进程 CONFIRM:确认  REFUSED:已拒诊  START:开始咨询 END:已完成
            //2待接诊 3问诊中 4已结束 5已中止（拒诊等）
            if (status == 2) {
                tradeAction = 'CONFIRM'
            } else if (status == 3) {
                tradeAction = 'START'
            } else if (status == 4) {
                tradeAction = 'END'
            } else if (status == 5) {
                tradeAction = 'REFUSED'
            }
            this.setData({
                tradeAction: tradeAction
            })
            if (this.data.tradeAction == 'END') {
                this.setData({
                    showChatInput: false
                })
            }
            this.updateChatStatus()
        }

    },
    //发生文病情简介 测试
    sendIllnessMessageEvent() {

        var sendData = {
            type: 'CustomIllnessMessage',
            title: '问诊卡',
            description: '问诊卡',
            userInfo: '张三 男 32岁',
            content: '案件假的假的假的假的假的假的',
            imageList: 'http://develop.mclouds.org.cn:8009/content-api/file/I20230202153528098W8RSM7Q8XLIYCJ-HPhvBnOOtdcibb66ed1cf3561a9782b4a764535f0bbb.png',
            time: '2022-12-12',
            tradeId: 60
        }

        let message = getApp().tim.createCustomMessage({
            to: this.data.groupID,
            conversationType: TIM.TYPES.CONV_GROUP,
            payload: {
                data: JSON.stringify(sendData),
                description: '问诊卡',
                extension: ''

            },
        });

        this.sendMsg(message)
    },

    goHome() {
        wx.switchTab({
            url: '/pages/consult/index',
        })
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
            if (newItems.length > 0) {
                that.setMultItemAndScrollPage(newItems, true, true, false)
                that.qryTextNumRecord()
                // 将某会话下所有未读消息已读上报
                getApp().tim.setMessageRead({ conversationID: that.data.conversationID });
            }

        };
        getApp().tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
        this.onMessageReceived = onMessageReceived

        //消息已读
        let onMessageReadByPeer = function (event) {

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


    //获取医生信息
    // async doctorDetailQuery(userId) {

    //     var doctor_list = [userId]

    //     const res = await WXAPI.doctorInfoQuery(doctor_list)
    //     if (res.code == 0 && res.data.length > 0) {
    //         wx.setNavigationBarTitle({
    //             title: res.data[0].userName
    //         });
    //         this.setData({
    //             toAvatar: res.data[0].avatarUrl
    //         })
    //     }
    // },

    //获取聊天对象信息 群聊
    getGroupProfile() {
        let that = this

        let promise = getApp().tim.getGroupProfile({
            groupID: this.data.groupID,

        });
        promise.then(function (imResponse) {
            console.log("获取群资料成功", imResponse);
            var groupProfile = imResponse.data.group;

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
        var postdata = {
            conversationID: this.data.conversationID,
            count: 15//需要拉取的消息数量，默认值和最大值为15。
        }

        let promise = getApp().tim.getMessageList(postdata);
        promise.then(function (imResponse) {
            console.log(imResponse.data.messageList)
            const messageList = imResponse.data.messageList; // 消息列表。
            const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
            const isCompleted = imResponse.data.isCompleted; // 表示是否已经拉完所有消息。


            that.setMultItemAndScrollPage(messageList, false, that.data.chatItems.length === 0, false)


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
    // 下拉获取更多消息记录
    getMoreMessageList() {

        let that = this;
        var postdata = {
            conversationID: this.data.conversationID,
            nextReqMessageID: this.data.nextReqMessageID,
            count: 15//需要拉取的消息数量，默认值和最大值为15。
        }

        let promise = getApp().tim.getMessageList(postdata);
        promise.then(function (imResponse) {
            console.log(imResponse.data.messageList)
            const messageList = imResponse.data.messageList; // 消息列表。
            const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
            const isCompleted = imResponse.data.isCompleted; // 表示是否已经拉完所有消息。


            that.setMultItemAndScrollPage(messageList, false, that.data.chatItems.length === 0, true)


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
        this.getMoreMessageList()

    },


    //查询剩余条数
    qryTextNumRecord() {
        if (!this.data.tradeId) {
            return
        }
        WXAPI.qryRightsUseRecord({ id: this.data.tradeId }).then(res => {
            this.setData({
                textNumCount:res.data[0].serviceFrequency ,
                textNumRecord: res.data[0].usedServiceFrequency || 0
            })
            this.updateChatStatus()
        })

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
    //点击问卷卡
    onCustomWenJuanMessageClick(e) {
        console.log(e)
        let item = e.currentTarget.dataset.item;
        var url =''
        if(item.done){
             url = item.url
        }else{
             url = item.url + `?source=medical-steward&agencyId=${item.todoId}&userId=${this.data.config.userID}`
        }
        var encodeUrl = encodeURIComponent(url)
        wx.navigateTo({
            url: '/pages/consult/webpage/index?url=' + encodeUrl + '&type=1'
        })
       
    },
    //点击文章卡
    onCustomArticleMessageClick(e) {
        console.log(e)
        let item = e.currentTarget.dataset.item;
        // var encodeUrl = encodeURIComponent(item.url)
        // wx.navigateTo({
        //     url: '/pages/consult/webpage/index?url=' + encodeUrl + '&type=2'
        // })
        wx.navigateTo({
            url: '/pages/home/news/news-detail?id=' + item.id,
        })
        this.setInquiriesAgencyRead(item.todoId)
    },
    //点击问诊卡
    onCustomIllnessMessageClick(e) {

        let item = e.currentTarget.dataset.item;
        wx.navigateTo({
            url: '/pages/consult/detail-text/index?rightsId=' + this.data.tradeRemark.rightsId + '&userId=' + this.data.config.userID + '&status=3',
        })

    },
    //设置卡片已读
    setInquiriesAgencyRead(todoId) {
        if (todoId) {
            WXAPI.setInquiriesAgencyRead(todoId)
        }
    },

    onVideoPlayClick(e) {
        console.log(e)
        var videoObj = e.currentTarget.dataset.item
        this.setData({
            videoObj: videoObj,
            showVideo: true,
        })
        this.videoContext.requestFullScreen()
    },
    onShowVideoBoxClick() {
        this.videoContext.stop()
        this.setData({
            showVideo: false,
        })
    },
    bindfullscreenchange(event) {

        this.setData({
            showVideo: event.detail.fullScreen,
        })
    },

    //点击文本消息 放大
    chatTextItemClickEvent(e) {
        this.setData({
            showTextPop: true,
            showText: e.currentTarget.dataset.text
        })
    },
    //关闭放大窗口
    onShowTextClose() {
        this.setData({
            showTextPop: false,
            showText: ''
        })
    },


    //点击选择时间
    CustomAppointmentTimeClickEvent(e) {
        if (this.data.tradeAction == 'END') {
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
            console.log('确认时间', this.data.inquiryType)
            if (this.data.inquiryType == 'videoNum' || this.data.inquiryType == 'telNum') {
                //视频和电话需要患者医生双方确认时间
                wx.showToast({
                    title: '确认成功',
                })
                this.sendAppointmentTimeMessageEvent('确认时间', chooseTime)
            }


        }
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


        let chooseIndex = parseInt(e.detail.index);
        if (chooseIndex === 0) {//发送图片
            this.sendImageMessage()
        }


    },



    //发生文本消息
    onSendMessageEvent(e) {
        let content = e.detail.value;
        // 发送文本消息，Web 端与小程序端相同
        // 1. 创建消息实例，接口返回的实例可以上屏

        let message = getApp().tim.createTextMessage({
            to: this.data.groupID,
            conversationType: TIM.TYPES.CONV_GROUP,
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

        wx.chooseMedia({
            mediaType: ['image'], // 图片
            sourceType: ['album', 'camera'], // 从相册选择
            count: 1, // 只选一张，目前 SDK 不支持一次发送多张图片
            success: function (res) {
                console.log(res)
                res.tempFilePaths = [res.tempFiles[0].tempFilePath]


                // 2. 创建消息实例，接口返回的实例可以上屏
                let message = getApp().tim.createImageMessage({
                    to: that.data.groupID,
                    conversationType: TIM.TYPES.CONV_GROUP,
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

        wx.chooseMedia({
            mediaType: ['video'], // 视频
            sourceType: ['album', 'camera'], // 来源相册或者拍摄
            maxDuration: 60, // 设置最长时间60s
            camera: 'back', // 后置摄像头
            success(res) {
                // 2. 创建消息实例，接口返回的实例可以上屏
                let message = getApp().tim.createVideoMessage({
                    to: that.data.groupID,
                    conversationType: TIM.TYPES.CONV_GROUP,
                    payload: {
                        file: res
                    },
                    // 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到，v2.10.2起支持）
                    // cloudCustomData: 'your cloud custom data'
                    // v2.12.2起，支持小程序端视频上传进度回调
                    onProgress: function (event) { console.log('file uploading:', event) }
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
                to: this.data.groupID,
                conversationType: TIM.TYPES.CONV_GROUP,
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

            if (this.data.textNumCount) {
                var dNum = this.data.textNumCount - this.data.textNumRecord

                if (dNum < 1) {
                    wx.showToast({
                        icon: "none",
                        title: '图文条数已用完，无法发送',
                    })
                    return
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
    setMultItemAndScrollPage(newItems, isIMReceived = false, isScrollToBootom = true, isLoadmore) {
        if (newItems.length === 0) {
            return
        }
        let that = this
        newItems.forEach(function (item, index) {
            //计算是否显示时间
            if (isLoadmore) {
                item.isShowTime = true
            } else {
                that.messageTimeForShow(item)
            }

            if (item.type == "TIMCustomElem") {

                item = that.getInfoFromCallMessage(item, isIMReceived)
            }


        })

        if (this.data.chatItems.length > 0) {
            var mergeChatList = []
            if (isLoadmore) {
                mergeChatList = newItems.concat(this.data.chatItems)
            } else {
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
    //更新聊天状态 条数
    updateChatStatus() {
        var content = ''

        
            var textNumContent = ''
            
            if (this.data.textNumCount) {
                var dTextNum = this.data.textNumCount - this.data.textNumRecord
                if (dTextNum < 0) {
                    dTextNum = 0
                }
                textNumContent = '剩余' + dTextNum + '次医生回复机会'
            }else {
                textNumContent = '剩余无限次医生回复机会'
            }

            if (this.data.inquiryType == 'videoNum') {
                content = textNumContent + ' 剩余通话时长' + dTimeNum + '分钟'
            } else if (this.data.inquiryType == 'telNum') {
                content = textNumContent + ' 剩余通话时长' + dTimeNum + '分钟'
            } else if (this.data.inquiryType == 'textNum') {
                content = textNumContent
            }
        

        this.setData({
            bottomChatStatus: content
        })

    },
    resetInputStatus() {
        // this.chatInput.closeExtraView();
    },
    videoErrorCallback(e) {
        console.log('视频错误信息:')
        console.log(e)
    },
    bindwaiting(e) {
        console.log('视频出现缓冲时触发:')
        console.log(e)
    },
    bindloadedmetadata(e) {
        console.log('视频元数据加载完成时触发:')
        console.log(e)
    },
    getInfoFromCallMessage(item, isIMReceived = false) {
        try {

            var signalingData = JSON.parse(item.payload.data)
            console.log(signalingData)
            var type = signalingData.type
            if (type) {//自己业务的自定义消息
                if (type == 'CustomWenJuanMessage') {//问卷卡
                    item.payload.customType = "CustomWenJuanMessage"
                } else if (type == 'CustomArticleMessage') {//文章卡
                    item.payload.customType = "CustomArticleMessage"
                } else if (type == 'CustomIllnessMessage') {//问诊卡
                    item.payload.customType = "CustomIllnessMessage"
                } else if (type == 'CustomAppointmentTimeMessage') {//预约时间
                    item.payload.customType = "CustomAppointmentTimeMessage"

                    var timeArr = signalingData.time ? signalingData.time.split(",") : null
                    var timeArr2 = [];
                    timeArr.forEach(it => {
                        if (it) {
                            timeArr2.push(it)
                        }
                    })
                    signalingData.timeArr = timeArr2

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
                item.payload.data = signalingData
            }



        } catch (error) {
            console.log(error)
            if (item.payload.data == 'group_create') {
                item.payload.description = "医生创建房间"

            }

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
