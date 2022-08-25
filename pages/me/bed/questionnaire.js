// pages/histDisease/histDisease.js


Page({

  data: {
    symptom: '',
    reasonList: ['阿司匹林', '氯吡格雷', '华法林', '阿魏酸哌嗪', '双嘧达莫', '蚓激酶','丹参','红花','三七粉(田七粉)','地龙片','布洛芬缓释胶囊(芬必得)'],
    reasonResult: [],
    otherReason: '',
    selfDiseaseList: ['冠心病', '偏头痛', '高脂血症', '高血压', '糖尿病', '甲状腺功能亢进症', '无'],
    selfDiseaseResult: [],
    otherDisease: '',
    questionList:[
      {
        type:1 ,//0单选 1多选
        title:'您近期是否服用过以下抗凝药物?',
        canWrite:true,//是否可以填写答案
        limit:0,//0无限制 1 限制男 2 限制女
        answerList:[ //1代表 选择后其他的不能选
          {name:'未服用',type:1},{name:'阿司匹林'},{name:'氯吡格雷'},{name:'华法林'}
        ]
      },
     
    ]
  },
  // 单选框
  onClickSymtom(event) {
    this.setData({
      symptom: event.currentTarget.dataset.name
    })
  },
  // 导致耳鸣原因
  onChangeReason(event) {
    this.setData({
      reasonResult: event.detail
    });
  },
  toggleReason(event) {
    const { index } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
  },
  noopReason() {},
  onConfirmReason(event) {
    this.setData({
      otherReason: event.detail
    })
  },

  // 是否患有慢性疾病
  onChangeSelfDisease(event) {
    this.setData({
      selfDiseaseResult: event.detail
    });
    console.log("selfDiseaseResult="+this.data.selfDiseaseResult)
  },
  toggleSelfDisease(event) {
    console.log(event)
    const { index } = event.currentTarget.dataset;
   var type= event.currentTarget.dataset.type
   if(type==1){

   }
    const checkbox = this.selectComponent(`.checkbox-${index}`);
    checkbox.toggle();
  },
  noopSelfDisease() {},
  onConfirmDisease(event) {
    this.setData({
      otherDisease: event.detail
    })
  },

  submit() {

  }
})