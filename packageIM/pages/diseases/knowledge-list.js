// pages/home/news/news-list.js
const WXAPI = require('../../../static/apifm-wxapi/index')

var page = 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMoreLoading:false,
    deptName: '全部科室',
    screenName: '推荐服务',
    deptArray: [],
    screenData: [
      '推荐服务', '全部服务'
    ],
    keyWords: '',
    activeName: '0',
    tagList: [],
    disease: '',//所属专病
    diseaseIndex: '',
    list: [],
    state: 1,//用于标识是否还有更多的状态
    pageSize: 30,
    APItype: 0,//0查询推荐文章 1搜索关键字 2点击专病
    knowledgeType: '',
    topArrIndex:0,
    topArr: [{
      knowledgeType: 'FWZX', name: '服务咨询', active: true
    }, {
      knowledgeType: 'JZDH', name: '就诊导航', active: false
    },]
  },
  /**
* 生命周期函数--监听页面加载
*/
  onLoad: function (options) {
   const knowledgeType =options.knowledgeType
  
   if(knowledgeType){
    this.data.topArr.forEach((item,index)=>{
      
      if(item.knowledgeType === knowledgeType){
          item.active=true
          this.setData({
            topArrIndex:index,
          })
      }else{
        item.active=false
      }
    })
   }
    this.setData({
      knowledgeType: this.data.topArr[this.data.topArrIndex].knowledgeType,
    })
    page = 1;

    

    this.qrySysKnowledge()
  },

  async qrySysKnowledge() {
    var that = this;
    var list = this.data.list

    var postData = {
      "knowledgeType": this.data.knowledgeType,
      "keyWord": "",
      "pageNo": page,
      "pageSize": that.data.pageSize
    }

    const res = await WXAPI.qrySysKnowledge(postData)
    console.log(res)
    this.setData({
        isMoreLoading:false
    })
    if (res.code == 0) {
      if (page == 1) {
        list = res.data.rows
       
      } else {
        list = list.concat(res.data.rows)
      }

      that.setData({
        list: list,
        state: res.data.rows.length < that.data.pageSize ? 0 : 1
      })
      page++;
      wx.hideLoading();
   
    } else {
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
      })
    }
  },


  //按关键字查询问题答案列表
  async qrySysKnowledgeAnswer() {

    this.setData({
      list: [],
      state: 0,
      "knowledgeType": '',
      topArrIndex:-1
    })

    var postData = {
      "knowledgeType": '',
      "keyWord": this.data.keyWords,
    }

    const res = await WXAPI.qrySysKnowledgeAnswer(postData)
    this.setData({
        isMoreLoading:false
    })
    if (res.data && res.data.length > 0) {
      this.setData({
        list: res.data,
        
      })

    } 

  },


  onCollapseChange(event) {
    this.setData({
      activeName: event.detail,
    });
  },

  binddiseaseTop(event) {
    var item = event.currentTarget.dataset.item
    var index = event.currentTarget.dataset.index
    this.setData({
      disease: item,
      diseaseIndex: index,
      APItype: 2,
    })
    this.refresh()
  },
  bindHealthTap(e) {
    
    const index=e.currentTarget.dataset.index
    if(this.data.topArrIndex===index){
      return
    }
    this.setData({
      keyWords:"",
      topArrIndex: index,
      knowledgeType:this.data.topArr[index].knowledgeType
    })
   this.refresh()
},
  refresh(){
    page = 1
    this.setData({
      state: 1
    })
    this.qrySysKnowledge()
  },
  //加载更多数据
  loadMore () {
    console.log("loadMore")
    var that = this;
    var state = that.data.state;
    if (state == 1) {
        this.setData({
            isMoreLoading:true
        })
      this.qrySysKnowledge()
    } else {
  
      wx.showToast({
        title: '没有更多数据了',
        icon: "none",
      })
    }
  },



  onChange(e) {
    this.setData({
      keyWords: e.detail,
    });
  },

  onSearch() {
    console.log('搜索' + this.data.keyWords);
    this.setData({
      APItype: this.data.keyWords ? 1 : 0,
      disease: '',
      diseaseIndex: ''
    })
    if (this.data.keyWords) {
      this.qrySysKnowledgeAnswer()
    } else {
      this.refresh()
    }

  },
  knowledgeClick(e){
    const id=e.currentTarget.dataset.id
    wx.navigateTo({
        url: './content?id='+id,
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
 this.loadMore()

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})