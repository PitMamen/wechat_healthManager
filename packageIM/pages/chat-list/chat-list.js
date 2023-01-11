// pages/chat-list/chat-list.js
import TIM from 'tim-wx-sdk';

const WXAPI = require('../../../static/apifm-wxapi/index')
/**
 * 会话列表页面
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        onMessageReceived: '',
        conversationList: null,
        userID: '',//传进来的id 不一定和登录账号一致 需要判断
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 拉取会话列表
        console.info("onLoad:", options)
       
        var userID = String(wx.getStorageSync('defaultPatient').userId)
        this.setData({
            userID: userID
        })




    },

    
    toChat(e) {
        let item = e.currentTarget.dataset.item;

        if(item.type == 'C2C'){
            wx.navigateTo({
                
                url: '../chat/chat?type='+item.type+'&userID=' + item.userProfile.userID + '&DocType=CaseManager'+ '&conversationID=' + item.conversationID
            });
        }

   
    },
    /**
     * 生命周期函数--监听页面显示
     */
    async onShow() {

        // 拉取会话列表
        console.info("onShow")
        if (getApp().globalData.IMuserID == this.data.userID) {
            this.getConversationList()
        }



    },
    onUnload() {

        getApp().tim.off(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived);
    },

    getConversationList() {
        let promise = getApp().tim.getConversationList();
        let that = this;
        promise.then(function (imResponse) {
            const conversationList = imResponse.data.conversationList; // 会话列表，用该列表覆盖原有的会话列表
            console.log(imResponse)
            var userIDList=[]
            conversationList.forEach(function (item, index) {
                userIDList.push(item.userProfile.userID)
                if (item.lastMessage.type == 'TIMCustomElem') {
                   
                    try {
                        var signalingData = JSON.parse(item.lastMessage.payload.data)
                      

                        var type = signalingData.type
                       
                        if (type) {//自己业务的自定义消息
                            if (type == 'CustomAnalyseMessage') {//评估消息

                                item.lastMessage.messageForShow = "[健康评估]"
                            } else if (type == 'CustomHealthManageMessage') {//购买服务

                                item.lastMessage.messageForShow = "[服务购买]"
                            } else if (type == 'CustomHealthMessage') {//健康消息
                                item.lastMessage.messageForShow = "[健康提醒]"
                            }else if(type=='CustomUploadMessage'){//上传资料
                                item.lastMessage.messageForShow = "[患者上传资料]"                             
                            }else if (type == 'CustomVideoCallMessage') {//视频看诊
                                item.lastMessage.messageForShow = "[视频看诊]"    
            
                            }else if (type == 'CustomWenJuanMessage') {//问卷调查
                                item.lastMessage.messageForShow = "[随访跟踪]"    
                            }

                        } else {//解析其他消息 比如视频语音通话
                            if (signalingData.businessID !== 1) {
                                return
                            }
                            var data = JSON.parse(signalingData.data)
                            if (1 === data.call_type) {
                                item.lastMessage.messageForShow = "[语音通话]"
                            } else if (2 === data.call_type) {
                                item.lastMessage.messageForShow = "[视频通话]"
                            }
                        } 

                    }catch (error) {

                    }
                }
             
              })
             
              that.getUserProfile(conversationList,userIDList)
          

        }).catch(function (imError) {
            console.error(imError)
            console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
        });
    },
    //获取聊天对象信息 
    getUserProfile(conversationList,userIDList) {
        
        let that = this
        var conversationList2=[]
        let promise = getApp().tim.getUserProfile({
            userIDList: userIDList // 请注意：即使只拉取一个用户的资料，也需要用数组类型，例如：userIDList: ['user1']
        });
        promise.then(function (imResponse) {
            imResponse.data.forEach(function (item, index) {
                if(item.role == 4 ||item.role == 6){//3 医生 4 个案管理师 5护士 6客服
                    //剔除医生和护士
                    conversationList.forEach(function (ct, index) {
                        if(item.userID === ct.userProfile.userID){
                            conversationList2.push(ct)
                        }
                    })
                }
            })

            that.setData({
                conversationList:conversationList2
            })

        }).catch(function (imError) {
            console.warn('getUserProfile error:', imError); // 获取其他用户资料失败的相关信息
        });

    },
    //监听
    onIMReceived() {
        let that = this
        //监听新消息
        let onMessageReceived = function (event) {
            that.getConversationList()
        };
        getApp().tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
        this.onMessageReceived = onMessageReceived
    },
    getConversationsItem(item) {
        let { latestMsg, ...msg } = item;
        return Object.assign(msg, JSON.parse(latestMsg));
    }


    

});
