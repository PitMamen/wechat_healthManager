const WXAPI = require('../../../static/apifm-wxapi/index')
const Util = require('../../../utils/util')
const IMUtil = require('../../../utils/IMUtil')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {},
        value1:5,
        value2:5,
        value3:5,
        value4:5,
        isDetail:false,
        inputTxt:'医生回复超快，解答详细，医术高明。'
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId: options.rightsId,
            id:options.id

        })
        this.getRightsInfo(this.data.rightsId)
        if(options.id){
            this.setData({
                isDetail:true
            })
            this.getAppraiseById(options.id)
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },
    async getRightsInfo(id) {

        const res = await WXAPI.getRightsInfo({ rightsId: id })
        if (res.code == 0) {

            this.setData({
                detail: res.data,          
            })
       
        }

    },
       //获取评价详情
       async getAppraiseById(id) {

        const res = await WXAPI.getAppraiseById(id)
        this.setData({
            value1: res.data.doctorAllAppraise || 0,
            value2: res.data.serviceMass || 0,
            value3: res.data.serviceManner || 0,
            value3: res.data.systemUse || 0,
            inputTxt: res.data.patientOpinion || ''
        })

    },
    onChange1(event) {
        this.setData({
          value1: event.detail,
        });
      },
      onChange2(event) {
        this.setData({
          value2: event.detail,
        });
      },
      onChange3(event) {
        this.setData({
          value3: event.detail,
        });
      },
      onChange4(event) {
        this.setData({
          value4: event.detail,
        });
      },
      async   confirm(){
     
        var postData= {
            "orderId": this.data.detail.orderId,//订单id
            "doctorAllAppraise": this.data.value1,//医生总评
            "serviceMass": this.data.value2,//服务质量
            "serviceManner": this.data.value3,//服务态度          
            "systemUse": this.data.value4,//系统使用        
            "patientOpinion": this.data.inputTxt,//患者评价          
           }
           console.log(postData)
           const res = await WXAPI.doctorAppraise(postData)
           if (res.code == 0) {
             wx.showToast({
                 title: '提交成功',
                 icon: 'success',
                 duration: 1500
                 })
               setTimeout(()=>{
                   wx.navigateBack()
               },1500)
           }
       },
       goBack() {
        wx.navigateBack()
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})