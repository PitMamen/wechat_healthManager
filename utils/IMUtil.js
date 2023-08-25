
import TIM from 'tim-wx-sdk';
import TIMUploadPlugin from 'tim-upload-plugin';
import bus from './EventBus.js'


var IMinit = function IMinit() {
    console.log('sdkAppID', getApp().globalData.sdkAppID)
    let options = {
        SDKAppID: Number(getApp().globalData.sdkAppID)  // 接入时需要将 0 替换为您的云通信应用的 SDKAppID，类型为 Number
    };
    // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    let tim = TIM.create(options); // SDK 实例通常用 tim 表示
    getApp().tim = tim;

    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    // tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
    tim.setLogLevel(1); // release级别，SDK 输出关键信息，生产环境时建议使用
    // 注册腾讯云即时通信 IM 上传插件
    tim.registerPlugin({
        'tim-upload-plugin': TIMUploadPlugin
    });

    let onSdkReady = function () {

        getApp().globalData.sdkReady = true
       

    };
    getApp().tim.on(TIM.EVENT.SDK_READY, onSdkReady);

    //监听新消息

    let onMessageReceived = function (event) {

         //发送事件 通知咨询列表更新未读消息
         bus.emit('consultUpdate', true)
    };
    getApp().tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);

}
/**
        * 聊天
        * @param {*} userId 登录账号id 
        * @param {*} routeType 路由跳转类型 navigateTo   redirectTo（关闭当前页面跳转） reLaunch（关闭所有页面跳转）
        * @param {*} groupID 群ID
        * @param {*} inquiryType 问诊类型  图文textNum  视频videoNum 电话telNum
        * @param {*} tradeId 当前使用的权益ID  
        * @param {*} tradeAction 工单进程 CONFIRM:确认  REFUSED:已拒诊  START:开始咨询 END:已完成 
        */
       var goGroupChat = function goGroupChat(userId, routeType, groupID, inquiryType,tradeId, tradeAction) {
        var userList=getApp().getPatientInfoList()
        userList.forEach(patient=>{
            if(patient.userId == userId){
                var routUrl = `/packageIM/pages/chat/groupChat?groupID=${groupID}&inquiryType=${inquiryType}&tradeId=${tradeId}&tradeAction=${tradeAction}`
    
                this.LoginOrGoIMChat(userId, patient.userSig, routeType, routUrl)
            }
        })


    
    }
/**
        * 聊天
        * @param {*} userId 登录账号id 
        * @param {*} userSig 登录账号签名 
        * @param {*} routeType 路由跳转类型 navigateTo   redirectTo（关闭当前页面跳转） reLaunch（关闭所有页面跳转）
        * @param {*} doctorId 对方ID
        * @param {*} DocType 医生：Doctor  个案管理师：CaseManager  
        * @param {*} inquiryType 问诊类型  图文textNum  视频videoNum 电话telNum
        * @param {*} tradeId 权益工单id  
        * @param {*} tradeAction 工单进程 CONFIRM:确认  REFUSED:已拒诊  START:开始咨询 END:已完成 
        */
var goIMChat = function goIMChat(userId, userSig, routeType, doctorId, DocType, inquiryType, tradeId, tradeAction) {

    var routUrl = `/packageIM/pages/chat/chat?type=C2C&userID=` + doctorId + '&DocType=' + DocType + '&conversationID=' + 'C2C' + doctorId + '&inquiryType=' + inquiryType + '&tradeId=' + tradeId + '&tradeAction=' + tradeAction

    this.LoginOrGoIMChat(userId, userSig, routeType, routUrl)

}

var isLoginUser = ''

/**
        *  登录/聊天 不填后面2个参数则只登录
        * @param {*} userId 登录账号id 
        * @param {*} userSig 登录账号签名 
        * @param {*} routeType 路由跳转类型 navigateTo   redirectTo（关闭当前页面跳转） reLaunch（关闭所有页面跳转）
        * @param {*} routUrl 路径+参数
        */
var LoginOrGoIMChat = function LoginOrGoIMChat(userId, userSig, routeType, routUrl) {

    var that = this;
    var userID = String(userId)


    if (userID == getApp().globalData.IMuserID) {

        //就是登录账号 直接进入聊天
        console.log("就是当前账号：" + userID)
        if (routeType === 'navigateTo') {
            wx.navigateTo({
                url: routUrl
            })
        } else if (routeType === 'redirectTo') {
            wx.redirectTo({
                url: routUrl
            })
        } else if (routeType === 'reLaunch') {
            wx.reLaunch({
                url: routUrl
            })
        }

    } else {
        //不是当前登录账号  切换
        console.log(userID + "不是当前账号：" + getApp().globalData.IMuserID)
        wx.showLoading({
            title: '加载中...',
        })

        //没有登录账户则直接登录
        if (!getApp().globalData.IMuserID) {
            that.IMLoginToChat(userID, userSig, routeType, routUrl)
            return
        }
        //有登录账户则先登出再登录
        let promise = getApp().tim.logout();
        promise.then(function (imResponse) {
            console.log(imResponse.data); // 登出成功

            that.IMLoginToChat(userID, userSig, routeType, routUrl)
        }).catch(function (imError) {
            wx.hideLoading()
            console.warn('login error:', imError); // 登出失败的相关信息

        });
    }
}

