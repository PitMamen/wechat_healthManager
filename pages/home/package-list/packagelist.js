
const APP = getApp()
const WXAPI = require('../../../static/apifm-wxapi/index')
Page({
  data: {
    departmentId:'',
    topFlag:'',
    keyWords:'',
    // packageList: [], //科室服务
    hideHospitalPicker: true,
    hideScreenPicker: true,
    deptName:'全部科室',
    screenName:'全部服务',
    deptArray: [],
    screenData:[
      '推荐服务','全部服务'
    ],
  },
  onLoad: function(options) {
 
    
   console.log(options)
    if(options.ks && options.ks !==undefined){
      this.setData({//扫描科室服务二维码 返回的参数 科室代码
        departmentId: options.ks
      })
    }
    this.queryDepartment()
  },

  //科室列表
  async queryDepartment() {
    const res = await WXAPI.queryDepartment(getApp().globalData.yljgdm)

    if (res.data) {
      res.data.unshift('全部科室')
      this.setData({
        deptArray: res.data
      })
      if(this.data.departmentId === ''){
        this.getPackageList()
      }else{
        var index = 0
       
        this.data.deptArray.forEach((item,i)=>{
          if(item.deptCode == this.data.departmentId){
            index=i
            console.log(item.deptCode)
          }
        })
        console.log(index)
        this.setData({
          deptName:this.data.deptArray[index].deptName,
          departmentId:this.data.deptArray[index].deptCode,
          hideHospitalPicker: true,
    
          screenName:this.data.screenData[1],
          topFlag:'',
        });
    
        this.getPackageList()
      }
    
    }
  },

  /**
   * 服务类别列表
   */
  async getPackageList(){
    var postData={
      "belong":this.data.departmentId,//科室
      "status":1,//上架
      "topFlag":this.data.topFlag,//是否推荐 1推荐
      "className":this.data.keyWords,//关键字
      "pageNo":1,
      "pageSize":10000
    }
    console.log(postData)
   const res = await WXAPI.qryGoodsClassPlus(postData)

  
        this.setData({
          packageList: res.data.rows,
         
        })
      
    
    
  },
  onChange(e) {
    this.setData({
      keyWords: e.detail,
    });
  },
  onCancel(e){
    this.setData({
      keyWords: '',
    });
    this.getPackageList()
  },
  onSearch() {
    console.log('搜索' + this.data.keyWords);
    this.setData({
      screenName:this.data.screenData[1],
      topFlag:'',
    })
    this.getPackageList()
  },
    //切换科室
    changeHospital: function () {
      this.setData({
        hideHospitalPicker: false
      })
    },
    closeHospitalTap: function () {
      this.setData({
        hideHospitalPicker: true
      })
    },
    //选择筛选条件
    screenTap:function(){
      this.setData({
        hideScreenPicker: false
      })
    },
    closeScreenTap: function () {
      this.setData({
        hideScreenPicker: true
      })
    },
      //选择科室成功
  onHospitalPickerConfirm(event) {
    console.log(event)
    var index = event.detail.index
    this.setData({
      deptName:this.data.deptArray[index].deptName,
      departmentId:this.data.deptArray[index].deptCode,
      hideHospitalPicker: true,

      screenName:this.data.screenData[1],
      topFlag:'',
    });

    this.getPackageList()
  },

  onHospitaltPickerCancel() {
    this.setData({
      hideHospitalPicker: true
    })
  },
  //选择筛选成功
  onScreenPickerConfirm(event) {
    console.log(event)
    var index = event.detail.index

    this.setData({
      screenName:this.data.screenData[index],
      topFlag:index==0?1:'',
      hideScreenPicker: true,
    });

    this.getPackageList()
  },

  onScreenPickerCancel() {
    this.setData({
      hideScreenPicker: true
    })
  },
  toDetailsTap(event){
  var belong=  event.currentTarget.dataset.belong
  var classId=  event.currentTarget.dataset.classid
    wx.navigateTo({
        url:'../package-detail/packagedetail?departmentId=' + belong+"&goodsClass="+classId,  　　　　　　　　　　　　　　　　　　　　　　　
     } )
  },
  onShareAppMessage: function () {
    // 页面被用户转发
  },
  onShareTimeline: function () {
    // 页面被用户分享到朋友圈
  },
})