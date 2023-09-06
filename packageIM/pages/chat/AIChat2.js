// pages/list/list.js
import TIM from 'tim-wx-sdk';
const WXAPI = require('../../../static/apifm-wxapi/index')
const IMUtil = require('../../../utils/IMUtil')
Page({
    onMessageReceived: '',
    data: {
        showChatInput: true,
        inputType: 'none',//输入框类型

        isAIEnd: false,
        chooseSymptom: [],//选择的病症
        type: '',
        config: {},
        toUserID: '',//聊天对象ID 或者群ID
        conversationID: '',//聊天会话ID

        DocType: '',//Doctor医生  CaseManager个案管理师
        userProfile: {},//聊天对象信息
        groupProfile: {},//群信息

        ai_patientId: '',//AI问诊选择的就诊人ID
        ai_question: '',//AI问诊需要输入的问题暂存
        textMessage: '',
        chatItems: [],//消息列表
        nextReqMessageID: '',//用于续拉，分页续拉时需传入该字段。
        isCompleted: '',//表示是否已经拉完所有消息。
        latestPlayVoicePath: '',
        scrollTopVal: '',
        pageHeight: '',
        currentPlayItem: {},
        chatStatue: '',
        extraArr: [],
        knowledgeType: '',
        patientList: [],
        topArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options)
        var config = {
            sdkAppID: getApp().globalData.sdkAppID,
            userID: getApp().globalData.IMuserID,
            userSig: getApp().globalData.IMuserSig,
        }
        this.setData({
            config: config
        })

       
        //统一用微信账号的头像
        var myAvatarUrl = wx.getStorageSync('userInfo').account.avatarUrl
        this.setData({
            pageHeight: wx.getSystemInfoSync().windowHeight,
            type: 'C2C',
            DocType: 'AIDOCTOR',
            defaultPatient: getApp().getDefaultPatient(),
            toUserID: '1',
            conversationID: 'C2C1',
            myAvatarUrl: myAvatarUrl,

        })

        console.log("pageHeight=" + this.data.pageHeight)

        this.swithcToUserType()
        this.getServicerAccount()



    },
    onShow: function (e) {
        this.setData({
            patientList: getApp().getPatientInfoList()
        })
    },





    onReady() {
        this.chatInput = this.selectComponent('#chatInput');
    },



    //获取个案管理师
    async getServicerAccount() {


        const res = await WXAPI.getServicerAccount()
        this.setData({
            CaseManagerID: res.data.userId
        })
    },

    //结束问诊
    endAIchat() {
        wx.showToast({
            title: '结束问诊',
        })
        this.onGetCustomTypeMarkType_local('智慧自诊结束')
        this.data.topArr.forEach(item => {

            item.active = false

        })
        this.setData({
            isAIEnd: true,
            chooseSymptom: [],
            ai_patientId: '',
            showChatInput: false,
            inputType: 'text',
            topArr: this.data.topArr
        })

        this.updateChatStatus('', 'AIDOCTOR_END');
    },

    //图预览
    imageClickEvent(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url, // 当前显示图片的http链接
            urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
        })
    },
    //切换咨询类型
    swithcToUserType() {

        if (this.data.DocType == 'JZDH') {//就诊导航

            wx.setNavigationBarTitle({
                title: '就诊导航'
            });
            this.updateChatStatus('', 'JZDH');
            this.qrySysKnowledge('JZDH')
        } else if (this.data.DocType == 'FWZX') {//服务咨询
            wx.setNavigationBarTitle({
                title: '服务咨询'
            });
            this.updateChatStatus('', 'FWZX');
            this.qrySysKnowledge('FWZX')
        } else if (this.data.DocType == 'AIDOCTOR') {//智能问诊
            this.setData({
                chatItems: [],
                isAIEnd: false,
                chooseSymptom: [],
                ai_patientId: ''
            })

            wx.setNavigationBarTitle({
                title: '智能问诊'
            });
            this.updateChatStatus('', 'AIDOCTOR');


            this.getHotSymptom()

        } else if (this.data.DocType == 'CaseManager') {//人工
            if (this.data.CaseManagerID) {

                IMUtil.goIMChat(this.data.defaultPatient.userId, this.data.defaultPatient.userSig, 'redirectTo', this.data.CaseManagerID, 'CaseManager', '', '', '')
            } else {
                this.getServicerAccount()
                wx.showToast({
                    icon: 'none',
                    title: '转人工失败，请重试',
                })
            }
        }
    },
    //点击输入框上方按钮
    heathItemClickEvent(e) {
        console.log(e)
        const id = e.detail.item.id;

        if (this.data.DocType === id && (this.data.DocType === 'FWZX' || this.data.DocType === 'JZDH')) {
            return
        }

        if (this.data.DocType === id && this.data.DocType === 'AIDOCTOR' && !this.data.isAIEnd) {
            return
        }

        this.setData({
            DocType: id
        })
        this.data.topArr.forEach(item => {

            item.active = item.id === id

        })
        this.setData({
            topArr: this.data.topArr,

        })
        this.swithcToUserType()

    },
    //点击查看所有问题
    goKnowledgePage(e) {
        wx.navigateTo({
            url: '../diseases/knowledge-list?knowledgeType=' + this.data.DocType,
        })
    },




    //点击选择就诊人
    CustomPatiemtClickEvent(e) {
        if (this.data.isAIEnd) {
            return
        }
        if (this.data.ai_patientId) {
            return
        }
        var patient = e.currentTarget.dataset.content
        this.onGetMessageEvent_local('out', patient.userName)
        this.setData({
            ai_patientId: patient.userId
        })
        this.setData({
            chatItems: this.data.chatItems
        })


        var answer = [{
            "optionValue": this.data.chooseSymptom,
            "optionKind": "symptoms"
        }]
        this.qryAI(answer)
    },
    //点击增加就诊人
    CustomPatiemtAddClickEvent(e) {
        this.setData({
            fromAddPatient: true
        })
        wx.navigateTo({
            url: '/packageSub/pages/me/patients/addPatient',
        })
    },
    //点击热门病症
    CustomSymptomClickEvent(e) {
        if (this.data.isAIEnd) {
            return
        }
        if (this.data.chooseSymptom.length > 0) {
            return
        }
        var symptom = e.currentTarget.dataset.content
        this.setData({
            chooseSymptom: [symptom]
        })
        this.onGetMessageEvent_local('out', symptom)
        const questionData = {
            patientList: getApp().getPatientInfoList(),
            "question": {
                "optionType": "ChoosePatient"
            },
            "isEnd": false
        }

        this.onGetCustomAIDoctorTypeMessageEvent(questionData)
    },
    //获取热门病症
    getHotSymptom() {
        WXAPI.getHotSymptom({}).then(res => {
            if (res.code === 0) {
                const questionData2 = {
                    symptomList: res.data,
                    text: '您好，请描述清楚你要咨询的健康问题（疾病名/症状/用药情况/患病时长等）',
                    "question": {
                        "optionType": "ChooseSymptom"
                    },
                    "isEnd": false
                }

                this.onGetCustomAIDoctorTypeMessageEvent(questionData2)
            }
        }).catch(e => {
            wx.showToast({
                icon: 'none',
                title: '请求失败，请检查网络',
            })
        })





    },
    //输入病症 调用分词接口
    submitHotSymptom(text) {
        var post = {
            text: text,
            flag: 2
        }
        WXAPI.submitHotSymptom(post).then(res => {
            if (res.code === 0) {
                if (res.data.length === 0) {
                    this.onGetMessageEvent_local('in', '请更换下病情描述试试？')
                } else {
                    var sym = []
                    res.data.forEach(item => {
                        sym.push(item.entity)
                    })
                    this.setData({
                        chooseSymptom: sym
                    })
                    const questionData = {
                        patientList: getApp().getPatientInfoList(),
                        "question": {
                            "optionType": "ChoosePatient"
                        },
                        "isEnd": false
                    }

                    this.onGetCustomAIDoctorTypeMessageEvent(questionData)
                }
            }
        }).catch(e => {
            wx.showToast({
                icon: 'none',
                title: '请求失败，请检查网络',
            })
        })





    },
    //获取AI智能问诊问题
    qryAI(answer) {
        if (this.data.isAIEnd) {
            return
        }
        var postData = {
            "answer": answer,
            "userId": this.data.ai_patientId
        }
        console.log(postData)
        WXAPI.getIntelligenceQuestion(postData).then(res => {
            if (res.code !== 0) {
                this.onGetMessageEvent_local('in', '根据您的描述，未找到相似结果，本次智能问诊结束。')
                this.endAIchat()
                return
            }
            if (res.data.question.optionType === 'INT' || res.data.question.optionType === 'TEXT') {
                this.setData({
                    ai_question: res.data.question
                })
            }

            if (res.data.isEnd) {
                if (res.data.diseaseKnowledge) {
                    //疾病知识
                    this.onGetCustomTypeDiseaseKnowledgeEvent_local(res.data.diseaseKnowledge, res.data.department)
                }

                this.onGetMessageEvent_local('in', '根据您的描述，与如下疾病表现较为相似，本信息仅供参考，建议您还是听具体医生的建议。')
            }

            this.onGetCustomAIDoctorTypeMessageEvent(res.data)
            if (res.data.isEnd) {
                this.endAIchat()
            }
        }).catch(e => {
            wx.showToast({
                icon: 'none',
                title: '请求失败，请检查网络',
            })
        })

    },

    //AI问答选择答案
    bindSelectQestionTap(e) {

        if (this.data.isAIEnd) {
            return
        }

        var question = e.currentTarget.dataset.question
        var option = e.currentTarget.dataset.option
        var optionvalue = e.currentTarget.dataset.optionvalue
        var length = e.currentTarget.dataset.length
        // console.log("question", question)
        // console.log("option", option)
        // console.log("optionvalue", optionvalue)
        // console.log("length", length)





        var lastItem = this.data.chatItems[this.data.chatItems.length - 1]
        var answer = lastItem.payload.data.answer
        if (!answer) {
            answer = []
        }

        if (question.optionType == 'MULTIQUESTION_SINGLE') {//多问题单答案
            option.optionValue = [optionvalue]
            question.options = [option]
            answer = [question]
        } else if (question.optionType == 'MULTIQUESTION_MULTI') {//多问题多答案
            option.optionValue = [optionvalue]
            question.options = [option]
            if (answer.length === 0) {
                answer = [question]
            } else {
                var hasOption = false
                answer[0].options.forEach((item, index) => {
                    if (item.title === option.title) {
                        if (option.optionType == 'SINGLEQUESTION_SINGLE') {
                            //如果子问题是单答案 直接替换
                            item.optionValue = option.optionValue
                        } else if (option.optionType == 'SINGLEQUESTION_MULTI') {
                            //如果子问题是多答案 添加
                            if (optionvalue === '以上都不是') {
                                item.optionValue = option.optionValue
                            } else {
                                var cIndex= item.optionValue.indexOf(optionvalue)
                                if ( cIndex< 0) {
                                    if (item.optionValue.indexOf('以上都不是') > -1) {
                                        item.optionValue = []
                                    }
                                    item.optionValue.push(optionvalue)
                                }else{
                                    item.optionValue.splice(cIndex,1)
                                }
                            }

                        }

                        hasOption = true
                    }
                })
                if (!hasOption) {
                    answer[0].options.push(option)
                }
            }

        } else if (question.optionType == 'SINGLEQUESTION_SINGLE') {//单问题单答案

            question.optionValue = [optionvalue]
            answer = [question]

        } else if (question.optionType == 'SINGLEQUESTION_MULTI') {//单问题多答案
            question.optionValue = [optionvalue]
            if (answer.length === 0 || optionvalue === '以上都不是') {
                answer = [question]
            } else {
               var cIndex= answer[0].optionValue.indexOf(optionvalue)
                if ( cIndex< 0) {
                    if (answer[0].optionValue.indexOf('以上都不是') > -1) {
                        answer[0].optionValue = []
                    }
                    answer[0].optionValue.push(optionvalue)

                }else {
                    answer[0].optionValue.splice(cIndex,1)
                }
            }



        }


        

        //如果只有一个问题 并且该问题是单选则直接下一步 不用点击确定
        if (length === 1 && option.optionType == 'SINGLEQUESTION_SINGLE') {
              //去掉选项 只留标题-------
              var lastItem = this.data.chatItems[this.data.chatItems.length - 1]
              console.log("lastItem", lastItem)
              if (lastItem.payload.data.question.options) {
                  lastItem.payload.data.question.options = []
              }
              if (lastItem.payload.data.question.optionValue) {
                  lastItem.payload.data.question.optionValue = []
              }
              this.setData({
                  chatItems: this.data.chatItems
              })
              //去掉选项 只留标题-------
            this.onGetMessageEvent_local('out', optionvalue)
            this.qryAI(answer)

        }else {
            lastItem.payload.data.answer = answer
            
            this.setData({
                chatItems: this.data.chatItems
            })
        }
    },
    //AI问答点击确定
    AIConfirm(e) {
        if (this.data.isAIEnd) {
            return
        }
        var answer = e.currentTarget.dataset.answer
        var index = e.currentTarget.dataset.index

        if (index === this.data.chatItems.length - 1) {
            // console.log(index,answer)
            var answerText = ''
            answer[0].options.forEach(item => {
                var value = ''
                if (item.optionValue.length === 1) {
                    value = item.optionValue[0]
                } else {
                    item.optionValue.forEach(valueItem => {
                        var inText = value ? '、' : ''

                        value = value + inText + valueItem
                    })
                }

                answerText = answerText + item.optionName + '：' + value + '\n'
            })

            //去掉选项 只留标题-------
            var lastItem = this.data.chatItems[this.data.chatItems.length - 1]
            console.log("lastItem", lastItem)
            if (lastItem.payload.data.question.options) {
                lastItem.payload.data.question.options = []
            }
            if (lastItem.payload.data.question.optionValue) {
                lastItem.payload.data.question.optionValue = []
            }
            lastItem.payload.data.isAnswered=true
            this.setData({
                chatItems: this.data.chatItems
            })
            //去掉选项 只留标题-------


            this.onGetMessageEvent_local('out', answerText)
            this.qryAI(answer)


        }


    },
    goDiseasePage(e) {
        console.log(e)
        wx.navigateTo({
            url: '../diseases/index?userId=' + e.currentTarget.dataset.userid,
        })
    },
    //点击咨询问题
    CustomQuestionMessageClickEvent(e) {
        var knowledgeItem = e.currentTarget.dataset.content
        this.onGetMessageEvent_local('out', knowledgeItem.title)
        if (knowledgeItem.remark === '1') {
            //富文本类型
            wx.navigateTo({
                url: '../diseases/content?id=' + knowledgeItem.id,
            })
        } else {
            // this.getSysKnowledgeById(content.id)
            this.onGetMessageEvent_local('in', knowledgeItem.content)
        }



    },

    //查询热门问题列表
    async qrySysKnowledge(knowledgeType) {
        var postData = {
            "knowledgeType": knowledgeType,
            "keyWord": "",
            "pageNo": 1,
            "pageSize": 5
        }
        console.log(postData)
        const res = await WXAPI.qrySysKnowledge(postData)
        const des = "让小医来猜一猜，您有什么想要了解的？请输入关键字问小医。您也可以点击下方热门问题获取答案："
        this.onGetCustomTypeMessageEvent_local(knowledgeType, res.data.rows, des, true)
    },

    //按关键字查询问题答案列表
    async qrySysKnowledgeAnswer(knowledgeType, keyWord) {
        var postData = {
            "knowledgeType": knowledgeType,
            "keyWord": keyWord,
        }

        const res = await WXAPI.qrySysKnowledgeAnswer(postData)
        if (res.data && res.data.length > 0) {
            //显示问题标题
            const des = "您问的是否是以下问题，点击对应问题获取答案："
            this.onGetCustomTypeMessageEvent_local(knowledgeType, res.data, des, false)
            // if (res.data.length === 1) {
            //     //直接显示答案
            //    var knowledgeItem= res.data[0]
            //     if(knowledgeItem.remark === '1'){
            //         //富文本类型
            //         wx.navigateTo({
            //             url: '../diseases/content?id='+knowledgeItem.id,
            //           })
            //     }else{

            //         this.onGetMessageEvent_local('in',  knowledgeItem.title + '\n' + knowledgeItem.content)
            //     }
            // } 

        } else {
            this.onGetMessageEvent_local('in', '抱歉，暂时没有找到答案。您也可以点击右下角人工来进行人工咨询。')
        }

    },
    //查询问题答案详情
    async getSysKnowledgeById(id) {
        const res = await WXAPI.getSysKnowledgeById(id)
        if (res.data && res.data.content) {
            this.onGetMessageEvent_local('in', res.data.content)
        } else {
            this.onGetMessageEvent_local('in', '抱歉，暂时没有找到答案。您也可以点击右下角人工来进行人工咨询。')
        }

    },

    //模拟收到文本消息和发送文字消息
    onGetMessageEvent_local(flow, content) {

        // 发送文本消息，Web 端与小程序端相同
        // 1. 创建消息实例，接口返回的实例可以上屏
        console.log(content)
        let message = getApp().tim.createTextMessage({
            to: String(this.data.defaultPatient.userId),
            conversationType: this.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
            payload: {
                text: content
            },
        });
        message.flow = flow
        message.avatar = flow === 'in' ? '/image/ai_icon.png' : '',
            console.log(message)
        var index = this.setOneItemAndScrollPage(message)
        this.updateChatItemStatus(index, "success")
    },

    /**
     * 模拟收到咨询问题列表
     * @param {*} customType 类型
     * @param {*} qlist 问题列表
     * @param {*} description 描述
     * @param {*} isHotList 是否是热门问题推荐列表
     */
    async onGetCustomTypeMessageEvent_local(customType, qlist, description, isHotList) {

        let message = getApp().tim.createCustomMessage({
            to: String(this.data.defaultPatient.userId),
            type: "TIMCustomElem",
            avatar: '/image/ai_icon.png',
            conversationType: TIM.TYPES.CONV_C2C,
            payload: {
                data: ''

            },
        });
        message.flow = 'in'
        message.avatar = '/image/ai_icon.png',
            message.payload = {
                customType: customType,
                isHotList: isHotList,
                data: {
                    qlist: qlist,
                    description: description,
                    type: customType
                }
            }
        console.log(message)
        var index = this.setOneItemAndScrollPage(message)
        this.updateChatItemStatus(index, "success")
    },
    /**
 * 模拟收到疾病知识
 * @param {*} diseaseKnowledge 疾病
 * @param {*} departmentArr 推荐科室 数组
 */
    async onGetCustomTypeDiseaseKnowledgeEvent_local(diseaseKnowledge, departmentArr) {
        var department = ''
        if (departmentArr && departmentArr.length > 0) {
            departmentArr.forEach(item => {
                department = department + ' ' + item
            })
        } else {
            department = '暂无推荐'
        }

        let message = getApp().tim.createCustomMessage({
            to: String(this.data.defaultPatient.userId),
            type: "TIMCustomElem",
            avatar: '/image/ai_icon.png',
            conversationType: TIM.TYPES.CONV_C2C,
            payload: {
                data: ''

            },
        });
        message.flow = 'in'
        message.avatar = '/image/ai_icon.png',
            message.payload = {
                customType: 'DISEASE_KNOWLEDGE',
                data: {
                    diseaseKnowledge: diseaseKnowledge,
                    department: department,
                    userId: this.data.ai_patientId,
                    description: '',
                    type: 'DISEASE_KNOWLEDGE'
                }
            }
        console.log(message)
        var index = this.setOneItemAndScrollPage(message)
        this.updateChatItemStatus(index, "success")
    },
    /**
    * 模拟收到智能问诊消息
    */
    async onGetCustomAIDoctorTypeMessageEvent(questionData) {

        let message = getApp().tim.createCustomMessage({
            to: String(this.data.defaultPatient.userId),
            type: "TIMCustomElem",
            conversationType: TIM.TYPES.CONV_C2C,
            payload: {
                data: ''

            },
        });
        message.flow = 'in'
        message.avatar = '/image/ai_icon.png',
            message.payload = {
                customType: 'AIDOCTOR',
                data: questionData
            }

        var index = this.setOneItemAndScrollPage(message)
        this.updateChatItemStatus(index, "success")
        switch (questionData.question.optionType) {
            case 'ChoosePatient'://选择就诊人
                this.setData({
                    showChatInput: false,
                    inputType: 'text'
                })
                break;
            case 'MULTIQUESTION_SINGLE'://多问题单选项(所有问题只选一个)
                this.setData({
                    showChatInput: false,
                    inputType: 'text'
                })
                break;
            case 'MULTIQUESTION_MULTI'://多问题多选项（每个问题只选一个）
                this.setData({
                    showChatInput: false,
                    inputType: 'text'
                })
                break;
            case 'SINGLEQUESTION_SINGLE'://单问题单选项
                this.setData({
                    showChatInput: false,
                    inputType: 'text'
                })
                break;
            case 'SINGLEQUESTION_MULTI'://单问题多选项
                this.setData({
                    showChatInput: false,
                    inputType: 'text'
                })
                break;
            case 'INT'://数字
                console.log(this.data.topArr)
                this.setData({
                    showChatInput: true,
                    inputType: 'number'
                })
                break;
            case 'TEXT'://文本
                this.setData({
                    showChatInput: true,
                    inputType: 'text'
                })
                break;
            default:
                this.setData({
                    showChatInput: true,
                    inputType: 'none'
                })
        }
    },
    /**
 * 模拟收到标记
 */
    async onGetCustomTypeMarkType_local(content) {

        let message = getApp().tim.createCustomMessage({
            to: String(this.data.defaultPatient.userId),
            type: "TIMCustomElem",
            avatar: '/image/ai_icon.png',
            conversationType: TIM.TYPES.CONV_C2C,
            payload: {
                data: ''

            },
        });
        message.flow = 'in'
        message.avatar = '/image/ai_icon.png',
            message.payload = {
                customType: "TIMCustomMarkTYPE",
                data: {
                    content: content,
                    description: '',
                    type: "TIMCustomMarkTYPE"
                }
            }
        console.log(message)
        var index = this.setOneItemAndScrollPage(message)
        this.updateChatItemStatus(index, "success")
    },
    /**
     * 点击extra按钮时触发
     * @param e
     */
    onExtraClickEvent(e) {
        console.log(e);
    },
    //发生文本消息
    onSendMessageEvent(e) {
        let content = e.detail.value;
        // 发送文本消息，Web 端与小程序端相同
        // 1. 创建消息实例，接口返回的实例可以上屏

        let message = getApp().tim.createTextMessage({
            to: this.data.toUserID,
            conversationType: this.data.type == 'C2C' ? TIM.TYPES.CONV_C2C : TIM.TYPES.CONV_GROUP,
            payload: {
                text: content
            },
        });
        this.sendMsg(message)

    },

    // 展示消息时间
    messageTimeForShow(messageTime) {
        const interval = 5 * 60;
        const nowTime = messageTime.time;
        if (this.data.chatItems && this.data.chatItems.length > 0) {
            const lastTime = this.data.chatItems.slice(-1)[0].time;

            Object.assign(messageTime, {
                isShowTime: nowTime - lastTime > interval,
            })
        } else {
            Object.assign(messageTime, {
                isShowTime: true,
            })
        }

    },



    resetInputStatus() {
        this.chatInput.closeExtraView();
    },

    onUnload() {

    },


    /**
     * 发送消息
     */
    async sendMsg(message) {
        let that = this
        console.log("sendMessage", message)

        if (this.data.DocType === 'AIDOCTOR' && this.data.isAIEnd) {//智能问诊
            wx.showToast({
                icon: 'none',
                title: 'AI问诊已结束',
            })
            return
        }

        var index = this.setOneItemAndScrollPage(message)
        this.updateChatItemStatus(index, "success")
        //就诊导航 服务咨询 模拟上屏 用接口查询答案
        if (this.data.DocType === 'JZDH' || this.data.DocType === 'FWZX') {

            if (message.type === 'TIMTextElem') {
                this.qrySysKnowledgeAnswer(this.data.DocType, message.payload.text)
            } else {
                this.onGetMessageEvent_local('in', '抱歉，暂时没有找到答案。您也可以点击右下角人工来进行人工咨询。')
            }

            return
        } else if (this.data.DocType === 'AIDOCTOR') {//智能问诊

            //有症状了则走问题回答 没有则去查询症状分词
            if (this.data.chooseSymptom.length > 0) {
                var answer = this.data.ai_question
                answer.optionValue = message.payload.text
                this.qryAI([answer])
            } else {
                this.submitHotSymptom(message.payload.text)
            }

        }

    },
    /**
     * 重发消息
     * @param e
     */
    async resendMsgEvent(e) {
        let that = this
        const index = parseInt(e.currentTarget.dataset.resendIndex);
        const item = this.data.chatItems[index];

        that.updateChatItemStatus(index, "unSend")

        // 重发消息
        let promise = getApp().tim.resendMessage(item); // 传入需要重发的消息实例
        promise.then(function (imResponse) {
            // 重发成功
            console.log(imResponse);
            that.updateChatItemStatus(index, "success")
        }).catch(function (imError) {
            // 重发失败
            console.warn('resendMessage error:', imError);
            that.updateChatItemStatus(index, "fail")
            wx.showToast({
                title: imError.message,
                icon: 'error',
                duration: 2000
            })
        });
    },


    //更新消息状态
    updateChatItemStatus(index, status) {

        this.data.chatItems[index].status = status;
        this.setData({
            chatItems: this.data.chatItems
        })

    },

    //添加多个消息在尾部 刷新列表并滚动到底部
    setMultItemAndScrollPage(newItems, isIMReceived = false) {
        let that = this
        newItems.forEach(function (item, index) {
            //计算是否显示时间
            that.messageTimeForShow(item)
            if (item.type == "TIMCustomElem") {

                item = that.getInfoFromCallMessage(item, isIMReceived)
            }


        })

        if (this.data.chatItems.length > 0) {
            const mergeChatList = this.data.chatItems.concat(newItems)
            this.setData({
                chatItems: mergeChatList,
            });

        } else {
            this.setData({
                chatItems: newItems,
            });
        }

        this.setData({
            scrollTopVal: this.data.chatItems.length * 999,
        });
    },
    //添加单个个消息在尾部 刷新列表并滚动到底部
    setOneItemAndScrollPage(newItem) {
        //计算是否显示时间
        this.messageTimeForShow(newItem)

        var length = this.data.chatItems.push(newItem)

        this.setData({
            chatItems: this.data.chatItems,
        });
        this.setData({
            scrollTopVal: this.data.chatItems.length * 999,
        });

        return length - 1;
    },
    //聊天状态
    updateChatStatus(content, state) {
        this.setData({
            chatStatue: state,
            chatStatusContent: content
        })
    },

    getInfoFromCallMessage(item, isIMReceived = false) {
        try {
            console.log(item.payload.data)
            var signalingData = JSON.parse(item.payload.data)


            var type = signalingData.type
            if (type) {//自己业务的自定义消息
                if (type == 'CustomAnalyseMessage') {//评估消息
                    item.payload.customType = "CustomAnalyseMessage"

                } else if (type == 'CustomHealthManageMessage') {//购买服务
                    item.payload.customType = "CustomHealthManageMessage"

                } else if (type == 'CustomHealthMessage') {//健康消息
                    item.payload.customType = "CustomHealthMessage"

                } else if (type == 'CustomUploadMessage') {//上传资料
                    item.payload.customType = "CustomUploadMessage"

                } else if (type == 'CustomVideoCallMessage') {//视频看诊
                    item.payload.customType = "CustomVideoCallMessage"
                    item.payload.isIMReceived = isIMReceived

                } else if (type == 'CustomCaseHistoryMessage') {//就诊病历
                    item.payload.customType = "CustomCaseHistoryMessage"

                } else if (type == 'CustomWenJuanMessage') {//问卷调查
                    item.payload.customType = "CustomWenJuanMessage"
                } else if (type == 'CustomArticleMessage') {//疾病知识
                    item.payload.customType = "CustomArticleMessage"
                }
                item.payload.data = signalingData
            } else {//解析其他消息 比如视频语音通话
                item.payload.description = "[自定义消息]"
            }



        } catch (error) {
            console.error(error)
            item.payload.description = "[自定义消息]"
        }
        return item

    },




    checkDeviceAuthorize() {
        this.hasOpenDeviceAuthorizeModal = false
        return new Promise((resolve, reject) => {
            if (!wx.getSetting || !wx.getSetting()) {
                // 微信测试版 获取授权API异常，目前只能即使没授权也可以通过
                resolve()
            }
            wx.getSetting().then((result) => {
                console.log('getSetting', result)
                this.authorizeMic = result.authSetting['scope.record']
                this.authorizeCamera = result.authSetting['scope.camera']
                if (result.authSetting['scope.camera'] && result.authSetting['scope.record']) {
                    // 授权成功
                    resolve()
                } else {
                    // 没有授权，弹出授权窗口
                    // 注意： wx.authorize 只有首次调用会弹框，之后调用只返回结果，如果没有授权需要自行弹框提示处理
                    console.log('getSetting 没有授权，弹出授权窗口', result)
                    wx.authorize({
                        scope: 'scope.record',
                    }).then((res) => {
                        console.log('authorize mic', res)
                        this.authorizeMic = true
                        if (this.authorizeCamera) {
                            resolve()
                        }
                    })
                        .catch((error) => {
                            console.log('authorize mic error', error)
                            this.authorizeMic = false
                        })
                    wx.authorize({
                        scope: 'scope.camera',
                    }).then((res) => {
                        console.log('authorize camera', res)
                        this.authorizeCamera = true
                        if (this.authorizeMic) {
                            resolve()
                        } else {
                            this.openConfirm()
                            reject(new Error('authorize fail'))
                        }
                    })
                        .catch((error) => {
                            console.log('authorize camera error', error)
                            this.authorizeCamera = false
                            this.openConfirm()
                            reject(new Error('authorize fail'))
                        })
                }
            })
        })
    },
    openConfirm() {
        if (this.hasOpenDeviceAuthorizeModal) {
            return
        }
        this.hasOpenDeviceAuthorizeModal = true
        return wx.showModal({
            content: '您没有打开麦克风和摄像头的权限，是否去设置打开？',
            confirmText: '确认',
            cancelText: '取消',
            success: (res) => {
                this.hasOpenDeviceAuthorizeModal = false
                console.log(res)
                // 点击“确认”时打开设置页面
                if (res.confirm) {
                    console.log('用户点击确认')
                    wx.openSetting({
                        success: (res) => { },
                    })
                } else {
                    console.log('用户点击取消')
                }
            },
        })
    },

});
