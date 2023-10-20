
const WXAPI = require('../../../static/apifm-wxapi/index')
import bus from '../../../utils/EventBus.js'
Page({
    data: {
        type:'',
        queryText: '',
        currentHospital: {},
        hospitalList: []
    },
    onLoad: function (options) {
        this.setData({
            type:options.type,
            currentHospital: getApp().globalData.currentHospital
        })

        this.gethospitalList()

    },

    //医院列表
    async gethospitalList() {
        const res = await WXAPI.gethospitalList({ queryText: this.data.queryText })
        if (res.code == 0) {
            this.setData({
                hospitalList: res.data
            })
        }
    },


    onChange(e) {
        this.setData({
            queryText: e.detail,
        });
        this.gethospitalList()
    },
    onCancel(e) {
        this.setData({
            queryText: '',
        });
        this.gethospitalList()
    },
    onSearch() {
        console.log('搜索' + this.data.queryText);
        this.gethospitalList()
    },
    onCurrentHospitalClick() {
        wx.navigateBack()
    },
    //选择医院
    onHospitalSeleced(e) {


        var hospital = e.currentTarget.dataset.item
        if (this.checkLoginStatus()) {
            this.switchHospital(hospital)
        } else {
            this.switchHospitalSuccess(hospital)
        }


    },
    //切换医院
    async switchHospital(hospital) {
        const res = await WXAPI.switchHospital({ hospitalCode: hospital.hospitalCode })
        if (res.code == 0) {
            this.switchHospitalSuccess(hospital)
        }
    },
    //切换成功
    switchHospitalSuccess(hospital) {
        var currentHospital = {
            tenantId: hospital.tenantId,
            hospitalCode: hospital.hospitalCode,
            hospitalName: hospital.hospitalName,
            hospitalLevelName: hospital.hospitalLevelName
        }

        getApp().globalData.currentHospital = currentHospital

        //发送事件 切换机构
        bus.emit('switchHospital', hospital.hospitalCode)

        if(this.data.type == 'GOBACK'){
            wx.navigateBack()
        }else {
            wx.switchTab({
                url: '/pages/home/main',
            })
        }



    },

    checkLoginStatus() {
        return getApp().globalData.loginReady
    },
    onShareAppMessage: function () {
        // 页面被用户转发
    },
    onShareTimeline: function () {
        // 页面被用户分享到朋友圈
    },
})