/**
 *   跳转到聊天页的登录
 * @param {*} userId 用户id
 * @param {*} userSig 用户签名
 * @param {*} routeType 路由跳转类型 navigateTo   redirectTo（关闭当前页面跳转） reLaunch（关闭所有页面跳转）
 * @param {*} routUrl 聊天跳转地址  没有则不跳转
 */
var IMLoginToChat = function IMLoginToChat(userId, userSig, routeType, routUrl) {
    var userID = String(userId)
    if (getApp().tim == null) {
        this.IMinit()
    }
    if (userID == getApp().globalData.IMuserID) {
        return
    }
    if (isLoginUser == userID) {
        console.log(userID + '正在登录，不能重复登录')
        return
    }
    isLoginUser = userID

    let promise = getApp().tim.login({
        userID: userID,
        userSig: userSig
    });
    promise.then(function (imResponse) {
        console.log("IM登录成功", imResponse); // 登录成功

        isLoginUser = ''
        getApp().globalData.IMuserID = userID
        getApp().globalData.IMuserSig = userSig
                    //IM登录发送事件
                    bus.emit('IMLoginSuccess', true)


        let onSdkReady = function () {
            wx.hideLoading()
            console.log("onSdkReady")

            getApp().globalData.sdkReady = true


            if (routUrl) {
                if (routeType === 'navigateTo') {
                    wx.navigateTo({
                        url: routUrl
                    })
                } else if (routeType === 'redirectTo') {
                    wx.redirectTo({
                        url: routUrl
                    })
                } else if (routeType === 'reLaunch') {
                    wx.reLaunch({
                        url: routUrl
                    })
                }
            }



            getApp().tim.off(TIM.EVENT.SDK_READY, onSdkReady);
        };
        getApp().tim.on(TIM.EVENT.SDK_READY, onSdkReady);



    }).catch(function (imError) {
        wx.hideLoading()
        console.warn('login error:', imError); // 登录失败的相关信息
        isLoginUser = ''
    });
}

//获取未读消息数
var getConversationList = function getConversationList() {
    if (!getApp().globalData.sdkReady) {
        return
    }
    let promise = getApp().tim.getConversationList();

    promise.then(function (imResponse) {
        const conversationList = imResponse.data.conversationList; // 会话列表，用该列表覆盖原有的会话列表
        console.log('getConversationList', conversationList)
        var userIDList = []

        conversationList.forEach(function (item, index) {
            if (item.type == 'C2C') {
                userIDList.push(item.userProfile.userID)
            }

        })

        getUserProfile(conversationList, userIDList)

    }).catch(function (imError) {
        console.error(imError)
        console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
    });
}
//获取聊天对象信息 
var getUserProfile = function getUserProfile(conversationList, userIDList) {


    var unreadServerMessageCount = 0

    let promise = getApp().tim.getUserProfile({
        userIDList: userIDList // 请注意：即使只拉取一个用户的资料，也需要用数组类型，例如：userIDList: ['user1']
    });
    promise.then(function (imResponse) {
        console.log(imResponse.data)
        imResponse.data.forEach(function (item, index) {
            //3 医生 4 个案管理师 5护士 6客服
            if (item.role == 4 || item.role == 6) {

                for (var i = 0; i < conversationList.length; i++) {
                    var conver = conversationList[i]
                    if (item.userID === conver.userProfile.userID) {
                        unreadServerMessageCount = unreadServerMessageCount + conver.unreadCount
                    }
                }
            }
        })
        //发送事件 个案管理师、客服发来消息  通知首页我的消息更新未读数
        bus.emit('unreadServer', unreadServerMessageCount)

        // getApp().globalData.unreadServerMessageCount=unreadServerMessageCount

    }).catch(function (imError) {
        console.warn('getUserProfile error:', imError); // 获取其他用户资料失败的相关信息
    });

}

module.exports = {

    IMinit: IMinit,//IM初始化
    goIMChat: goIMChat,//去聊天页面用这个
    LoginOrGoIMChat: LoginOrGoIMChat,//登录或者切换登录用这个
    IMLoginToChat: IMLoginToChat,
    getConversationList: getConversationList,
    getUserProfile: getUserProfile,
    goGroupChat:goGroupChat //去群聊天
}