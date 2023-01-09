
const APP = getApp()
const WXAPI = require('../../../static/apifm-wxapi/index')
Page({
    data: {
        departmentId: '',
        topFlag: '',
        keyWords: '',
        // packageList: [], //科室服务
        hideHospitalPicker: true,
        hideScreenPicker: true,
        deptName: '全部科室',
        screenName: '全部服务',
        deptArray: [],
        screenData: [
            '推荐服务', '全部服务'
        ],
    },
    onLoad: function (options) {


        console.log(options)
        if (options.ks && options.ks !== undefined) {
            this.setData({//扫描科室服务二维码 返回的参数 科室代码
                departmentId: options.ks
            })
        }
        this.queryDepartment()
    },

    //科室列表
    async queryDepartment() {
        const res = await WXAPI.queryDepartment(getApp().globalData.yljgdm)

        if (res.data) {
            res.data.unshift('全部科室')
            this.setData({
                deptArray: res.data
            })
            if (this.data.departmentId === '') {
                this.getPackageList()
            } else {
                var index = 0

                this.data.deptArray.forEach((item, i) => {
                    if (item.deptCode == this.data.departmentId) {
                        index = i
                        console.log(item.deptCode)
                    }
                })
                console.log(index)
                this.setData({
                    deptName: this.data.deptArray[index].deptName,
                    departmentId: this.data.deptArray[index].deptCode,
                    hideHospitalPicker: true,

                    screenName: this.data.screenData[1],
                    topFlag: '',
                });

                this.getPackageList()
            }

        }
    },

    /**
     * 服务类别列表
     */
    async getPackageList() {
        var postData = {
            "belong": this.data.departmentId,//科室
            "status": 1,//上架
            "topFlag": this.data.topFlag,//是否推荐 1推荐
            "className": this.data.keyWords,//关键字
            "pageNo": 1,
            "pageSize": 10000
        }
        console.log(postData)
        const res = await WXAPI.qryGoodsClassPlus(postData)


        this.setData({
            packageList: res.data.rows,

        })



    },
    onChange(e) {
        this.setData({
            keyWords: e.detail,
        });
    },
    onCancel(e) {
        this.setData({
            keyWords: '',
        });
        this.getPackageList()
    },
    onSearch() {
        console.log('搜索' + this.data.keyWords);
        this.setData({
            screenName: this.data.screenData[1],
            topFlag: '',
        })
        this.getPackageList()
    },
    //选择医院
    onHospitalSeleced() {

        wx.showModal({
            title: '提示',
            content: '确定切换到中医院吗？',
            success(res) {
                if (res.confirm) {
                    wx.showToast({
                        title: '切换成功！',
                    })
                    setTimeout(function () {
                        wx.navigateBack()
                    }, 1000)
                }
            }
        })



    },
    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})