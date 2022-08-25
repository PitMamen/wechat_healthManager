const WXAPI = require('../../../static/apifm-wxapi/index')
Page({
  data: {
    category:[],
    cmsArticles:[],
    type:1,// 2云门诊医生列表
  },
  onLoad: function (options) {
    this.queryDepartment()
    console.log(options.type)
    this.setData({
      type:options.type,
    })
  },
  onShow: function () {

  },
  async queryDepartment() {
    const res = await WXAPI.queryDepartment(getApp().globalData.yljgdm)

    if (res.data) {
 
      this.setData({
        category: res.data
      })
      if (this.data.category && this.data.category.length > 0) {
        const departmentList=this.data.category[0].departmentList
        
        this.setData({
          cmsArticles:departmentList?departmentList:null
        })
      }
    }
  },
  // is-link url="{{type== 1?'../package-list/packagelist?id={{item.yyksdm}}':'../working/index?id={{item.yyksdm}}'}}" 
  clickDepartment(e){
    var that = this
    let yyksdm = e.currentTarget.dataset.id
    console.log(yyksdm)

    if(that.data.type == 2){

      wx.navigateTo({
        url: '../../cloud-doctor/working/index?id=' + yyksdm,
      })
    }else{
      wx.navigateTo({
        url: '../package-list/packagelist?id=' + yyksdm,
      })
    }

  },
  categoryChange(e) {
    const index = e.detail
    const departmentList=this.data.category[index].departmentList
    this.setData({
      cmsArticles:departmentList?departmentList:null
    })
  },
})