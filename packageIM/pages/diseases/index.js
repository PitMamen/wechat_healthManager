const WXAPI = require('../../../static/apifm-wxapi/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex:0,
        symptomList:[],
        active: 0,
        tabs: [],
        data:"",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            userId:options.userId
        })
        this.getDiseaseKnowledge()
       
    },
    onTabsChange(e) {
        this.setData({
          active:e.detail.index
        })
     
    
      },
      CustomSymptomClickEvent(e){
        console.log(e)
        this.setData({
            activeIndex:e.currentTarget.dataset.index
        })
        this.getDiseaseKnowledgeDetail(this.data.symptomList[this.data.activeIndex])
      },
      async getDiseaseKnowledge() {
    
        var postData = {
          "userId": this.data.userId,
        }
    
        const res = await WXAPI.getDiseaseKnowledge(postData)
    
        var department=''
        if(res.data.department && res.data.department.length>0){
            res.data.department.forEach(item=>{
                department=department+' '+item
            })
        }else{
            department='暂无推荐'
        }
        this.setData({
            symptomList:res.data.disease,
            department:department
        })
        this.getDiseaseKnowledgeDetail(this.data.symptomList[0])
      },
      async getDiseaseKnowledgeDetail(diseaseName) {
    
        var postData = {
          "diseaseName": diseaseName,
        }
    
        const res = await WXAPI.getDiseaseKnowledgeDetail(postData)
        
      if(res.code === 0 && res.data && res.data.orderBy && res.data.disease_info){
          
    
        var tabs=[]
        res.data.orderBy.forEach(item=>{
            if(item.name === '概述'){
                item.content=res.data.disease_info.disDesc?res.data.disease_info.disDesc.relateContent:''
            }else if(item.name === '病因'){
                item.content=res.data.disease_info.disPathogeny?res.data.disease_info.disPathogeny.relateContent:''
            }else if(item.name === '临床表现'){
                item.content=res.data.disease_info.disClinical?res.data.disease_info.disClinical.relateContent:''
            }else if(item.name === '症状'){
                item.content=res.data.disease_info.disSymptom?res.data.disease_info.disSymptom.relateContent:''
             
            }else if(item.name === '检查'){
                item.content=res.data.disease_info.disCheck?res.data.disease_info.disCheck.relateContent:''
              
            }else if(item.name === '诊断方法与程序'){
                item.content=res.data.disease_info.disDiagnose?res.data.disease_info.disDiagnose.relateContent:''
               
            }else if(item.name === '诊断及鉴别诊断'){
                item.content=res.data.disease_info.disIdentify?res.data.disease_info.disIdentify.relateContent:''
             
            }else if(item.name === '并发症'){
                item.content=res.data.disease_info.disComplication?res.data.disease_info.disComplication.relateContent:''
            
            }else if(item.name === '预防'){
                item.content=res.data.disease_info.disPreventive?res.data.disease_info.disPreventive.relateContent:''
              
            }else if(item.name === '预后'){
                item.content=res.data.disease_info.disProg?res.data.disease_info.disProg.relateContent:''
               
            }else if(item.name === '治疗'){
                item.content=res.data.disease_info.disTreat?res.data.disease_info.disTreat.relateContent:''
              
            }else if(item.name === '饮食'){
                item.content=res.data.disease_info.disDiet?res.data.disease_info.disDiet.relateContent:''
               
            }
            if(item.content){
                tabs.push(item)
            }
        })
        this.setData({
            tabs:tabs,
        })
    }else{
        this.setData({
            tabs:[],
        })
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