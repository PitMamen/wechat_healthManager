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
        show:false,
        inputTxt:'医生回复超快，解答详细，医术高明。'
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            rightsId: options.rightsId,


        })
        this.getRightsInfo(this.data.rightsId)
       
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