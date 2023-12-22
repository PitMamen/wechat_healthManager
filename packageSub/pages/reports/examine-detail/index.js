// pages/record/outpatient/index.js
const WXAPI = require('../../../../static/apifm-wxapi/index')
const Config = require('../../../../utils/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex:'0',
    items:[],
    AIitems:[],
    cursor: false,
    isAITrunking: false,
    AIChunk:'',
    scrollTopVal:0,
    pageHeight:0,
    detail:{
    }
  },

onLoad: function (options) {
  
    console.log('optionsExam', options)

    this.setData({
        options:options,
        detailId: options.id,
        userId: options.userId,
        userName:options.userName,
        userSex:options.userSex,
        userAge:options.userAge,
        pageHeight: wx.getSystemInfoSync().windowHeight,
    })

    this.getExamDetail()
    this.connectWebSocket()

    this.startCursorTimer()
},
  
  swichTab(e) {
    console.log(e)
    var index=e.currentTarget.dataset.index
    this.setData({
        activeIndex: index
    })
    if(index === '1' && this.data.AIitems.length===0 && !this.data.isAITrunking){
        this.sendMessageEvent()
    }
},

connectWebSocket(){

    wx.closeSocket()

    wx.connectSocket({
        
        url: Config.getConstantData().SocketUrl+ this.data.userId,
        success(res) {
            console.log('连接成功', res)
        }
    });

   


    wx.onSocketOpen(function () {
        console.log('WebSocket 已连接')

    })

    let that = this
    wx.onSocketMessage(function (res) {
        // console.log('收到服务器内容：', res)
        if(that.data.stop){
            return
        }
        if (res && res.data && typeof res.data === "string") {
            var data = JSON.parse(res.data)
          

            if (data.chunk) {
                if (!that.data.isAITrunking) {
                    that.setData({
                        isAITrunking: true
                    })
                    that.setData({
                    AIChunk:data.chunk,
                    scrollTopVal:99999
                   })
                } else {
                    that.setData({
                        AIChunk:that.data.AIChunk+data.chunk,
                        scrollTopVal:99999
                       })
                }

            }

            if (data.response) {
                console.log(data.response)
                clearInterval(that.cursorTimer)

                that.setData({
                    stop:true,
                    cursor: true,
                    isAITrunking:false,
                    AIitems:data.response.text
                })
                wx.showToast({
                  title: '已生成',
                })
            }
        }
    })

    wx.onSocketError(function (error) {
        console.log('socketerror', error)
    })
},
onStopClick(){
   if(this.data.stop){
    
    this.setData({
        stop: false,
        isAITrunking:false,
        AIChunk:'',
        AIitems:[]
    })

    this.sendMessageEvent()
   }else{
    this.setData({
        stop: true,
      
    })
    wx.showToast({
      title: '已停止生成',
      icon:'none'
    })
   }
    
},
  //发生文本消息
  sendMessageEvent() {
    if(this.data.isAITrunking){
        wx.showToast({
          title: 'AI正在回答，请稍后',
          icon:'none'
        })
        return
    }
 
    let that = this

    wx.sendSocketMessage({
        data: JSON.stringify({
            from: "patient",
            to: "gpt",
            reqType: "explainReportAbnormal",
            text: this.data.detail
        }),
        success(res) {
            console.log('发送成功', res)
            wx.showToast({
                title: '开始生成',
                icon:'none'
              })
            that.startCursorTimer()

            that.setData({
                cursor: false,
            })

        }
    })


},

cursorTimer: undefined,
startCursorTimer() {
    let that = this
    clearInterval(this.cursorTimer)
    this.cursorTimer = setInterval(() => {
        that.setData({
            cursor: !that.data.cursor
        })
    }, 500)

},

    //报告详情
    async getExamDetail() {
        //发起网络请求
        var that = this;
        const res = await WXAPI.inspectDetail({
            reportId: this.data.detailId,
            userId: this.data.userId,
        })
        console.log(res)
        if (res.code == 0) {
            that.setData({
                detail: res.data,
            })
          var  itemNames= res.data.items.map(item=>{
                return item.itemName
            })
           this.scrutableNames(itemNames)
           
        } else {
            wx.showToast({
                title: '数据加载失败',
                icon: 'none',
            })
        }
    },
    //可解读指标
    async scrutableNames(itemNames) {
      
        const res = await WXAPI.scrutableNames({
            itemNames: itemNames,
           
        })
       var  list =res.data || []
       var items=  this.data.detail.items
       items.forEach(item=>{
           list.forEach(item2=>{
               if(item.itemName === item2){
                item.canDecipher=true
               }
           })
       })
        this.setData({
            items:items
        })
    },
      //解读指标
  async explainExamName() {
      
    const res = await WXAPI.explainExamName({
        itemName: 'C反应蛋白',
       
    })
 
    this.setData({
        AIitems:res.data.items || []
    })
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onItemNameClick(e){
   var item= e.currentTarget.dataset.item
   console.log(e)
    wx.navigateTo({
      url: '../decipher/index?itemName='+item.itemName,
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
    wx.closeSocket()

    clearInterval(this.cursorTimer)

    this.cursorTimer = undefined
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