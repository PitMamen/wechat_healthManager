const WXAPI = require('../../../static/apifm-wxapi/index.js')
const Util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dateList:[],
        sourceList: [],
        defaultDate: '',
       
        checkedSource:null,//选择的资源
        formatter(day) {
            const month = day.date.getMonth() + 1;
            const date = day.date.getDate();
      
            if (month === 5) {
              if (date === 1) {
                day.topInfo = '劳动节';
              } else if (date === 4) {
                day.topInfo = '五四青年节';
              } else if (date === 11) {
                day.text = '今天';
              }
            }
      
            if (day.type === 'start') {
              day.bottomInfo = '入住';
            } else if (day.type === 'end') {
              day.bottomInfo = '离店';
            }
      
            return day;
          },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var minDate = new Date().getTime()
        var minDateFormat = Util.formatTime2(new Date())
        console.log(minDateFormat)
        //加10天的时间戳：  
        var maxDate = minDate + 10 * 24 * 60 * 60 * 1000;
        var maxDateFormat = Util.formatTime2(new Date(maxDate))
        console.log(maxDateFormat)
        this.setData({
            minDate: minDate,
            maxDate: maxDate,
            minDateFormat: minDateFormat,
            maxDateFormat: maxDateFormat,
            defaultDate: minDate,
            OEORowid:options.OEORowid,
            userId:options.userId
        })
        this.getBookDate()
        this.getBookResource(minDateFormat)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    //选择时间段
    onSourceItemClick(e) {
       
        var index = e.currentTarget.dataset.index
       
        this.data.sourceList.forEach((item, i) => {
            item.checked = i === index
        })
        this.setData({
            checkedSource:this.data.sourceList[index],
            sourceList: this.data.sourceList
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },
    //查询日期
    async getBookDate() {
        var postData = {
            "StartDate": this.data.minDateFormat,
            "EndDate": this.data.maxDateFormat,
            OEORowid:this.data.OEORowid

        }
        const res = await WXAPI.getBookDate(postData)
        if (res.code === 0) {
           this.setData({
               dateList:res.data
           })

        }
    },
     //查询资源
     async getBookResource(dateTime) {
        var postData = {
            "StartDate": dateTime,
            OEORowid:this.data.OEORowid

        }
        const res = await WXAPI.getBookResource(postData)
        if (res.code === 0) {
           
            this.setData({
                sourceList:res.data
            })
        }
    },
   
    dateConfirm(e){
       console.log(e.detail)
       
        var date=Util.formatTime2(new Date( e.detail))
       
        this.getBookResource( date)
    },
    confirm() {
        this.doSelfBook()
    },
        //预约 改约
        async doSelfBook() {

            var postData = {
                "PlanId": this.data.checkedSource.PlanId,
                "Date": this.data.checkedSource.Date,
                "Time": this.data.checkedSource.Time,
                OEORowid:this.data.OEORowid
    
            }
            const res = await WXAPI.doSelfBook(postData)
            if (res.code === 0) {
                res.data.userId=this.data.userId
                res.data.status=3
            
                getApp().technologyAppointInfo.appointInfo=res.data
               
                this.doConfirmBook(res.data)
            }
        },
            //确认预约
    async doConfirmBook(appointInfo) {
        var postInfo={
            OEORowid:this.data.OEORowid,
            appointInfo:appointInfo
        }

        const res = await WXAPI.doConfirmBook(postInfo)
        if (res.code === 0) {
            wx.navigateTo({
                url: './apply',
              })
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

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