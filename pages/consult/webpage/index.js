// pages/detail/detail.js



Page({
    /**
     * 页面的初始数据
     */
    data: {
      title: '',
      url: '',
      type:''
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      var url= decodeURIComponent(options.url)
        console.log(url)
      this.setData({
        url: url,
        type: options.type //1问卷 2文章
      })
    //   if(this.data.type == 1){
    //     wx.setNavigationBarTitle({
    //         title: '填写问卷'
    //       })
    //   }else  if(this.data.type == 2){
    //     wx.setNavigationBarTitle({
    //         title: '阅读文章'
    //       })
    //   }
      
    },
    onUnload() {
      this.setData({
        url: this.data.url+'?flag=1'
      })
    }
    
  })
  