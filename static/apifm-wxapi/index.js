const Config = require('../../utils/config')
module.exports =
    /******/
    (function (modules) { // webpackBootstrap
        /******/ // The module cache
        /******/
        var installedModules = {};
        /******/
        /******/ // The require function
        /******/
        function __webpack_require__(moduleId) {
            /******/
            /******/ // Check if module is in cache
            /******/
            if (installedModules[moduleId]) {
                /******/
                return installedModules[moduleId].exports;
                /******/
            }
            /******/ // Create a new module (and put it into the cache)
            /******/
            var module = installedModules[moduleId] = {
                /******/
                i: moduleId,
                /******/
                l: false,
                /******/
                exports: {}
                /******/
            };
            /******/
            /******/ // Execute the module function
            /******/
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/ // Flag the module as loaded
            /******/
            module.l = true;
            /******/
            /******/ // Return the exports of the module
            /******/
            return module.exports;
            /******/
        }
        /******/
        /******/
        /******/ // expose the modules object (__webpack_modules__)
        /******/
        __webpack_require__.m = modules;
        /******/
        /******/ // expose the module cache
        /******/
        __webpack_require__.c = installedModules;
        /******/
        /******/ // define getter function for harmony exports
        /******/
        __webpack_require__.d = function (exports, name, getter) {
            /******/
            if (!__webpack_require__.o(exports, name)) {
                /******/
                Object.defineProperty(exports, name, {
                    enumerable: true,
                    get: getter
                });
                /******/
            }
            /******/
        };
        /******/
        /******/ // define __esModule on exports
        /******/
        __webpack_require__.r = function (exports) {
            /******/
            if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                /******/
                Object.defineProperty(exports, Symbol.toStringTag, {
                    value: 'Module'
                });
                /******/
            }
            /******/
            Object.defineProperty(exports, '__esModule', {
                value: true
            });
            /******/
        };
        /******/
        /******/ // create a fake namespace object
        /******/ // mode & 1: value is a module id, require it
        /******/ // mode & 2: merge all properties of value into the ns
        /******/ // mode & 4: return value when already ns object
        /******/ // mode & 8|1: behave like require
        /******/
        __webpack_require__.t = function (value, mode) {
            /******/
            if (mode & 1) value = __webpack_require__(value);
            /******/
            if (mode & 8) return value;
            /******/
            if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
            /******/
            var ns = Object.create(null);
            /******/
            __webpack_require__.r(ns);
            /******/
            Object.defineProperty(ns, 'default', {
                enumerable: true,
                value: value
            });
            /******/
            if (mode & 2 && typeof value != 'string')
                for (var key in value) __webpack_require__.d(ns, key, function (key) {
                    return value[key];
                }.bind(null, key));
            /******/
            return ns;
            /******/
        };
        /******/
        /******/ // getDefaultExport function for compatibility with non-harmony modules
        /******/
        __webpack_require__.n = function (module) {
            /******/
            var getter = module && module.__esModule ?
                /******/
                function getDefault() {
                    return module['default'];
                } :
                /******/
                function getModuleExports() {
                    return module;
                };
            /******/
            __webpack_require__.d(getter, 'a', getter);
            /******/
            return getter;
            /******/
        };
        /******/
        /******/ // Object.prototype.hasOwnProperty.call
        /******/
        __webpack_require__.o = function (object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        };
        /******/
        /******/ // __webpack_public_path__
        /******/
        __webpack_require__.p = "";
        /******/
        /******/
        /******/ // Load entry module and return exports
        /******/
        return __webpack_require__(__webpack_require__.s = 0);
        /******/
    })
        /************************************************************************/
        /******/
        ([
            /* 0 */
            /***/
            (function (module, exports, __webpack_require__) {

                "use strict";


                /* eslint-disable */
                // 小程序开发api接口工具包

                var API_BASE_URL = '';

                if (Config.ProgramEnvVersion === 'develop') {//开发版

                    // API_BASE_URL = 'https://develop.mclouds.org.cn';//外网测试环境
                    API_BASE_URL = 'http://develop.mclouds.org.cn:8009';//外网测试环境

                } else if (Config.ProgramEnvVersion === 'trial') {//演示版

                    API_BASE_URL = 'https://ys.mclouds.org.cn';//外网演示环境

                } else if (Config.ProgramEnvVersion === 'release') {//正式版

                    API_BASE_URL = 'https://hmg.mclouds.org.cn';//正式环境

                }



                var ACCOUNT_SERVICE = '/account-api';
                // var ACCOUNT_SERVICE = '';
                var HEALTH_SERVICE = '/health-api';
                var ORDER_SERVICE = '/order-api';
                var CONTENT_SERVICE = '/content-api';
                var EDIT_SERVICE = '/bone-api';
                var MANAGER_SERVICE = '/manager-api';
                var QUESTION_SERVICE = '/questionnaire-api';
                var PUSH_SERVICE = '/push-api';
                var INFO_SERVICE = '/info-api';
                var IM_SERVICE = '/im-api';
                var UAM_SERVICE = '/uam-api';
                var MEDICAL_SERVICE = '/medical-api';
                var FOLLOW_SERVICE = '/follow-api';
                var UAM_SERVICE = '/uam-api';



                var remind_text = '加载中...'

                //统一处理的请求方法 包括loading 错误提示等
                var request = function request(url, method, data, isJson = false) {


                    wx.showLoading({
                        title: remind_text,
                    })

                    var _url = API_BASE_URL + url;
                    if (url.indexOf("http") == 0) {
                        _url = url
                    }


                    if (Config.ProgramEnvVersion !== 'release') {
                        console.log("请求地址", _url)
                        console.log("参数", data)
                    }

                    if (!isJson) {
                        var header = {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : '',
                            'X-hospitalCode': getApp().globalData.currentHospital.hospitalCode || '',
                            'X-tenantId': getApp().globalData.currentHospital.tenantId || '',
                        };
                    } else {
                        var header = {
                            'Content-Type': 'application/json',
                            'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : '',
                            'X-hospitalCode': getApp().globalData.currentHospital.hospitalCode || '',
                            'X-tenantId': getApp().globalData.currentHospital.tenantId || '',
                        };
                    }

                    return new Promise(function (resolve, reject) {
                        wx.request({
                            url: _url,
                            method: method,
                            timeout: 40000,
                            data: data,
                            header: header,
                            success: function success(request) {
                                wx.hideLoading()




                                if (request.statusCode !== 200) {
                                    var message = '请求失败，请重试'
                                    if (request.statusCode === 400 && request.data.message) {
                                        message = request.data.message
                                    }
                                    wx.showToast({
                                        title: message,
                                        icon: "none",
                                        duration: 2000
                                    });
                                    return reject(request.errMsg);

                                }

                                if (Config.ProgramEnvVersion !== 'release') {
                                    console.log(request.data)
                                }

                                if (request.data.code == 0) { //成功
                                    resolve(request.data);
                                } else if (request.data.code == 20005 || request.data.code == 10001) { //token错误


                                    // wx.navigateTo({
                                    //     url: '/pages/login/auth?type=TOKENFAIL'
                                    // })
                                    return reject(request.data);
                                } else if (request.data.code == 20009) { //没有添加就诊卡号

                                    //message里是就userId
                                    wx.navigateTo({
                                        url: '/pages/me/patients/editUser?type=ADD_CARDNO&userId=' + request.data.message
                                    })
                                    return reject(request.data);
                                } else { //其他错误
                                    wx.showToast({
                                        icon: "none",
                                        title: request.data.message || '请求失败',
                                        duration: 2000
                                    })
                                    return reject(request.data);
                                }

                            },
                            fail: function fail(error) {
                                wx.hideLoading()

                                wx.showToast({
                                    icon: "none",
                                    title: '请求失败,请检查网络',
                                    duration: 2000
                                })
                                return reject(error);
                            },
                            complete: function complete(aaa) {

                            }
                        });
                    });
                };
                //没有统一处理的请求类
                var request2 = function request2(url, method, data, isJson = false) {
                    var _url = API_BASE_URL + url;
                    if (url.indexOf("http") == 0) {
                        _url = url
                    }

                    if (Config.ProgramEnvVersion !== 'release') {
                        console.log("请求地址", _url)
                        console.log("参数", data)
                    }

                    if (!isJson) {
                        var header = {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : '',
                            'X-hospitalCode': getApp().globalData.currentHospital.hospitalCode || '',
                            'X-tenantId': getApp().globalData.currentHospital.tenantId || '',
                        };
                    } else {
                        var header = {
                            'Content-Type': 'application/json',
                            'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : '',
                            'X-hospitalCode': getApp().globalData.currentHospital.hospitalCode || '',
                            'X-tenantId': getApp().globalData.currentHospital.tenantId || '',
                        };
                    }

                    return new Promise(function (resolve, reject) {
                        wx.request({
                            url: _url,
                            method: method,
                            timeout: 40000,
                            data: data,
                            header: header,
                            success: function success(request) {

                                if (request.statusCode !== 200) {
                                    wx.showToast({
                                        title: "请求失败，请重试",
                                        icon: "none",
                                        duration: 2000
                                    });
                                    return reject(request.errMsg);

                                }

                                if (Config.ProgramEnvVersion !== 'release') {
                                    console.log(request.data)
                                }

                                if (request.data.code == 20005 || request.data.code == 10001) { //token错误
                                    // wx.navigateTo({
                                    //     url: '/pages/login/auth?type=TOKENFAIL'
                                    // })
                                    return reject(request.data);
                                } else if (request.data.code == 20009) { //没有添加就诊卡号

                                    //message里是就userId
                                    wx.navigateTo({
                                        url: '/pages/me/patients/editUser?type=ADD_CARDNO&userId=' + request.data.message
                                    })
                                    return reject(request.data);
                                } else {

                                    return resolve(request.data);
                                }

                            },
                            fail: function fail(error) {

                                return reject(error);
                            }
                        });
                    });
                };
                //图片/文件上传
                var uploadRequest = function uploadRequest(url, filePath, previewType) {
                    var _url = API_BASE_URL + url;
                    if (url.indexOf("http") == 0) {
                        _url = url
                    }
                    console.log(_url)
                    var header = {
                        'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : '',
                        'X-hospitalCode': getApp().globalData.currentHospital.hospitalCode || '',
                        'X-tenantId': getApp().globalData.currentHospital.tenantId || '',
                    };
                    return new Promise(function (resolve, reject) {
                        wx.uploadFile({
                            url: _url,
                            filePath: filePath,
                            name: 'file',
                            header: header,
                            formData: {
                                previewType: previewType //预览图大小 HEAD_IMAGE DEFAULT HOME_BANNER
                            },
                            success(res) {

                                var resData = JSON.parse(res.data)
                                console.log(resData)
                                if (resData.code == 0) {
                                    resolve(resData.data);
                                } else {
                                    reject(request.data);
                                }
                            },
                            fail(e) {
                                reject(e);
                            }
                        })
                    })

                };
                /**
                 * 小程序的promise没有finally方法，自己扩展下
                 */
                // Promise.prototype.finally = function (callback) {
                //   var Promise = this.constructor;
                //   return this.then(
                //     function (value) {
                //       Promise.resolve(callback()).then(
                //         function () {
                //           return value;
                //         }
                //       );
                //     },
                //     function (reason) {
                //       Promise.resolve(callback()).then(
                //         function () {
                //           throw reason;
                //         }
                //       );
                //     }
                //   );
                // }

                module.exports = {
                    /**
                     * 获取BASE_URL
                     */
                    getAPI_BASE_URL: function getAPI_BASE_URL() {
                        console.log("API_BASE_URL", API_BASE_URL)
                        return API_BASE_URL
                    },

                    init2: function init2(a, b) {
                        API_BASE_URL = a;
                        subDomain = b;
                    },
                    init: function init(b) {
                        subDomain = b;
                    },
                    setMerchantId: function setMerchantId(mchid) {
                        merchantId = mchid;
                    },
                    init3: function init3(_ref) {
                        var _ref$apiBaseUrl = _ref.apiBaseUrl,
                            apiBaseUrl = _ref$apiBaseUrl === undefined ? API_BASE_URL : _ref$apiBaseUrl,
                            subD = _ref.subDomain,
                            req = _ref.request;

                        // 某些需求需要定制化 request，需要保证传入自定义 reuqest 与默认 request 参数一致
                        if (req) {
                            request = req;
                        }
                        API_BASE_URL = apiBaseUrl;
                        subDomain = subD;
                    },
                    request: request,
                    //获取openid
                    getOpenId: function getOpenId(data) {

                        return request(ACCOUNT_SERVICE + '/wx/user/getOpenId', 'post', data, true);
                    },
                    //解密手机号
                    decryptPhone: function decryptPhone(data) {

                        return request(ACCOUNT_SERVICE + '/wx/user/phone', 'post', data, true);
                    },
                    //微信登录
                    loginQuery: function loginQuery(data) {
                        var url = ACCOUNT_SERVICE + '/wx/user/login'
                        return request2(url, 'post', data, true);
                    },
                    //获取验证码(未登录)
                    codeQuery: function codeQuery(data) {
                        var url = PUSH_SERVICE + '/sms/getVerificationCode'
                        return request(url, 'post', data, true);
                    },
                    //获取验证码(登录)
                    codeLoginedQuery: function codeLoginedQuery(data) {
                        var url = PUSH_SERVICE + '/sms/getVerificationCode'
                        return request(url, 'post', data, true);
                    },
                    //注册新用户
                    registerQuery: function registerQuery(data) {
                        var url = ACCOUNT_SERVICE + '/accountInfo/createCustomAccount'
                        return request(url, 'post', data, true);
                    },
                    //账号密码登录
                    accountLoginQuery: function accountLoginQuery(data) {
                        var url = ACCOUNT_SERVICE + '/login'
                        return request(url, 'post', data, true);
                    },
                    //重置密码
                    resetPsdQuery: function resetPsdQuery(data) {
                        var url = ACCOUNT_SERVICE + '/accountInfo/getBackPassword'
                        return request(url, 'post', data, true);
                    },
                    //新增就诊人
                    addPatientQuery: function addPatientQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/healthAddPatientUserInfo'
                        return request2(url, 'post', data, true);
                    },
                    //修改就诊人
                    editPatientQuery: function editPatientQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/updatePatientUserInfo'
                        return request(url, 'post', data, true);
                    },
                    //删除就诊人
                    deletePatientQuery: function deletePatientQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/deletePatientUserInfo'
                        return request(url, 'post', data, true);
                    },
                    //就诊人列表
                    patientListQuery: function patientListQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/healthBatchQueryUserInfo'
                        return request(url, 'get', data, true);
                    },
                    //就诊人详情
                    patientDetailQuery: function patientDetailQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/queryUserInfo'
                        return request(url, 'get', data, true);
                    },
                    //用户详情
                    queryUserInfo: function queryUserInfo(userId) {

                        var url = ACCOUNT_SERVICE + '/userInfo/queryUserInfo?userId=' + userId
                        return request(url, 'get', null);
                    },

                    //小程序端-医疗学科树形列表
                    treeMedicalSubjects: function treeMedicalSubjects(data) {
                        var url = UAM_SERVICE + '/tdMedicalSubject/treeMedicalSubjects'
                        return request(url, 'get', data, true);
                    },
                    //新版-创建健康商城订单
                    createStewardOrder: function createStewardOrder(data) {
                        var url = ORDER_SERVICE + '/order/tbOrder/createStewardOrder'
                        return request(url, 'post', data, true);
                    },
                    //新版-支付下单操作
                    registerPayOrder: function registerPayOrder(data) {
                        var url = ORDER_SERVICE + '/order/tbOrder/registerPayOrder'
                        return request(url, 'post', data, true);
                    },
                    //新版-健康商城支付商品信息
                    paymentCommodity: function paymentCommodity(data) {
                        var url = ORDER_SERVICE + '/order/tbOrder/paymentCommodity'
                        return request(url, 'get', data, true);
                    },
                    //小程序端-名医咨询医生列表
                    accurateDoctors: function accurateDoctors(data) {
                        var url = MEDICAL_SERVICE + '/commodity/accurateDoctors'
                        return request(url, 'post', data, true);
                    },
                    //小程序端-商品分类列表
                    classifies: function classifies(data) {
                        var url = MEDICAL_SERVICE + '/commodity/classifies'
                        return request(url, 'get', data, true);
                    },
                    //小程序端-按分类商品列表
                    classifyCommodities: function classifyCommodities(data) {
                        var url = MEDICAL_SERVICE + '/commodity/classifyCommodities'
                        return request(url, 'get', data, true);
                    },
                    //小程序端-套餐可选医务人员列表
                    commodityOptionalDoctors: function commodityOptionalDoctors(data) {
                        var url = MEDICAL_SERVICE + '/commodity/commodityOptionalDoctors'
                        return request(url, 'post', data, true);
                    },
                    //小程序端-商品详情
                    goodsDetail: function goodsDetail(data) {
                        var url = MEDICAL_SERVICE + '/commodity/detail'
                        return request(url, 'get', data, true);
                    },
                    //小程序端-名医咨询医生详情(医生详情 + 商品列表)
                    doctorCommodities: function doctorCommodities(data) {
                        var url = MEDICAL_SERVICE + '/commodity/doctorCommodities'
                        return request(url, 'get', data, true);
                    },
                    //小程序端-订单列表
                    getMyOrders: function getMyOrders(data) {
                        var url = MEDICAL_SERVICE + '/userorder/list'
                        return request(url, 'POST', data, true);
                    },
                    //小程序端-订单详情
                    getOrderDetail: function getOrderDetail(data) {
                        var url = MEDICAL_SERVICE + '/userorder/detail'
                        return request(url, 'get', data, true);
                    },
                    //小程序端-取消（未付款）订单
                    cancelOrder: function cancelOrder(data) {
                        var url = MEDICAL_SERVICE + '/userorder/cancel'
                        return request(url, 'POST', data, true);
                    },
                    //职称类型[正主任医生,副主任医生,...]
                    professionalTitles: function professionalTitles(data) {
                        var url = ACCOUNT_SERVICE + '/accountDict/professionalTitles'
                        return request(url, 'get', data, true);
                    },

                    //健康档案用户基本信息
                    healthRecordUserInfo: function healthRecordUserInfo(userId) {

                        var url = ACCOUNT_SERVICE + '/userInfo/getBaseInfo?userId=' + userId
                        return request(url, 'get', null);
                    },
                    //健康档案更新用户信息
                    updateHealthUserInfoQuery: function updateHealthUserInfoQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/updatePatientExternalInfo'
                        return request(url, 'post', data, true);
                    },
                    //健康档案就医记录
                    cureHistoryListQuery: function cureHistoryListQuery(data) {
                        var url = HEALTH_SERVICE + '/health/patient/getHospitalRecordList'
                        return request(url, 'get', data, true);
                    },
                    //健康档案健康记录
                    healthHistoryListQuery: function healthHistoryListQuery(data) {
                        var url = HEALTH_SERVICE + '/health/patient/getHealthRecordList'
                        return request(url, 'get', data, true);
                    },
                    //科室列表
                    queryDepartment: function queryDepartment(hospitalCode) {
                        return request(HEALTH_SERVICE + '/health/patient/queryDepartment?hospitalCode=' + hospitalCode, 'get', {});
                    },
                    //服务列表
                    queryGoodsList: function queryGoodsList(departmentId, goodsClass) {
                        return request(HEALTH_SERVICE + '/health/patient/queryGoodsList?departmentId=' + departmentId + "&goodsClass=" + goodsClass, 'get', {});
                    },
                    //服务列表 
                    qryServiceGoodsList: function qryServiceGoodsList(data) {
                        return request(HEALTH_SERVICE + '/patient/qryServiceGoodsList', 'post', data, true);
                    },
                    //查询商品分类带附加信息 
                    qryGoodsClassPlus: function qryGoodsClassPlus(data) {
                        return request(HEALTH_SERVICE + '/sys/qryGoodsClassPlus', 'post', data, true);
                    },
                    //提醒通知 
                    sysRemind: function sysRemind(data) {
                        return request(HEALTH_SERVICE + '/sys/sysRemind', 'post', data, true);
                    },
                    //查询问答列表 
                    qrySysKnowledge: function qrySysKnowledge(data) {
                        return request(HEALTH_SERVICE + '/sys/qrySysKnowledge', 'post', data, true);
                    },
                    //查询问答 
                    qrySysKnowledgeAnswer: function qrySysKnowledgeAnswer(data) {
                        return request2(HEALTH_SERVICE + '/sys/qrySysKnowledgeAnswer', 'post', data, true);
                    },
                    //查询问题详情
                    getSysKnowledgeById: function getSysKnowledgeById(id) {
                        return request2(HEALTH_SERVICE + '/sys/getSysKnowledgeById?id=' + id, 'get', {});
                    },
                    //预约床位时服务列表 
                    qryServiceGoodsListNoPage: function qryServiceGoodsListNoPage(data) {
                        return request(HEALTH_SERVICE + '/patient/qryServiceGoodsListNoPage', 'post', data, true);
                    },
                    //服务详情
                    queryGoods: function queryGoods(id) {
                        return request(HEALTH_SERVICE + '/health/patient/queryGoods?goodsId=' + id, 'get', {});
                    },
                    //服务详情
                    qryPlanTemplateDetail: function qryPlanTemplateDetail(data) {
                        return request(MANAGER_SERVICE + '/patient/qryPlanTemplateDetail', 'post', data, true);
                    },
                    //新闻列表
                    newestArticleWithNum: function newestArticleWithNum(articleNum) {
                        return request(HEALTH_SERVICE + '/health/patient/newestArticleWithNum?articleNum=' + articleNum, 'get', {});
                    },
                    //文章列表
                    articleListQuery: function articleListQuery(data) {
                        var url = HEALTH_SERVICE + '/health/patient/allArticlesPage'
                        return request2(url, 'get', data, true);
                    },
                    //根据id查询文章
                    articleById: function articleById(id, recordId) {
                        return request(HEALTH_SERVICE + '/health/patient/articleById?id=' + id + '&recordId=' + recordId, 'get', {});
                    },
                    //更新文章点击次数
                    addArticleClickNum: function addArticleClickNum(id) {
                        return request(HEALTH_SERVICE + '/patient/addArticleClickNum?articleId=' + id, 'get', {});
                    },
                    //根据标题查询文章
                    articleByTitle: function articleByTitle(data) {
                        var url = HEALTH_SERVICE + '/health/patient/articleByTitle'
                        return request2(url, 'get', data, true);
                    },
                    //查询点击次数最多的几条文章
                    getArticleByClickNum: function getArticleByClickNum(data) {
                        var url = HEALTH_SERVICE + '/patient/getArticleByClickNum'
                        return request2(url, 'get', data, true);
                    },
                    //查询服务规格
                    queryGoodsSpecifications: function queryGoodsSpecifications(goodsType) {
                        return request(HEALTH_SERVICE + '/health/patient/queryGoodsSpecifications?goodsType=' + goodsType, 'get', {});
                    },
                    //获取在线个案管理师
                    getOnlinCasemanagerList: function getOnlinCasemanagerList() {
                        return request2(ACCOUNT_SERVICE + '/userInfo/getOnlinCasemanagerList', 'get', {});
                    },
                    //健康管理首页获取健康管理列表
                    //查计划：goodsType 传 plan_package  查服务：goodsType 传 service_package
                    queryHealthPlanList: function queryHealthPlanList(userId) {
                        return request2(HEALTH_SERVICE + '/health/patient/queryHealthPlanList?userId=' + userId, 'get', {});
                    },
                    //获取患者未完成的健康任务数量
                    getUnfinishedTaskNum: function getUnfinishedTaskNum(userId) {
                        return request2(HEALTH_SERVICE + '/health/patient/getUnfinishedTaskNum?userId=' + userId, 'get', {});
                    },
                    //获取我的消息/用药提醒/健康任务数量
                    getNoticeNumber: function getNoticeNumber(noticeType, userId) {
                        return request2(HEALTH_SERVICE + '/health/patient/getNoticeNumber?userId=' + userId + '&noticeType=' + noticeType, 'get', {});
                    },
                    //获取患者未完成的健康任务列表（健康任务提醒列表）
                    getUnfinishedTaskList: function getUnfinishedTaskList(userId) {
                        return request2(HEALTH_SERVICE + '/health/patient/getUnfinishedTaskList?userId=' + userId, 'get', {});
                    },
                    //健康任务详情
                    queryHealthPlanContent: function queryHealthPlanContent(contentId, planType, userId) {
                        return request(HEALTH_SERVICE + '/health/patient/queryHealthPlanContent?contentId=' + contentId + '&planType=' + planType + '&userId=' + userId, 'get', {});
                    },

                    //获取评估消息
                    getUserEevaluate: function getUserEevaluate(contentId) {
                        return request(HEALTH_SERVICE + '/health/doctor/getUserEevaluate?id=' + contentId, 'get', {});
                    },

                    //健康计划详情
                    queryHealthPlan: function queryHealthPlan(planId) {
                        return request(HEALTH_SERVICE + '/health/patient/queryHealthPlan?planId=' + planId, 'get', {});
                    },
                    //健康任务详情
                    queryHealthPlanTask: function queryHealthPlanTask(planId, taskid, userid) {
                        return request(HEALTH_SERVICE + '/health/patient/queryHealthPlan?planId=' + planId + '&taskId=' + taskid + '&userId=' + userid, 'get', {});
                    },
                    //健康计划详情 按时间
                    queryHealthPlanTaskList: function queryHealthPlanTaskList(planId) {
                        return request(HEALTH_SERVICE + '/patient/queryHealthPlanTaskList?planId=' + planId, 'get', {});
                    },
                    //用药提醒
                    medicationReminderCheck: function medicationReminderCheck(contentId, durationTime, userId) {
                        return request(HEALTH_SERVICE + '/health/patient/medicationReminderCheck?contentId=' + contentId + '&durationTime=' + durationTime + '&userId=' + userId, 'get', {});
                    },
                    //患者更新未完成的健康任务
                    updateUnfinishedTaskStatus: function updateUnfinishedTaskStatus(contentId) {
                        return request(HEALTH_SERVICE + '/health/patient/updateUnfinishedTaskStatus?contentId=' + contentId, 'put', {});
                    },
                    //关闭用药提醒
                    turnOffMedicationAlerts: function turnOffMedicationAlerts(contentId, userId) {
                        return request(HEALTH_SERVICE + '/health/patient/turnOffMedicationAlerts?contentId=' + contentId + '&userId=' + userId, 'put', {});
                    },
                    //开启用药提醒
                    turnOnMedicationAlerts: function turnOnMedicationAlerts(contentId, userId) {
                        return request(HEALTH_SERVICE + '/health/patient/turnOnMedicationAlerts?contentId=' + contentId + '&userId=' + userId, 'put', {});
                    },

                    //我的未读消息列表
                    queryMessageList: function queryMessageList(userId) {
                        return request(HEALTH_SERVICE + '/health/patient/queryMessageList?userId=' + userId, 'get', {});
                    },
                    //我的消息查看
                    queryMessageDetail: function queryMessageDetail(noticeId, userId) {
                        return request(HEALTH_SERVICE + '/health/patient/queryMessageDetail?noticeId=' + noticeId + '&userId=' + userId, 'get', {});
                    },
                    //获取用药提醒列表
                    getMedicationRemindList: function getMedicationRemindList(userId) {
                        return request(HEALTH_SERVICE + '/health/patient/getMedicationRemindList?userId=' + userId, 'get', {});
                    },

                    //患者院外就诊资料上传
                    outHospitalVisitsDataUpload: function outHospitalVisitsDataUpload(data) {
                        return request(HEALTH_SERVICE + '/health/patient/outHospitalVisitsDataUpload', 'post', data, true);
                    },
                    //icu重症就诊资料上传
                    outVisitsDataUpload: function outVisitsDataUpload(data) {
                        return request(HEALTH_SERVICE + '/health/patient/outVisitsDataUpload', 'post', data, true);
                    },
                    //检验提交
                    submitExam: function submitExam(data) {
                        return request(HEALTH_SERVICE + '/health/patient/submitExam', 'post', data, true);
                    },
                    //检查提交
                    submitCheck: function submitCheck(data) {
                        return request(HEALTH_SERVICE + '/health/patient/submitCheck', 'post', data, true);
                    },
                    //服务下订单
                    mealCreateOrder: function mealCreateOrder(data) {
                        return request(ORDER_SERVICE + '/order/tbOrder/mealCreateOrder', 'post', data, true);
                    },
                    //支付回调
                    manualNotify: function manualNotify(orderId) {
                        return request(ORDER_SERVICE + '/order/tbOrder/manualNotify', 'post', { orderId: orderId }, false);
                    },
                    //支付
                    smallWxPay: function smallWxPay(data) {

                        return request(ORDER_SERVICE + '/order/tbOrder/smallWxPay', 'post', data, true);
                    },
                    //订单列表   functionType 0 服务 1云门诊
                    getOrderList: function getOrderList(status, userId, functionType) {
                        return request(ORDER_SERVICE + '/order/tbOrder/getOrderList?pageNo=1&pageSize=10000&status=' + status + '&userId=' + userId + '&functionType=' + functionType, 'get', null);
                    },
                    //权益列表
                    queryMyRights: function queryMyRights(userId, id, deptCode, attrName) {
                        return request2(HEALTH_SERVICE + '/patient/queryMyRights?userId=' + userId + '&id=' + id + '&deptCode=' + deptCode + '&attrName=' + attrName, 'get', null);
                    },
                    //权益使用记录
                    queryRightsUserRecord: function queryRightsUserRecord(userId, id, tradeId = '') {
                        return request(HEALTH_SERVICE + '/patient/queryRightsUserRecord?userId=' + userId + '&rightsId=' + id + '&pageNo=' + 1 + '&pageSize=10000' + '&tradeId=' + tradeId, 'get', null);
                    },
                    //权益使用中记录
                    queryRightsUsingRecord: function queryRightsUsingRecord(userId) {
                        return request2(HEALTH_SERVICE + '/patient/queryRightsUsingRecord?userId=' + userId, 'get', null);
                    },
                    //订单详情 functionType 0 服务 1云门诊
                    getOrderById: function getOrderById(id, functionType) {
                        return request(ORDER_SERVICE + '/order/tbOrder/getOrderByIdAndType?id=' + id + '&functionType=' + functionType, 'get', null);
                    },
                    //修改订单状态
                    updateOrderStatusById: function updateOrderStatusById(orderId, status) {
                        return request(ORDER_SERVICE + '/order/tbOrder/updateOrderStatusById', 'get', { orderId: orderId, status: status });
                    },

                    //文件上传
                    uploadOtherFile: function uploadOtherFile(filePath) {
                        return uploadRequest(CONTENT_SERVICE + '/fileUpload/uploadOtherFile', filePath, null)
                    },
                    //图片上传
                    uploadImgFile: function uploadImgFile(filePath, previewType) {
                        return uploadRequest(CONTENT_SERVICE + '/fileUpload/uploadImgFile', filePath, previewType)
                    },
                    //科室医生列表
                    appointmentDoctorList: function appointmentDoctorList(appointmentTime, hospitalCode, departmentCode) {
                        return request(HEALTH_SERVICE + '/health/patient/getDepartmentTheDoctorListByKsMc?appointmentTime=' + appointmentTime + '&yljgdm=' + hospitalCode + '&yyksdm=' + departmentCode, 'get', {});
                    },
                    //科室医生详情
                    doctorDetailQuery: function doctorDetailQuery(appointmentTime, hospitalCode, departmentCode, doctorId) {
                        return request(HEALTH_SERVICE + '/health/patient/getDoctorAndScheduleDetail?appointmentTime=' + appointmentTime + '&yljgdm=' + hospitalCode + '&departmentCode=' + departmentCode + '&doctorId=' + doctorId, 'get', {});
                    },
                    //创建预约记录
                    creatOrderQuery: function creatOrderQuery(data) {
                        var url = ORDER_SERVICE + '/order/tbOrder/createAppointmentOrder'
                        return request(url, 'post', data, true);
                    },

                    //查询是否存在就诊卡
                    searhCardQuery: function searhCardQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/queryHospitalCardIfExsit'
                        return request(url, 'post', data, true);
                    },
                    //创建就诊卡
                    createCardQuery: function createCardQuery(data) {
                        var url = ACCOUNT_SERVICE + '/userInfo/createHospitalCard'
                        return request(url, 'post', data, true);
                    },


                    //就诊卡列表
                    medicalCardList: function medicalCardList(userId) {
                        return request(ACCOUNT_SERVICE + '/userInfo/queryHospitalCardList?userId=' + userId, 'get', {});
                    },
                    //7日号源
                    sourceListOfDepartmentNumbers: function sourceListOfDepartmentNumbers(yljgdm, yyksdm) {
                        return request(HEALTH_SERVICE + '/health/patient/sourceListOfDepartmentNumbers?yljgdm=' + yljgdm + '&yyksdm=' + yyksdm, 'get', {});
                    },
                    //首页轮播图
                    queryBannerList: function queryBannerList() {
                        return request(HEALTH_SERVICE + '/health/patient/queryBannerList', 'get', {});
                    },
                    //词条
                    returnEntryList: function returnEntryList(searchKeyword, yljgdm) {
                        return request(HEALTH_SERVICE + '/health/patient/returnEntryList?searchKeyword=' + searchKeyword + '&yljgdm=' + yljgdm, 'get', {});
                    },
                    //根据就诊人ID，商品ID查询服务ID
                    queryPlanId: function queryPlanId(goodsId, userId) {
                        return request(HEALTH_SERVICE + '/health/patient/queryPlanId?goodsId=' + goodsId + '&userId=' + userId, 'get', {});
                    },
                    //获取健康评估详情
                    getUserEevaluate: function getUserEevaluate(id) {
                        return request(HEALTH_SERVICE + '/health/doctor/getUserEevaluate?id=' + id, 'get', {});
                    },
                    //获取健康消息详情
                    getUserRemind: function getUserRemind(id) {
                        return request(HEALTH_SERVICE + '/health/doctor/getUserRemind?id=' + id, 'get', {});
                    },
                    //搜索
                    resourceSearch: function resourceSearch(retrieveContent, yljgdm) {
                        return request(HEALTH_SERVICE + '/health/patient/resourceSearch?retrieveContent=' + retrieveContent + '&yljgdm=' + yljgdm, 'get', {});
                    },
                    //科室月度排班
                    getDepartmentSchedulingList: function getDepartmentSchedulingList(yyksdm, yljgdm) {
                        return request(HEALTH_SERVICE + '/health/patient/getDepartmentSchedulingList?yyksdm=' + yyksdm + '&yljgdm=' + yljgdm, 'get', {});
                    },
                    //预约详情
                    subscribeDetailQuery: function subscribeDetailQuery(orderId) {
                        return request(HEALTH_SERVICE + '/health/patient/getMedicalRecordPageInfo?orderId=' + orderId, 'get', {});
                    },
                    //更新就诊状态
                    changeSubscribeStatuedQuery: function changeSubscribeStatuedQuery(data) {
                        var url = HEALTH_SERVICE + '/medical/doctor/updateAttendanceStatus'
                        return request(url, 'post', data, true);
                    },
                    //根据ID查询医生信息
                    doctorInfoQuery: function doctorInfoQuery(data) {
                        var url = INFO_SERVICE + '/doctorFilter/queryDoctorByUserIds'
                        return request(url, 'post', data, true);
                    },
                    //查询医生信息或者个案管理师
                    queryDoctorAndCaseManagerByUserIds: function queryDoctorAndCaseManagerByUserIds(data) {
                        var url = INFO_SERVICE + '/doctorFilter/queryDoctorAndCaseManagerByUserIds'
                        return request(url, 'post', data, true);
                    },


                    //就医记录门诊详情
                    getHospitalRecordMzDetail: function getHospitalRecordMzDetail(hospitalCode, serialNumber) {

                        return request(HEALTH_SERVICE + '/health/patient/getHospitalRecordMzDetail?hospitalCode=' + hospitalCode + '&serialNumber=' + serialNumber, 'get', {});
                    },
                    //就医记录住院详情
                    getHospitalRecordZyDetail: function getHospitalRecordZyDetail(hospitalCode, serialNumber) {
                        return request(HEALTH_SERVICE + '/health/patient/getHospitalRecordZyDetail?hospitalCode=' + hospitalCode + '&serialNumber=' + serialNumber, 'get', {});
                    },
                    //首页获取我的待办
                    getUserTask: function getUserTask(userId) {
                        return request(HEALTH_SERVICE + '/health/patient/getUserTask?userId=' + userId, 'get', {});
                    },
                    //获取专病
                    getDiseaseList: function getDiseaseList(departmentId) {
                        return request(INFO_SERVICE + '/disease/getDiseaseList?departmentId=' + departmentId, 'get', {});
                    },
                    //科室详情接口
                    getDepartmentDetail: function getDepartmentDetail(departmentId) {
                        return request(INFO_SERVICE + '/departments/getDepartmentDetail?departmentId=' + departmentId, 'get', {});
                    },
                    //病区详情接口
                    getInpatientAreaDetail: function getInpatientAreaDetail(id) {
                        return request(INFO_SERVICE + '/wards/getInpatientAreaDetail?id=' + id, 'get', {});
                    },
                    //是否签约医生
                    isContractDoctor: function isContractDoctor(userId) {
                        return request(HEALTH_SERVICE + '/health/patient/isContractDoctor?userId=' + userId, 'get', {});
                    },
                    //根据科室id获取个案管理师user_id
                    getCustUserIdByDeptId: function getCustUserIdByDeptId(deptId) {
                        return request(ACCOUNT_SERVICE + '/userInfo/getCustUserIdByDeptId?deptId=' + deptId, 'get', {});
                    },
                    //根据科室id获取个案管理师user_id 绑定之后的 唯一
                    getCaseManagerByDeptIdAndUserId: function getCaseManagerByDeptIdAndUserId(deptId, userId) {
                        return request(ACCOUNT_SERVICE + '/userInfo/getCaseManagerByDeptIdAndUserId?deptId=' + deptId + '&userId=' + userId, 'get', {});
                    },
                    //签约医生
                    contractDoctor: function contractDoctor(data) {
                        return request(HEALTH_SERVICE + '/health/patient/contractDoctor', 'post', data, true);
                    },
                    //删除日常记录
                    delDailyRecord: function delDailyRecord(data) {
                        return request(HEALTH_SERVICE + '/health/patient/delDailyRecord', 'post', data, true);
                    },
                    //更新健康档案
                    updatePatientBaseInfo: function updatePatientBaseInfo(data) {
                        return request(EDIT_SERVICE + '/edit/updatePatientBaseInfo', 'post', data, true);
                    },
                    //查询病人基本信息
                    qryPatientBaseInfo: function qryPatientBaseInfo(data) {
                        return request2(HEALTH_SERVICE + '/patient/qryPatientBaseInfo', 'post', data, true);
                    },
                    //获取健康记录列表
                    qryUserLocalVisit: function qryUserLocalVisit(data) {
                        return request(HEALTH_SERVICE + '/health/doctor/qryUserLocalVisit', 'post', data, true);
                    },
                    //新增权益使用记录
                    saveRightsUseRecord: function saveRightsUseRecord(data) {
                        return request(HEALTH_SERVICE + '/patient/saveRightsUseRecord', 'post', data, true);
                    },
                    //住院证
                    getHospitalTreatCard: function getHospitalTreatCard(idNumber, userId, userName) {
                        return request(HEALTH_SERVICE + '/appoint/getHospitalTreatCard?idNumber=' + idNumber + '&userId=' + userId + '&userName=' + userName, 'get', {}, false);
                    },
                    //预约协议
                    getAgreementContent: function getAgreementContent(categoryId) {
                        return request(HEALTH_SERVICE + '/appoint/getAgreementContent?categoryId=' + categoryId, 'get', {}, false);
                    },
                    //床位预约
                    saveTradeAppoint: function saveTradeAppoint(data) {
                        return request(HEALTH_SERVICE + '/appoint/saveTradeAppoint', 'post', data, true);
                    },
                    //预约工单查询
                    qryTradeAppointList: function qryTradeAppointList(data) {
                        return request(HEALTH_SERVICE + '/appoint/qryTradeAppointList', 'post', data, true);
                    },
                    //取消预约
                    cancelTradeAppoint: function cancelTradeAppoint(data) {
                        return request(HEALTH_SERVICE + '/appoint/cancelTradeAppoint', 'post', data, true);
                    },
                    //补充资料
                    saveTradeAppointLog: function saveTradeAppointLog(data) {
                        return request(HEALTH_SERVICE + '/appoint/saveTradeAppointLog', 'post', data, true);
                    },
                    //添加病人就诊记录
                    addPatientMedicalRecords: function addPatientMedicalRecords(data) {
                        return request(HEALTH_SERVICE + '/patient/addPatientMedicalRecords', 'post', data, true);
                    },
                    //AI智能问诊
                    getIntelligenceQuestion: function getIntelligenceQuestion(data) {
                        return request2(HEALTH_SERVICE + '/consulation/getIntelligenceQuestion', 'post', data, true);
                    },
                    //历史热门症状
                    getHotSymptom: function getHotSymptom(data) {
                        return request(HEALTH_SERVICE + '/consulation/getHotSymptom', 'post', data, true);
                    },
                    //输入症状描述
                    submitHotSymptom: function submitHotSymptom(data) {
                        return request2(HEALTH_SERVICE + '/consulation/submitHotSymptom', 'post', data, true);
                    },
                    //获取疾病知识内容
                    getDiseaseKnowledge: function getDiseaseKnowledge(data) {
                        return request(HEALTH_SERVICE + '/consulation/getDiseaseKnowledge', 'get', data);
                    },
                    //获取疾病详细
                    getDiseaseKnowledgeDetail: function getDiseaseKnowledgeDetail(data) {
                        return request(HEALTH_SERVICE + '/consulation/getDiseaseKnowledgeDetail', 'get', data);
                    },
                    //根据类别查询枚举值
                    qryCodeValue: function qryCodeValue(codeGroup) {
                        return request2(HEALTH_SERVICE + '/medical/common/qryCodeValue?codeGroup=' + codeGroup, 'get', {});
                    },
                    //查询病人健康评估信息
                    qryUserEvaluateList: function qryUserEvaluateList(data) {
                        return request(HEALTH_SERVICE + '/patient/qryUserEvaluateList', 'post', data, true);

                    },
                    //查询审核记录
                    qryRightsUserLog: function qryRightsUserLog(data) {
                        return request(HEALTH_SERVICE + '/patient/qryRightsUserLog', 'get', data);
                    },
                    //患者给医生发送第一条消息
                    sendFirstMsgToDoc: function sendFirstMsgToDoc(data) {
                        return request(HEALTH_SERVICE + '/patient/sendFirstMsgToDoc', 'post', data, true);
                    },
                    //获取检查检验配置表
                    getDictList: function getDictList(data) {
                        return request(HEALTH_SERVICE + '/health/manage/getDictList', 'post', data, true);
                    },
                    //获取病人就诊记录
                    qryPatientMedicalRecords: function qryPatientMedicalRecords(data) {
                        return request('http://36.158.225.181:24702/ehr/v1/list', 'post', data, true);
                    },
                    //获取病历详情
                    getRecord: function getRecord(data) {
                        return request('http://36.158.225.181:24702/ehr/v1/getRecord', 'post', data, true);
                    },
                    //保存审核记录
                    saveRightsUserLog: function saveRightsUserLog(data) {
                        return request(HEALTH_SERVICE + '/patient/saveRightsUserLog', 'post', data, true);
                    },
                    //个案管理师完成申请处理
                    finishMidRequest: function finishMidRequest(data) {
                        return request(HEALTH_SERVICE + '/patient/finishMidRequest', 'post', data, true);
                    },
                    //医生设置预约时间
                    updateRightsRequestTime: function updateRightsRequestTime(data) {
                        return request(HEALTH_SERVICE + '/patient/updateRightsRequestTime', 'post', data, true);
                    },
                    //图文聊天计数
                    recordTradeTextNum: function recordTradeTextNum(data) {
                        return request2(HEALTH_SERVICE + '/patient/recordTradeTextNum', 'post', data, true);
                    },
                    //视频聊天计时
                    recordTradeVideoNum: function recordTradeVideoNum(data) {
                        return request2(HEALTH_SERVICE + '/patient/recordTradeVideoNum', 'post', data, true);
                    },

                    //获取可预约/改约列表
                    getBookExamList: function getBookExamList(data) {
                        return request(HEALTH_SERVICE + '/appoint/getBookExamList', 'post', data, true);
                    },
                    //获取可报到列表
                    getRegisterList: function getRegisterList(data) {
                        return request(HEALTH_SERVICE + '/appoint/getRegisterList', 'post', data, true);
                    },
                    //报到
                    doSelfRegister: function doSelfRegister(data) {
                        return request(HEALTH_SERVICE + '/appoint/doSelfRegister', 'post', data, true);
                    },
                    //获取可预约日期
                    getBookDate: function getBookDate(data) {
                        return request(HEALTH_SERVICE + '/appoint/getBookDate', 'post', data, true);
                    },
                    //查询预约资源
                    getBookResource: function getBookResource(data) {
                        return request(HEALTH_SERVICE + '/appoint/getBookResource', 'post', data, true);
                    },
                    //预约/改约
                    doSelfBook: function doSelfBook(data) {
                        return request(HEALTH_SERVICE + '/appoint/doSelfBook', 'post', data, true);
                    },
                    //确认预约
                    doConfirmBook: function doConfirmBook(data) {
                        return request(HEALTH_SERVICE + '/appoint/doConfirmBook', 'post', data, true);
                    },
                    //取消预约
                    doCancelBook: function doCancelBook(data) {
                        return request(HEALTH_SERVICE + '/appoint/doCancelBook', 'post', data, true);
                    },
                    //获取权益申请互联网挂号支付记录
                    getRegisterTradeByRights: function getRegisterTradeByRights(tradeId, userId) {
                        return request(HEALTH_SERVICE + '/appoint/getRegisterTradeByRights?tradeId=' + tradeId + '&userId=' + userId, 'get', {});
                    },
                    //获取在线客服
                    getServicerAccount: function getServicerAccount() {
                        return request2(ACCOUNT_SERVICE + '/accountInfo/getServicerAccount', 'get', {});
                    },


                    // 购买套餐时资料审核 (风湿科)
                    apply: function apply(data) {
                        return request(HEALTH_SERVICE + '/health/apply/apply', 'post', data, true);
                    },

                    //购买套餐式 查看审核状态 (风湿科)
                    qryApplystatus: function qryApplystatus(data) {
                        return request(HEALTH_SERVICE + '/health/apply/status', 'post', data, true);
                    },



                    //获取风湿问卷结果
                    getDas28AndHqa: function getDas28AndHqa(userId, projectKey) {
                        return request(QUESTION_SERVICE + '/user/project/getDas28AndHqa?userId=' + userId + '&projectKey=' + projectKey, 'get', {});
                    },
                    //获取未来一周的号源情况
                    getScheduleNumberForWeek: function getScheduleNumberForWeek(data) {
                        return request(HEALTH_SERVICE + '/sys/getScheduleNumberForWeek', 'get', data);
                    },
                    //获取某一天的号源情况
                    getScheduleNumberForDay: function getScheduleNumberForDay(data) {
                        return request(HEALTH_SERVICE + '/sys/getScheduleNumberForDay', 'get', data);
                    },
                    //我的咨询
                    qryMyConsulation: function qryMyConsulation(data) {
                        return request(HEALTH_SERVICE + '/appoint/qryMyConsulation', 'post', data, true);
                    },
                    //历史消息 
                    queryHistoryIMRecordPage: function queryHistoryIMRecordPage(data) {
                        return request(IM_SERVICE + '/tencentIM/queryHistoryIMRecordPage', 'get', data, true);
                    },
                    //查询患者资料
                    qryPatientInfo: function qryPatientInfo(data) {
                        return request(HEALTH_SERVICE + '/revisit/qryPatientInfo', 'post', data, true);
                    },
                    //微信扫描注册后添加随访名单
                    addFollowMedicalRecords: function addFollowMedicalRecords(data) {
                        return request(FOLLOW_SERVICE + '/followMetaConfigure/addPatientMedicalRecords', 'post', data, true);
                    },
                    //查询用户待办随访任务
                    qryMyFollowTask: function qryMyFollowTask(data) {
                        return request2(FOLLOW_SERVICE + '/health/qryMyFollowTask', 'post', data, true);
                    },
                    //查询用户随访计划
                    qryMyFollow: function qryMyFollow(data) {
                        return request(FOLLOW_SERVICE + '/health/qryMyFollow', 'post', data, true);
                    },
                    //查询用户随访任务详情
                    qryMyFollowDetail: function qryMyFollowDetail(data) {
                        return request(FOLLOW_SERVICE + '/health/qryMyFollowDetail', 'post', data, true);
                    },
                    //查询用户随访计划
                    qryMyFollowDetailContent: function qryMyFollowDetailContent(data) {
                        return request(FOLLOW_SERVICE + '/health/qryMyFollowDetailContent', 'post', data, true);
                    },
                    //查询用户随访计划 任务内容 
                    followhistoryDetail: function followhistoryDetail(data) {
                        return request(FOLLOW_SERVICE + '/followPlanPhone/historyDetail/' + data, 'post', {}, true);
                    },
                    //机构列表 
                    gethospitalList: function gethospitalList(data) {
                        return request(UAM_SERVICE + '/hospital/medHosOrgs', 'get', data, true);
                    },
                    //切换医疗机构 
                    switchHospital: function switchHospital(data) {
                        return request(ACCOUNT_SERVICE + '/accountInfo/switchHospital', 'post', data, true);
                    },
                    //获取登录信息 
                    getMaLoginInfo: function getMaLoginInfo(data) {
                        return request2(ACCOUNT_SERVICE + '/getMaLoginInfo', 'get', data, true);
                    },
                    //商城首页菜单 
                    getTdShopmallMainpageMenuList: function getTdShopmallMainpageMenuList(data) {
                        return request2(UAM_SERVICE + '/tdShopmallMainpageMenu/getTdShopmallMainpageMenuList', 'post', data, true);
                    },
                    //获取机构详情 
                    gethospitalInfo: function gethospitalInfo(data) {
                        return request(UAM_SERVICE + '/hospital/info', 'get', data, true);
                    },
                    //权益详情
                    getRightsInfo: function getRightsInfo(data) {

                        var url = MEDICAL_SERVICE + '/rightsUse/getRightsInfo'
                        return request(url, 'get', data, true);
                    },
                    //套餐权益详情
                    getServiceRightsInfo: function getServiceRightsInfo(data) {

                        var url = MEDICAL_SERVICE + '/rightsUse/getServiceRightsInfo'
                        return request(url, 'get', data, true);
                    },
                    //获取权益购买时提交的资料
                    getRightsReqData: function getRightsReqData(data) {

                        var url = MEDICAL_SERVICE + '/rightsUse/getRightsReqData'
                        return request(url, 'get', data, true);
                    },
                    //权益使用日志查询
                    qryRightsUseLog: function qryRightsUseLog(data) {

                        var url = MEDICAL_SERVICE + '/rightsUse/qryRightsUseLog'
                        return request(url, 'post', data, true);
                    },
                    //保存权益使用日志
                    saveRightsUseLog: function saveRightsUseLog(data) {

                        var url = MEDICAL_SERVICE + '/rightsUse/saveRightsUseLog'
                        return request(url, 'post', data, true);
                    },
                    //申请权益使用
                    saveRightsUseRecordNew: function saveRightsUseRecordNew(data) {

                        var url = MEDICAL_SERVICE + '/rightsUse/saveRightsUseRecord'
                        return request(url, 'post', data, true);
                    },
                    //小程序端-问诊列表
                    getConsultList: function getConsultList(data) {

                        var url = MEDICAL_SERVICE + '/consult/list'
                        return request(url, 'get', data, true);
                    },
                    //代办-列表
                    getInquiriesAgencyList: function getInquiriesAgencyList(data) {
                        var url = MEDICAL_SERVICE + '/inquiriesAgency/list'
                        return request2(url, 'post', data, true);
                    },
                    //代办-已读
                    setInquiriesAgencyRead: function setInquiriesAgencyRead(id) {
                        var url = MEDICAL_SERVICE + '/inquiriesAgency/read/' + id
                        return request(url, 'post', '', true);
                    },
                    //权益使用记录查询
                    qryRightsUseRecord: function qryRightsUseRecord(data) {
                        var url = MEDICAL_SERVICE + '/rightsUse/qryRightsUseRecord'
                        return request2(url, 'post', data, true);
                    },
                    //随访计划
                    getFollowUserPlanPhoneList: function getFollowUserPlanPhoneList(data) {
                        var url = FOLLOW_SERVICE + '/follow/userplan/getFollowUserPlanPhoneList'
                        return request(url, 'post', data, true);
                    },
                    //历史消息数据
                    qryHistoryByPage: function qryHistoryByPage(data) {
                        var url = MEDICAL_SERVICE + '/rightsUse/qryHistoryByPage'
                        return request2(url, 'post', data, true);
                    },


                    //获取用户扩展信息
                    getUserExternalInfo: function getUserExternalInfo(userId) {
                        var url = ACCOUNT_SERVICE + '/getUserExternalInfo/' + userId
                        return request2(url, 'post', '', true);
                    },


                    //修改用户扩展信息
                    modifyUserExternalInfo: function modifyUserExternalInfo(data) {
                        var url = ACCOUNT_SERVICE + '/modifyUserExternalInfo'
                        return request2(url, 'post', data, true);
                    },


                    //获取用户已配置的标签信息
                    getSavedUserTagsInfo: function getSavedUserTagsInfo(userId) {
                        var url = ACCOUNT_SERVICE + '/getSavedUserTagsInfo/' + userId
                        return request2(url, 'post', '', true);
                    },

                    //获取所有健康分类类型的标签
                    getUserTagsListInfo: function getUserTagsListInfo(userId) {
                        var url = ACCOUNT_SERVICE + '/getUserTagsListInfo/' + userId
                        return request2(url, 'post', '', true);
                    },

                    //根据就诊人查询病历列表
                    medicalCaseList: function medicalCaseList(data) {
                        var url = MEDICAL_SERVICE + '/medicalCase/list'
                        return request(url, 'post', data, true);
                    },
                    //根据就诊人查询病历列表
                    medicalCaseList: function medicalCaseList(data) {
                        var url = MEDICAL_SERVICE + '/medicalCase/list'
                        return request(url, 'get', data, true);
                    },
                    //根据就诊人查询病历详情
                    medicalCaseGet: function medicalCaseGet(data) {
                        var url = MEDICAL_SERVICE + '/medicalCase/get'
                        return request(url, 'get', data, true);
                    },
                    //删除病历
                    medicalCaseDelete: function medicalCaseDelete(data) {
                        var url = MEDICAL_SERVICE + '/medicalCase/delete'
                        return request(url, 'get', data, true);
                    },
                    //保存病历
                    medicalCaseSave: function medicalCaseSave(data) {
                        var url = MEDICAL_SERVICE + '/medicalCase/save'
                        return request(url, 'post', data, true);
                    },

                    //医生排班列表
                    doctorAppointInfos: function doctorAppointInfos(data) {
                        var url = MEDICAL_SERVICE + '/commodity/doctorAppointInfos'
                        return request(url, 'get', data, true);
                    },
                    //获取用户企业微信二维码
                    getCompanyUserInfo: function getCompanyUserInfo(userId) {
                        var url = MEDICAL_SERVICE + '/tdCompanywxUser/getCompanyUserInfo/' + userId
                        return request(url, 'post', '', true);
                    },
                    //我的  订单数量红点点
                    getRightsCount: function getRightsCount() {
                        var url = MEDICAL_SERVICE + '/userorder/getRightsCount' 
                        return request2(url, 'get', '', true);
                    },
                };

                /***/
            })
            /******/
        ]);
