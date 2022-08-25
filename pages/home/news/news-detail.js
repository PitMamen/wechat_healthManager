// pages/detail/detail.js


const WXAPI = require('../../../static/apifm-wxapi/index')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    article:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
   console.log(options)
    this.setData({
      id: options.id
    })
    this.articleById(options.id)
    this.addArticleClickNum(options.id)
  },
  async articleById(id) {
    const res = await WXAPI.articleById(id)

    if(res.code==0){

      // var content="<p data-we-video-p='true'><video  controls='controls' style='max-width:100%'><source src='http://192.168.1.122/content-api/file/V202201271136443174ATQYTOA8FOPXW-35510a361c998b2997eb7b8246f50b8a.mp4' type='video/mp4'></video></p>"
      // res.data.content=content
      this.setData({
        article: res.data
      })
      wx.setNavigationBarTitle({
        title: res.data.title
        })
    }
 

    
  },
  async addArticleClickNum(id) {
     await WXAPI.addArticleClickNum(id)
  },
})
