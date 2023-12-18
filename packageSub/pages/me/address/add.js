const WXAPI = require('../../../../static/apifm-wxapi/index')
const Util = require('../../../../utils/util')
const Config = require('../../../../utils/config')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        options:{},
        showSetDialog:false,
        scrollTopVal: 0,
        activeNumIndex:0,
        planDetail:null,
        numsourcelist:[],
        taskDetail:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            options:options,
            activeDay:options.day || Util.formatTime2(new Date())
        })
      
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
        this.qryExecFollowPlanBaseInfo()
        this.qryMyExecFollowPlanDetailInfo()
    },
    async qryExecFollowPlanBaseInfo() {
        var postData={
            "bindId": this.data.options.bindId ,
            "planId":  this.data.options.planId,
            "userId":  this.data.options.userId,
            "regNo":this.data.options.regNo
        }
        
        const res = await WXAPI.qryExecFollowPlanBaseInfo(postData)
        
        this.setData({
            planDetail:res.data || []
        })
    
    },
    async qryMyExecFollowPlanDetailInfo() {
        var postData={
            "bindId": this.data.options.bindId,
            "planId":  this.data.options.planId,
            "userId":  this.data.options.userId,
            "regNo":this.data.options.regNo
        }
        const res = await WXAPI.qryMyExecFollowPlanDetailInfo(postData)
        var today=Util.formatTime2(new Date())
        console.log(today)
        var nowTime=new Date().getTime()
        console.log('nowTime',nowTime)
        if(res.data && res.data.length>0){
            res.data.forEach((item,index)=>{
                item.day2=item.day.slice(5)
                
                console.log(new Date(item.day).getTime())
                if(new Date(item.day).getTime() > nowTime){
                    item.text=item.details.length+'项任务'
                    item.timeType=1
                }else {
                    item.timeType=-1
                    item.text=item.statusName
                }
                if(item.day == today){
                    //今天
                    item.timeType=0
                    item.text=item.details.length+'项任务'
                   
                }
                 //如果传值中有日期  则选中到传值中的日期没有则是今天
                 if(this.data.activeDay.indexOf(item.day) > -1 ){
                    this.setData({
                        activeNumIndex:index
                    })
                }
            })
            this.setData({
                numsourcelist:res.data ,
               
            })
            this.setData({            
                taskDetail:this.data.numsourcelist[this.data.activeNumIndex]
            })
            this.setData({
                scrollTopVal: this.data.activeNumIndex * 170 / 750 * wx.getSystemInfoSync().windowWidth
            })
        }else{
            this.setData({
                numsourcelist:[],
                taskDetail:{},
                activeNumIndex:0
            })
        }
        
    
    },
    bindscroll(e) {
        // console.log(e.detail)

        this.setData({
            scrollTopVal: e.detail.scrollLeft,
        
        });


    },
    chooseAppoint(e) {
        console.log(e)
        var index = e.currentTarget.dataset.index
        var item = e.currentTarget.dataset.item
        this.setData({
            activeNumIndex: index,
            activeNumItem: item,
            
        })
        this.setData({            
            taskDetail:this.data.numsourcelist[this.data.activeNumIndex]
        })
        console.log(this.data.taskDetail)
    },
 
    onFollowTap(event) {
        const item = event.currentTarget.dataset.item
        console.log('ffffffff onFollowTap', JSON.stringify(item))

        if (item.taskType.value === 1) { //问卷
            let url = item.jumpValue + '?userId=' + item.userId + '&recordId=' + item.id + '&modifyTaskBizStatus=yes'
            if (item.taskBizStatus.value === 1) {
                url = url.replace("/r/", "/s/")
            }
            wx.navigateTo({
                url: '/pages/home/webpage/index?url=' + encodeURIComponent(url)
            })
        } else if (item.taskType.value === 2) { //文章
            wx.navigateTo({
                url: '/pages/home/news/news-detail?id=' + item.jumpId + '&recordId=' + item.id
            })
        } else if (item.taskType.value === 3) { //消息提醒 （包含所有类型）
            if (item.jumpType === '1') { //问卷
                let url = item.jumpValue + '?userId=' + item.userId + '&recordId=' + item.id + '&modifyTaskBizStatus=yes'
                if (item.taskBizStatus.value === 1) {
                    url = url.replace("/r/", "/s/")
                }
                wx.navigateTo({
                    url: '/pages/home/webpage/index?url=' + encodeURIComponent(url)
                })
            } else if (item.jumpType === '2') { //文章
                wx.navigateTo({
                    url: '/pages/home/news/news-detail?id=' + item.jumpId + '&recordId=' + item.id
                })
            }else if(item.jumpType === '3'){ //无跳转消息
                this.messageRemind(item.id)
               
            }else if (item.jumpType === '4'  ){ //外网地址
              
                wx.navigateTo({
                    url: '/pages/home/webpage/index?url=' + encodeURIComponent(item.jumpValue)
                })
               
            }else if (item.jumpType === '5' ){ //内部地址
                wx.navigateTo({
              
                    url: '/' + item.jumpValue + '?recordId=' + item.id + '&userId=' + item.userId
                })
               
            }else if (item.jumpType === '6'){ //第三方小程序
                wx.navigateToMiniProgram({
                    appId: item.jumpId,
                    path: item.jumpValue,
                    envVersion: Config.getConstantData().envVersion,
                })
             
            }
            this.setTaskItemRead(item)
        }else if (item.taskType.value === 4) {//外网地址
            console.log('ffffffff onFollowTap jumpValue', item)
         
            wx.navigateTo({
                url: '/pages/home/webpage/index?url=' + encodeURIComponent(item.jumpValue)
            })
            this.setTaskItemRead(item)
        } else if (item.taskType.value === 5) {//内部地址
            console.log('ffffffff onFollowTap jumpValue', item)
         
            wx.navigateTo({
              
                url: '/' + item.jumpValue + '?recordId=' + item.id + '&userId=' + item.userId
            })
            this.setTaskItemRead(item)
        } else if (item.taskType.value === 6) {//第三方小程序
            console.log('跳转第三方小程序')
            wx.navigateToMiniProgram({
                appId: item.jumpId,
                path: item.jumpValue,
                envVersion: Config.getConstantData().envVersion,
            })
            this.setTaskItemRead(item)
        }
    },
    //设置已读
    async  setTaskItemRead(item) {
       
       
        const res = await   WXAPI.changeFollowTaskReadStatus({recordId:item.id})
        if(item.taskType.value ===3 && item.readStatus.value === 1){
            //如果是消息提醒 且未读 则刷新页面
            this.onShow()
        }
    },

    //消息提醒
    async messageRemind(taskId){
        
            const res = await WXAPI.followhistoryDetail(taskId)
            if (res.data) {
              wx.showModal({
                title: '消息提醒',
                content: res.data.contentText,
                showCancel:false,
                confirmText:'我知道了',
                confirmColor:'#4294F7'
              })
            }
         
     
    },

    //终止服务
    onDialogConfirm(){
        WXAPI.stopFollowUserPlan({
            "bindId": this.data.options.bindId,
            "planId":  this.data.options.planId,
            "userId":  this.data.options.userId,

        }).then(res => {
            wx.showToast({
                title: '终止成功',
                icon: 'success'
            })
            setTimeout(() => {
                wx.navigateBack()
            }, 2000)
        })
    },

    onSettingClick(){
        this.setData({
            showSetDialog:true
        })
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