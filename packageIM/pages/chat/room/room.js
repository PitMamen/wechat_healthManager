import { randomRoomID }  from '../../../../utils/common'
import TRTC from '../../../static/trtc-wx'
const WXAPI = require('../../../../static/apifm-wxapi/index')
Page({
    countDownInterval:null,
  data: {
    index:'',//进入房间前聊天界面条目
    roomID:'',
    _rtcConfig: {
      sdkAppID: '', // 必要参数 开通实时音视频服务创建应用后分配的 sdkAppID
      userID: '', // 必要参数 用户 ID 可以由您的帐号系统指定
      userSig: '', // 必要参数 身份签名，相当于登录密码的作用
    },
    pusher: null,
    playerList: [],
    remind:'',
    countNum:0,//计时
    chatTime:  60 * 60 ,//倒计时
    isStartCountDowned:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('room onload', options)
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
    this.TRTC = new TRTC(this)
    this.init(options)
    this.bindTRTCRoomEvent()
    this.enterRoom({ roomID: options.roomID })
  },

  onReady() {
    console.log('room ready')
  },
  onUnload() {
    console.log('room unload')
  },
  init(options) {
    // pusher 初始化参数
    const pusherConfig = {
      beautyLevel: 9
    }
    const pusher = this.TRTC.createPusher(pusherConfig)
    console.log(pusher.pusherAttributes, '000')

    this.setData({
      _rtcConfig: {
        userID: getApp().globalData.IMuserID,
        sdkAppID:  getApp().globalData.sdkAppID,
        userSig: getApp().globalData.IMuserSig,
      },
      roomID:options.roomID,
      tradeId:options.tradeId,//工单ID
      chatTime:options.chatTime,//剩余通话时长 
      pusher: pusher.pusherAttributes
    })

  },

  
  //开始倒计时
  startCountDown(){
    if(this.data.isStartCountDowned){
        return
    }
    console.log("开始倒计时")
    this.setData({
        isStartCountDowned:true
    })
    let that=this
    this.countDownInterval= setInterval(function(){
       var chatTime=that.data.chatTime-1
       var countNum=that.data.countNum+1
      var countdownArr= that.formartTime(chatTime)
       that.setData({
        countNum:countNum,
        chatTime:chatTime,
        countdown:countdownArr[0]+':'+countdownArr[1]
       })
       if(chatTime<11){
        that.setData({
            remind:'通话时长剩余'+chatTime+'秒,即将挂断'
           })
       }
       if(chatTime<1){
        that.stopCountDown()
        that._hangUp()
       }
        },1000)  
  },
  stopCountDown(){
    if(this.data.isStartCountDowned){
        console.log("结束倒计时")
        this.setData({
            isStartCountDowned:false
        })
        clearInterval(this.countDownInterval)
        this.recordTradeVideoNum()
    }
   
  },

  formartTime(second){
    var secondTime = parseInt(second);// 秒
    var minuteTime = 0;// 分
    if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
    }
    if(minuteTime<10){
        minuteTime='0'+''+minuteTime
    }
    if(secondTime<10){
        secondTime='0'+''+secondTime
    }
    return [minuteTime,secondTime]
  },

    //视频计时
    async recordTradeVideoNum() {

        if (!this.data.tradeId) {
            return
        }

        const postData = {
            tradeId: this.data.tradeId,
            userId: this.data._rtcConfig.userID,
            usedTime:this.data.countNum
        }
        const res = await WXAPI.recordTradeVideoNum(postData)
        if(res.code === 0){
            this.setData({
                countNum:0
            })
        }
    },
  enterRoom(options) {
    const roomID = options.roomID || randomRoomID()
    const config =  Object.assign(this.data._rtcConfig, { roomID })
    this.setData({
      pusher: this.TRTC.enterRoom(config),
    }, () => {
      this.TRTC.getPusherInstance().start() // 开始推流（autoPush的模式下不需要）
    })
  },

  exitRoom() {
    const result = this.TRTC.exitRoom()
    this.setData({
      pusher: result.pusher,
      playerList: result.playerList,
    })
  },

  // 设置 pusher 属性
  setPusherAttributesHandler(options) {
    this.setData({
      pusher: this.TRTC.setPusherAttributes(options),
    })
  },

  // 设置某个 player 属性
  setPlayerAttributesHandler(player, options) {
    this.setData({
      playerList: this.TRTC.setPlayerAttributes(player.streamID, options),
    })
  },

  // 事件监听
  bindTRTCRoomEvent() {
    const TRTC_EVENT = this.TRTC.EVENT
    // 初始化事件订阅
    //本地进入房间
    this.TRTC.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
      console.log('* room LOCAL_JOIN', event)
      // // 进房成功，触发该事件后可以对本地视频和音频进行设置
      this.setPusherAttributesHandler({ enableCamera: true })
      this.setPusherAttributesHandler({ enableMic: true })
      if(this.data.playerList.length === 1){
          //如果远端用户已经存在 则直接开始倒计时
          this.startCountDown()
      }
    })
    //本地退出房间
    this.TRTC.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
      console.log('* room LOCAL_LEAVE', event)
        this.stopCountDown()
    })
       //远端进入房间
       this.TRTC.on(TRTC_EVENT.REMOTE_USER_JOIN, (event) => {
        console.log('* room REMOTE_USER_JOIN', event)
        //开始倒计时
        this.startCountDown()
      })
    // 远端用户退出
    this.TRTC.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
      const { playerList } = event.data
      this.setData({
        playerList: playerList,
      })
      this.stopCountDown()
        this._hangUp()
     
      console.log('* room REMOTE_USER_LEAVE', event)
    })
        //错误信息
        this.TRTC.on(TRTC_EVENT.ERROR, (event) => {
            console.log('* room ERROR', event)
          })
    // 远端用户推送视频
    this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
      console.log('* room REMOTE_VIDEO_ADD',  event)
      const { player } = event.data
      // 开始播放远端的视频流，默认是不播放的
      this.setPlayerAttributesHandler(player, { muteVideo: false })
     
    })
    // 远端用户取消推送视频
    this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event) => {
      console.log('* room REMOTE_VIDEO_REMOVE', event)
      const { player } = event.data
      this.setPlayerAttributesHandler(player, { muteVideo: true })
    })
    // 远端用户推送音频
    this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
      console.log('* room REMOTE_AUDIO_ADD', event)
      const { player } = event.data
      this.setPlayerAttributesHandler(player, { muteAudio: false })
    })
    // 远端用户取消推送音频
    this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
      console.log('* room REMOTE_AUDIO_REMOVE', event)
      const { player } = event.data
      this.setPlayerAttributesHandler(player, { muteAudio: true })
    })
  },

  // 是否订阅某一个player Audio
  _mutePlayerAudio(event) {
    const player = event.currentTarget.dataset.value
    if (player.hasAudio && player.muteAudio) {
      this.setPlayerAttributesHandler(player, { muteAudio: false })
      return
    }
    if (player.hasAudio && !player.muteAudio) {
      this.setPlayerAttributesHandler(player, { muteAudio: true })
      return
    }
  },

  // 订阅 / 取消订阅某一个player Video
  _mutePlayerVideo(event) {
    const player = event.currentTarget.dataset.value
    if (player.hasVideo && player.muteVideo) {
      this.setPlayerAttributesHandler(player, { muteVideo: false })
      return
    }
    if (player.hasVideo && !player.muteVideo) {
      this.setPlayerAttributesHandler(player, { muteVideo: true })
      return
    }
  },

  // 挂断退出房间
  _hangUp() {
    this.exitRoom()
    wx.navigateBack({
      delta: 1,
    })
  },

  // 设置美颜
  _setPusherBeautyHandle() {
    const  beautyLevel = this.data.pusher.beautyLevel === 0 ? 9 : 0
    this.setPusherAttributesHandler({ beautyLevel })
  },

  // 发布 / 取消发布 Audio
  _pusherAudioHandler() {
    if (this.data.pusher.enableMic) {
      this.setPusherAttributesHandler({ enableMic: false })
    } else {
      this.setPusherAttributesHandler({ enableMic: true })
    }
  },

  _pusherSwitchCamera() {
    const  frontCamera = this.data.pusher.frontCamera === 'front' ? 'back' : 'front'
    this.TRTC.getPusherInstance().switchCamera(frontCamera)
  },

  _setPlayerSoundMode() {
    if (this.data.playerList.length === 0) {
      return
    }
    const player = this.TRTC.getPlayerList()
    const soundMode = player[0].soundMode === 'speaker' ? 'ear' : 'speaker'
    this.setPlayerAttributesHandler(player[0], { soundMode })
  },
  // 请保持跟 wxml 中绑定的事件名称一致
  _pusherStateChangeHandler(event) {
    this.TRTC.pusherEventHandler(event)
  },
  _pusherNetStatusHandler(event) {
    this.TRTC.pusherNetStatusHandler(event)
  },
  _pusherErrorHandler(event) {
    this.TRTC.pusherErrorHandler(event)
  },
  _pusherBGMStartHandler(event) {
    this.TRTC.pusherBGMStartHandler(event)
  },
  _pusherBGMProgressHandler(event) {
    this.TRTC.pusherBGMProgressHandler(event)
  },
  _pusherBGMCompleteHandler(event) {
    this.TRTC.pusherBGMCompleteHandler(event)
  },
  _pusherAudioVolumeNotify(event) {
    this.TRTC.pusherAudioVolumeNotify(event)
  },
  _playerStateChange(event) {
    this.TRTC.playerEventHandler(event)
  },
  _playerFullscreenChange(event) {
    this.TRTC.playerFullscreenChange(event)
  },
  _playerNetStatus(event) {
    this.TRTC.playerNetStatus(event)
  },
  _playerAudioVolumeNotify(event) {
    this.TRTC.playerAudioVolumeNotify(event)
  },
})

