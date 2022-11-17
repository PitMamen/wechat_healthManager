// pages/detail/detail.js



Page({
    /**
     * 页面的初始数据
     */
    data: {
      title: '',
      url: '',
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
     console.log("问卷页面",decodeURIComponent(options.url))
      this.setData({
        url: decodeURIComponent(options.url)
      })
    },
    onUnload() {
      this.setData({
        url: this.data.url+'?flag=1'
      })
    }
    
  })
  