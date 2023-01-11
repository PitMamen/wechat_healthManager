
const WXAPI = require('../../../static/apifm-wxapi/index')
Page({
    data: {
        queryText:'',
        currentHospital:{},
        hospitalList:[]
    },
    onLoad: function (options) {
        this.setData({
            currentHospital:getApp().globalData.currentHospital
        })
        
        this.gethospitalList()
    },

    //医院列表
    async gethospitalList() {
        const res = await WXAPI.gethospitalList({queryText:this.data.queryText})
        if(res.code==0){
            this.setData({
                hospitalList:res.data
            })
        }
    },

    
    onChange(e) {
        this.setData({
            queryText: e.detail,
        });
    },
    onCancel(e) {
        this.setData({
            queryText: '',
        });
        this.gethospitalList()
    },
    onSearch() {
        console.log('搜索' + this.data.queryText);
        this.gethospitalList()
    },
    onCurrentHospitalClick(){
        wx.navigateBack()
    },
    //选择医院
    onHospitalSeleced(e) {
       
        let that=this
       var hospital= e.currentTarget.dataset.item
        wx.showModal({
            title: '提示',
            content: '确定切换到'+hospital.hospitalName+'吗？',
            success(res) {
                if (res.confirm) {
                    if(that.checkLoginStatus()){
                        that.switchHospital(hospital.hospitalCode)
                    }else{
                        var currentHospital={
                            hospitalCode:hospital.hospitalCode,
                            hospitalName:hospital.hospitalName,
                            hospitalLevelName:hospital.hospitalLevelName
                          }
                      
                         getApp().globalData.currentHospital=currentHospital
                        wx.showToast({
                            title: '切换成功！',
                        })
                        setTimeout(function () {
                            wx.switchTab({
                              url: '/pages/home/main',
                            })
                        }, 1000)
                    }
                   
                }
            }
        })



    },
      //切换医院
      async switchHospital(hospitalCode) {
        const res = await WXAPI.switchHospital({hospitalCode:hospitalCode})
        if(res.code==0){
            wx.showToast({
                title: '切换成功！',
            })
            setTimeout(function () {
                wx.switchTab({
                    url: '/pages/home/main',
                  })
            }, 1000)
        }
    },
    checkLoginStatus() {
        var userInfoSync = wx.getStorageSync('userInfo')
        if (userInfoSync) {
            return true
        } else {
            return false
        }

    },
    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})