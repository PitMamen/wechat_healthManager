const WXAPI = require('../../../../static/apifm-wxapi/index')
const IMUtil = require('../../../../utils/IMUtil')
const UserManager = require('../../../../utils/UserManager')

Page({
    data: {
        navBarHeight: null,
        statusBarHeight: null,
        id: null,
        title: '',
        show: false,
        loading: false,
        info: {},
        isCollect: false, //0收藏/1取消
        activeItem: {},
        activeServiceItem: {},
        activepItem: {},
        comments: [],
        listService: [],
        list: [],
        isFromCode:false //扫描医生二维码进来的
       
      },
    onLoad: function (options) {
        console.log('doctor-info options',options)
        // 页面创建时执行
        wx.showShareMenu({
            withShareTicket: true
        })
        if (options.scene) {
            const scene = decodeURIComponent(options.scene)
            console.log(scene)
            console.log(scene.split('&'))
            this.setData({
                id: scene.split('&')[0],
                tenantId: scene.split('&')[1],
                hospitalCode: scene.split('&')[2],
                isFromCode:true
            })
            getApp().globalData.currentHospital.tenantId=scene.split('&')[1]
             getApp().globalData.currentHospital.hospitalCode=scene.split('&')[2]
        } else {
            this.setData({
                id: options.id,
                tenantId: options.tenantId,
                hospitalCode: options.hospitalCode,
                isFromCode:options.tenantId?true:false
            })
            getApp().globalData.currentHospital.tenantId=options.tenantId
             getApp().globalData.currentHospital.hospitalCode=options.hospitalCode
        }
        this.setData({
            title: options.title,
            navBarHeight: getApp().globalData.navBarHeight,
            statusBarHeight: getApp().globalData.statusBarHeight
        })
        this.getInfo()
        this.getComments()
        
    },
  
 
  onShow: function () {
    // 页面出现在前台时执行
    this.setData({
        loading: false
    })
    if (!getApp().globalData.loginReady) {
        this.WXloginForLogin()
    } else {
        this.favouriteExistsForDoctorId()
    }
  },
  onReady: function () {
    // 页面首次渲染完毕时执行
  },
  onHide: function () {
    // 页面从前台变为后台时执行
  },
  onUnload: function () {
    // 页面销毁时执行
  },
  onPullDownRefresh: function () {
    // 触发下拉刷新时执行
  },
  onReachBottom: function () {
    // 页面触底时执行
  },
  onShareAppMessage: function () {
    // 页面被用户分享时执行
  },
  onPageScroll: function () {
    // 页面滚动时执行
  },
  onResize: function () {
    // 页面尺寸变化时执行
  },
  onTabItemTap(item) {
    // tab 点击时执行
  },

  checkAll(event) {

    wx.navigateTo({
      url: `/packageDoc/pages/doctor/comments/index?id=${this.data.id}&title=${this.data.title}`
    })
  },

  getInfo() {
    WXAPI.doctorCommodities({
      doctorUserId: this.data.id
    }).then((res) => {
      this.setData({
        info: res.data || {},
        list: ((res.data || {}).commodities || []).map(item => {
          return {
            ...item,
            className: this.getClassName(item.classifyCode)
          }
        })
      })
      wx.setNavigationBarTitle({
        title: this.data.info.userName || '',
      })
      if (this.data.list.length > 0) {
        const pitem = this.data.list[0]
        if (pitem.pkgRules.length > 0) {
          const item = pitem.pkgRules[0]
          this.setData({
            activeItem: item,
            activepItem: pitem
          })
        }
      }

      //处理专科服务  serviceCommodities

      this.setData({
        listService: ((res.data || {}).serviceCommodities || []).map(item => {
          return {
            ...item,
            checked: false
          }
        })
      })

      console.log('listService', this.data.listService)
    })
  },
  getComments() {
    WXAPI.getDocComments({
      status: 2,
      serviceType: 1,
      doctorId: this.data.id,
      pageNo: 1,
      pageSize: 5
    }).then((res) => {
      res.data.rows.forEach(element => {
        element.createTime = element.createTime.substring(0, 10)
        if (element.userName.length == 2) {
          element.userName = element.userName.substring(0, 1) + '*'
        } else if (element.userName.length == 3) {
          element.userName = element.userName.substring(0, 1) + '**'
        } else if (element.userName.length == 4) {
          element.userName = element.userName.substring(0, 1) + '***'
        }
      });
      this.setData({
        comments: res.data.rows
      })

    })
  },
  getClassName(code) {
    const name = {
      '101': 'image',
      '102': 'phone',
      '103': 'video'
    } [code + '']
    return name || 'other'
  },

  async goCollect() {
    var userInfoSync = wx.getStorageSync('userInfo')

    var requestData = {
      favouriteType: 1,
      operationType: this.data.isCollect ? 1 : 0, //0收藏/1取消
      targetId: this.data.id,
      userId: userInfoSync.accountId,
    }
    console.log("doctor_id:", requestData)
    const res = await WXAPI.doCollect(requestData)
    if (res.code == 0) {
      wx.showToast({
        title: this.data.isCollect ? '已取消关注' : '已关注',
        icon: 'success',
        duration: 2000
      })
      this.setData({
        isCollect: !this.data.isCollect
      })

    }
  },
  //是否已关注
  favouriteExistsForDoctorId() {
    WXAPI.favouriteExistsForDoctorId(this.data.id).then((res) => {
        this.setData({
            isCollect: res.data || false
        })
        if (!this.data.isCollect && this.data.isFromCode) {
            //没有关注自动关注
            this.goCollect()
        }
    })
},
goCollect() {
    var userInfoSync = wx.getStorageSync('userInfo')

    var requestData = {
        favouriteType: 1,
        operationType: this.data.isCollect ? 1 : 0, //0收藏/1取消
        targetId: this.data.id,
        userId: userInfoSync.accountId,
    }
    console.log("doctor_id:", requestData)
    WXAPI.doCollect(requestData).then((res) => {
        if (res.code == 0) {
            wx.showToast({
                title: this.data.isCollect ? '已取消关注' : '已关注',
                icon: 'success',
                duration: 2000
            })
            this.setData({
                isCollect: !this.data.isCollect
            })

        }

    })

},
    onBackTap() {
        wx.navigateBack({})
    },
    onMoreTap() {
        this.setData({
            show: true
        })
    },
    closePopup() {
        this.setData({
            show: false
        })
    },
    onDetailTap(event) {
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
            url: `/packageDoc/pages/doctor/detail/index?id=${item.commodityId}&docId=${this.data.id}&docName=${this.data.title}`
        })
    },
    onGoodTap(event) {
        const item = event.currentTarget.dataset.item
        const pitem = event.currentTarget.dataset.pitem
        this.setData({
            activeItem: item,
            activepItem: pitem
        })
    },
    onBuyClick() {

        if (!getApp().globalData.loginReady){
            wx.showModal({
                title: '提示',
                content: '此功能需要登录',
                confirmText: '去登录',
                cancelText: '取消',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/auth?type=RELOGIN'
                        })
                    }
                }
            })
            return
        }

  
       
           //先处理跳专科服务逻辑,return 了后面的逻辑全部是处理问诊咨询的逻辑
    if (this.data.activeServiceItem && this.data.activeServiceItem.commodityId) {
        wx.navigateTo({//跳转时加type 2为确定医生不能改变
          url: `/packageDoc/pages/health/detail/index?id=${this.data.activeServiceItem.commodityId}&type=2&docId=${this.data.id}&docName=${this.data.info.userName}`
        })
        return
      }
  
      if (!this.data.activeItem.collectionId || this.data.activeServiceItem.commodityId) {
        wx.showToast({
          title: '请选择咨询服务或者专科服务',
          icon: 'error'
        })
        return
      }

        if(this.data.isFromCode){
            //如果是来自扫描医生二维码 先切换医院 再跳转
            this.switchHospital()
        }else{
            this.goBuy()
        }

    },

    goBuy(){


        this.setData({
            loading: true
        })

        const collectionIds = (this.data.activepItem.compulsoryCollectionIds || []).concat([this.data.activeItem.collectionId])
        console.log("collectionIds=" + collectionIds)
        console.log("activepItem=", this.data.activepItem)
  
        const serviceItemType=this.data.activepItem.pkgRules[0].serviceItemTypes[0]
        if (serviceItemType === 102 || serviceItemType === 103) { //电话咨询 视频咨询
            wx.navigateTo({
                url: `/packageDoc/pages/doctor/choose-time/index?consultType=${serviceItemType}&docId=${this.data.id}&commodityId=${this.data.activepItem.commodityId}&collectionIds=${collectionIds.join(',')}`
            })
        } else if (serviceItemType === 101) { //图文咨询
         
            wx.navigateTo({
                url: `/packageDoc/pages/doctor/choose-patient/index?consultType=${serviceItemType}&docId=${this.data.id}&commodityId=${this.data.activepItem.commodityId}&collectionIds=${collectionIds.join(',')}`
            })
        }  else {
           
              wx.navigateTo({
                url: `/packageDoc/pages/doctor/case/index?docId=${this.data.id}&commodityId=${this.data.activepItem.commodityId}&collectionIds=${collectionIds.join(',')}`
              })
            }
        
  },
  onBackTap() {
    wx.navigateBack({})
  },
  onMoreTap() {
    this.setData({
      show: true
    })
  },
  closePopup() {
    this.setData({
      show: false
    })
  },
  onDetailTap(event) {
    const item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: `/packageDoc/pages/doctor/detail/index?id=${item.commodityId}&docId=${this.data.id}&docName=${this.data.title}`
    })
  },
  onServiceTap(event) {
    console.log('onServiceTap', event)
    console.log('onServiceTap  this.data.listService', this.data.listService)
    let _index = event.currentTarget.dataset.index
    this.data.listService.forEach(element => {
      console.log('element', element.checked)
      element.checked = false
    });
    this.data.listService[_index].checked = true
    this.setData({
      listService: this.data.listService
    })
    this.setData({
      activeServiceItem: event.currentTarget.dataset.item,
    })
    console.log('onServiceTap  this.data.listService2', this.data.listService)
    this.setData({
      activeItem: {},
      activepItem: {},
    })
  },
  onGoodTap(event) {
    const item = event.currentTarget.dataset.item
    const pitem = event.currentTarget.dataset.pitem
    this.setData({
      activeItem: item,
      activepItem: pitem
    })
    this.data.listService.forEach(element => {
      console.log('element', element.checked)
      element.checked = false
    });
    this.setData({
      activeServiceItem: {},
      listService: this.data.listService
    })
  },
  

      //切换医院
      async switchHospital() {
        const res = await WXAPI.switchHospital({ hospitalCode: this.data.hospitalCode })
        if (res.code == 0) {
            this.getMaLoginInfo()
        }
    },
    //获取登录信息
    async getMaLoginInfo() {

        const res = await WXAPI.getMaLoginInfo({})

        if (res.code == 0 && res.data.loginStatus == '1') {

            var currentHospital = {
                tenantId: res.data.tenantId,
                hospitalCode: res.data.hospitalCode,
                hospitalName: res.data.hospitalName,
                hospitalLevelName: res.data.hospitalLevelName
            }

            getApp().globalData.currentHospital = currentHospital

            UserManager.savePatientInfoList(res.data.patients)

            
            this.goBuy()

        }

    },

     //登录时获取code
     WXloginForLogin() {
        wx.showLoading({
            title: '加载中',
        })

        let that = this
        wx.login({
            success(res) {
                console.log("WXlogin", res)
                if (res.code) {
                    that.loginQuery(res.code);
                } else {
                    wx.showToast({
                        title: '获取微信code失败',
                        icon: "none",
                        duration: 2000
                    })
                    wx.hideLoading()
                }
            }
        })
    },



    //登录
    async loginQuery(e) {

        let that=this

        const res = await WXAPI.loginQuery({
            code: e,
            appId: wx.getAccountInfoSync().miniProgram.appId
        })
        wx.hideLoading()
        if (res.code == 0) {
            that.loginSuccess(res.data)

        } else if (res.code == 10003) { //用户不存在
            if (!getApp().globalData.reLaunchLoginPage) {
                // console.log("confirm-patient.js： 跳转到登录页")
                getApp().globalData.reLaunchLoginPage = true
                wx.navigateTo({
                    url: '/pages/login/auth?type=RELOGIN',
                })
            }

        } else {
            wx.showToast({
                title: '登录失败,请重试',
                icon: "none",
                duration: 2000
            })

        }
    },
    loginSuccess(userInfo) {

        //保存用户信息
        wx.setStorageSync('userInfo', userInfo)
        //IM apppid
        getApp().globalData.sdkAppID = userInfo.account.imAppId
        getApp().globalData.loginReady = true


        if (userInfo.account.user && userInfo.account.user.length > 0) {
            var defaultPatient = userInfo.account.user[0]
            userInfo.account.user.forEach(item => {
                if (item.isDefault) {
                    defaultPatient = item
                }
            })
            //保存默认就诊人
            wx.setStorageSync('defaultPatient', defaultPatient)
            IMUtil.LoginOrGoIMChat(defaultPatient.userId, defaultPatient.userSig)
        }

        this.goCollect()
    },

})