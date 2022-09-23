const WXAPI = require('../../../static/apifm-wxapi/index.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        CardNo: '',//就诊卡号
        InputCardNo:'',//输入就诊卡号
        showCancelAppointmentPop: false,
        cancelBookItem:null,//取消预约的实体
        showCardNoPop:false,
        errormessage:'',
        selectTag: 0,
        reservableList: [],//可预约列表
        reservedList: [],//已预约列表
        registerList:[],//报到列表
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            defaultPatient: getApp().getDefaultPatient(),
            userInfo: wx.getStorageSync('userInfo').account,
            InputCardNo:wx.getStorageSync('CardNo')
        })
        this.setData({
            IDCardNo:this.data.defaultPatient.identificationNo
            // IDCardNo:'430626198806198013'
        })
    },
    /**
   * 生命周期函数--监听页面显示
   */
    onShow: function () {
        if(!this.data.IDCardNo){
            return
        }
        // switch (this.data.selectTag) {
        //     case 0:
        //         this.getBookExamList(1)
        //         break;
        //     case 1:
        //         this.getBookExamList(2)
        //         break;
        //     case 2:
        //         this.getRegisterList()
        //         break;
        // }
        this.getBookExamList(1)
        this.getBookExamList(2)
        this.getRegisterList()
    },
    //预约列表
    async getBookExamList(flag) {
        var postData = {
            "CardNo": this.data.CardNo,//就诊卡号
            "IDCardNo":this.data.IDCardNo,//身份证号
            "flag": flag,//1 待预约 2已预约  
        }
        const res = await WXAPI.getBookExamList(postData)
        if(res.code===0){
            if (flag === 1) {
                this.setData({
                    reservableList: res.data
                })
            } else if (flag === 2) {
                this.setData({
                    reservedList: res.data
                })
            }
        }
        
    },
    //报到列表
    async getRegisterList() {
        var postData = {
            "CardNo": this.data.CardNo,//就诊卡号
            "IDCardNo":this.data.IDCardNo,//身份证号
        }
        const res = await WXAPI.getRegisterList(postData)
        this.setData({
            registerList: res.data
        })
    },
    cardNoConfirm(){
        this.setData({
            showCardNoPop:false,
            CardNo:this.data.InputCardNo
        })
        wx.setStorageSync('CardNo', this.data.InputCardNo)
        this.onShow()
    },
    cardOnChange(){
        this.setData({
            errormessage:''
        })
    },
        //报到
        async doSelfRegister(OEORowid,appointInfo) {
            var postData = {
                "OEORowid":OEORowid,
                "appointInfo":appointInfo
               
            }
            const res = await WXAPI.doSelfRegister(postData)
            if(res.code === 0){
                this.onShow()
                wx.showToast({
                  title: '已报到',
                })
                
            }
        },
    //待预约
    tabBindtap0: function () {
        this.setData({
            selectTag: 0
        })
        if(this.data.reservableList.length===0){
            this.getBookExamList(1)
        }
       
    },
    //已预约
    tabBindtap1: function () {
        this.setData({
            selectTag: 1
        })
        if(this.data.reservedList.length===0){
            this.getBookExamList(2)
        }
    },
    //报到
    tabBindtap2: function () {
        this.setData({
            selectTag: 2
        })
        if(this.data.registerList.length===0){
            this.getRegisterList() 
        }
        
    },
    //报到
    checkInBtn(e) {
        console.log(e)
       var info= e.currentTarget.dataset.item
        var appointInfo={
            "userId": this.data.defaultPatient.userId,
            "userName": info.Name,
            "status": "8",
            "patientId": info.PatientNo,
            "appointTime": info.BookTime,     
            "appointDate": info.BookDate,     
            "appointItemName": info.StudyItem,
            "remark":  info.Address,                    
            "appointDeptName": info.Department
        }
        this.doSelfRegister(info.OEORowid,appointInfo)
    },
    cancelAppointmentPopTap(e) {
      
        this.setData({
            cancelBookItem:e.currentTarget.dataset.item
        })
        this.setData({
            showCancelAppointmentPop: true
        })
    },
    cancelAppointmentPopClose() {
        this.setData({
            showCancelAppointmentPop: false
        })
    },
    //取消预约
    cancleAppointment() {
        this.setData({
            showCancelAppointmentPop: false
        })
        this.doCancelBook()
    },
       //取消预约接口
       async  doCancelBook() {
      
      
        var appointInfo={
            "userId": this.data.defaultPatient.userId,
            "userName": this.data.cancelBookItem.Name,
            "status": "6",
            "patientId": this.data.cancelBookItem.PatientNo,
            "appointTime": this.data.cancelBookItem.BookTime,     
            "appointDate": this.data.cancelBookItem.BookDate,     
            "appointItemName": this.data.cancelBookItem.StudyItem,
            "remark":  this.data.cancelBookItem.Address,                    
            "appointDeptName": this.data.cancelBookItem.Department
        }
        var postData = {
            "OEORowid":this.data.cancelBookItem.OEORowid,
            "appointInfo":appointInfo
           
        }
      
        const res = await WXAPI.doCancelBook(postData)
        if(res.code === 0){
           this.onShow()
            wx.showToast({
              title: '已取消',
            })
            
        }
    },
    //预约
    toApply(e) {
        var item= e.currentTarget.dataset.item
        item.CardNo=this.data.CardNo
        item.IDCardNo=this.data.IDCardNo
        getApp().technologyAppointInfo={
            bookExam:'',//可预约信息
            appointInfo:''//预约或者改约信息
        }
       getApp().technologyAppointInfo.bookExam=item
        wx.navigateTo({
            url: './source?OEORowid='+item.OEORowid+'&userId='+this.data.defaultPatient.userId,
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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