const WXAPI = require('../../static/apifm-wxapi/index')
const UserManager = require('../../utils/UserManager')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deptCode: '',//科室代码
    deptName: '',
    areaId: '',//病区id
    areaName: '',
    disease: '',//专病
    radio: '',
    choosePatient: {},//选择的就诊人
    hideLXShow: true,
    hideGXShow:true,
    nameColumns: [],
    btntx: '确认提交',
    success: false,
    zyh:'',xm:'',sfzh:'',jjlxdh:'',
    guanxi:'本人',
    relationArray: [
        {
          id: 0,
          name: '本人'
        },
        {
          id: 1,
          name: '配偶'
        },
        {
          id: 2,
          name: '子'
        },
        {
          id: 3,
          name: '女'
        },
        {
          id: 4,
          name: '父母'
        },
        {
          id: 5,
          name: '其他'
        }
      ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(options)
      
      if(options.scene){
        const scene = decodeURIComponent(options.scene)
        console.log(scene)
        console.log(scene.split('&'))
         this.setData({
            deptCode:   scene.split('&')[0] ,
            areaId: scene.split('&')[1] ,
          })
      }else{
        this.setData({ 
            deptCode: options.ks ,
            areaId: options.bq,
          })
      }

  this.getDiseaseList(this.data.deptCode)
  this.getDepartmentDetail(this.data.deptCode)
  if(this.data.areaId){
    this.getInpatientAreaDetail(this.data.areaId)
  }

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
   
    // var patientList = UserManager.getPatientInfoList()
    // if (patientList && patientList.length > 0) {
    //   patientList.forEach(patient => {
    //     patient.identificationNo_x = patient.identificationNo.replace(/^(.{6})(?:\w+)(.{4})$/, "$1********$2");
    //   })
    // }

    // this.setData({
    //   patientList: patientList
    // })
  },
  /**
      * 获取专病
      */
  async getDiseaseList(areaId) {
    const res = await WXAPI.getDiseaseList(areaId)
    this.setData({
      nameColumns:res.data
    })
  },
   /**
      * 获取科室名称
      */
     async getDepartmentDetail(deptCode) {
      const res = await WXAPI.getDepartmentDetail(deptCode)
      this.setData({
        deptName:res.data.departmentName
      })
    },
     /**
      * 获取病区名称
      */
  async getInpatientAreaDetail(areaId) {
    const res = await WXAPI.getInpatientAreaDetail(areaId)
    this.setData({
      areaName:res.data.inpatientAreaName
    })
  },
  /**
      * 提交
      */
  async addPatientMedicalRecords(userId) {
    var postData = {
      "userId": userId,
      "deptCode": this.data.deptCode,
      "deptName": this.data.deptName,
      "areaName": this.data.areaName,
      "disease": this.data.disease
    }

    const res = await WXAPI.addPatientMedicalRecords(postData)

    if (res.code === 0) {
      this.setData({
        success:true
      })

      wx.showModal({
        title: '提示',
        content: '提交成功！',

        showCancel: false,
        success(res) {
          //页面跳转首页
          wx.switchTab({
            url: '../home/main'
          })
        }
      })
    }

  },

  onCheckedChange(event) {
    var item = event.currentTarget.dataset.item
    var index = event.currentTarget.dataset.index
    console.log("选择：", item)
    this.setData({
      radio: index,
      choosePatient: item
    })
  },
  addPatient() {
    wx.navigateTo({
      url: '/pages/me/patients/addPatient',
    })
  },
  bindLXTap() {
    this.setData({
      hideLXShow: false
    })
  },
  closeLXTap() {
    this.setData({
      hideLXShow: true
    })
  },
  onLXConfirm(event) {
    console.log(event)
    var value = event.detail.value
    this.setData({
      disease: value.diseaseName,
      hideLXShow: true
    })
  },
  bindGXTap() {
    this.setData({
      hideGXShow: false
    })
  },
  closeGXTap() {
    this.setData({
      hideGXShow: true
    })
  },
  onGXConfirm(event) {
    console.log(event)
    var value = event.detail.value
    this.setData({
      guanxi: value.name,
      hideGXShow: true
    })
  },
   //防抖动
   debounced: false,
  confrim() {
      
    if (that.debounced) {
        return
    }
    that.debounced = true
    setTimeout(() => {
        that.debounced = false
    }, 2000)
    if (this.data.success) {
      //页面跳转首页
      wx.switchTab({
        url: '../home/main'
      })
      return
    }
    if (!this.data.deptName) {
      wx.showToast({
        title: '就诊科室为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // if (!this.data.disease) {
    //   wx.showToast({
    //     title: '请选择专病',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return
    // }
    if (!this.data.zyh) {
        wx.showToast({
          title: '请输入患者住院号',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!this.data.xm) {
        wx.showToast({
          title: '请输入患者姓名',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!this.data.sfzh) {
        wx.showToast({
          title: '请输入患者身份证号',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!this.data.jjlxdh) {
        wx.showToast({
          title: '请输入紧急联系电话',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!this.data.guanxi) {
        wx.showToast({
          title: '请选择与就诊人关系',
          icon: 'none',
          duration: 2000
        })
        return
      }
     var patientInfoList= UserManager.getPatientInfoList()
     var userId=''
     if (patientInfoList && patientInfoList.length > 0) {
        patientInfoList.forEach(item => {
          if (item.identificationNo === this.data.sfzh) {      
                  userId=item.userId
                        
          }
        })
      }
      if(userId){
        this.addPatientMedicalRecords(userId)  
      }else{
        this.addPatientQuery()
      }
      
   
  },
     
      addPatientQuery() {
  
          var that = this;
  
  
      var idInfo = Util.getBirthdayAndSex(that.data.sfzh)
      var user = wx.getStorageSync('userInfo').account
      const postData = {
        accountId: user.accountId,
        userName: that.data.xm,
        identificationNo: that.data.sfzh,
        identificationType: '01',//默认身份证
        phone: user.phone,
        code: '1',
        birthday: idInfo.birthDay,
        relationship: that.data.guanxi,
        isDefault: true,
        cardNo: '',//就诊卡号
        userSex: idInfo.sex == 0 ? '女' : '男'
      }
      WXAPI.addPatientQuery(postData).then(res=>{
          if (res.code == 0) {
              var patientInfoList=res.data
              UserManager.savePatientInfoList(patientInfoList)

              if (patientInfoList && patientInfoList.length > 0) {
                patientInfoList.forEach(item => {
                  if (item.isDefault) {      
                          
                       that.addPatientMedicalRecords(item.userId)           
                  }
                })
              }
            } else {
              wx.showModal({
                  title: '系统提示',
                  content: res.message,
                  showCancel:false,             
                  })
             
            
            }
      }).catch(e=>{
          wx.showModal({
              title: '系统提示',
              content: '请求失败，请重试',
              showCancel:false,             
              })
         
      })
  
  
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

  },



})