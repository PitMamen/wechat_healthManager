const WXAPI = require('../../static/apifm-wxapi/index')
const Config = require('../../utils/config')
import dayjs from 'dayjs'

Page({
    data: {
        options: {},
        monthDiff: 0,
        format: '',
        current: {},
        rowDates: [],
        list: []
    },
    onLoad: function (options) {
        // 页面创建时执行
        this.setData({
            format: this.getFormat(this.data.monthDiff),
            rowDates: this.getRowDates(this.getDates(this.data.monthDiff))
        })

       
    },
    onShow: function () {
        this.setData({
            defaultPatient:wx.getStorageSync('defaultPatient')
        })
        console.log(this.data.defaultPatient)
        this.initDatas(this.data.monthDiff, true)
        
    },
    goAddPatient(){
        wx.navigateTo({
            url: '/packageSub/pages/me/patients/addPatient',
          })
    },
    onReady: function () {
        // 页面首次渲染完毕时执行
    },
    onHide: function () {
        // 页面从前台变为后台时执行
    },
    onUnload: function () {
        // 页面销毁时执行
    },
    onPullDownRefresh: function () {
        // 触发下拉刷新时执行
    },
    onReachBottom: function () {
        // 页面触底时执行
    },
    onShareAppMessage: function () {
        // 页面被用户分享时执行
    },
    onPageScroll: function () {
        // 页面滚动时执行
    },
    onResize: function () {
        // 页面尺寸变化时执行
    },
    onTabItemTap(item) {
        // tab 点击时执行
        console.log('哈哈哈哈哈哈',item)
        var user=wx.getStorageSync('defaultPatient')
        if(!user || !user.userId){
           this.goAddPatient()
        }
    },

    initDatas(monthDiff = 0, fromShow) {
        const querys = this.getQuerys(monthDiff)
        if(!querys.userId){
            return
        }
        WXAPI.qryMyFollowAll(querys).then(res => {
            const dataMap = res.data || {}
            const dates = this.getDates(monthDiff)
            dates.forEach(item => {
                const dateObj = dataMap[item.format]
                if (dateObj) {
                    const list = []
                    for (let key in dateObj) {
                        list.push({
                            name: key,
                            subList: dateObj[key]
                        })
                    }
                    item.list = list
                }
            })
            let current = null
            if (fromShow && this.data.current.date) {
                current = dates.find(item => {
                    return item.date === this.data.current.date
                })
            }
            if (!current) {
                current = dates.find(item => {
                    return item.current
                })
            }
            if (!current) {
                current = dates.find(item => {
                    return item.date === 1
                })
            }
            this.setData({
                current,
                list: current.list || [],
                rowDates: this.getRowDates(dates),
                format: this.getFormat(monthDiff)
            })
        })
    },
    getDates(monthDiff) {
        const current = dayjs()
        const relate = this.getRelate(monthDiff)
        const monthStart = relate.startOf('month')
        const monthEnd = relate.endOf('month')
        const startCount = monthStart.day()
        const endCount = 6 - monthEnd.day()
        const dates = this.getEmptyDates(startCount)
        for (let i = monthStart.date(); i <= monthEnd.date(); i++) {
            const date = monthStart.add(i - monthStart.date(), 'day')
            dates.push({
                date: date.date(),
                format: date.format('YYYY-MM-DD'),
                after: date.isAfter(current),
                before: date.isBefore(current),
                current: date.format('YYYY-MM-DD') === current.format('YYYY-MM-DD')
            })
        }
        return dates.concat(this.getEmptyDates(endCount))
    },
    getEmptyDates(count) {
        const dates = []
        for (let i = 0; i < count; i++) {
            dates.push({
                empty: true
            })
        }
        return dates
    },
    getRowDates(dates) {
        const rowDates = [[]]
        dates.forEach(item => {
            let row = rowDates[rowDates.length - 1]
            if (row.length === 7) {
                rowDates.push([])
                row = rowDates[rowDates.length - 1]
            }
            row.push(item)
        })
        return rowDates
    },
    getRelate(monthDiff) {
        let relate = null
        const current = dayjs()
        if (monthDiff > 0) {
            relate = current.add(monthDiff, 'month').startOf('month')
        } else if (monthDiff < 0) {
            relate = current.subtract(Math.abs(monthDiff), 'month').startOf('month')
        } else {
            relate = current.clone()
        }
        return relate
    },
    getFormat(monthDiff) {
        const relate = this.getRelate(monthDiff)
        return relate.format('YYYY年 MM月')
    },
    getQuerys(monthDiff) {
        const relate = this.getRelate(monthDiff)
        return {
            userId: wx.getStorageSync('defaultPatient').userId,
            beginDate: relate.startOf('month').format('YYYY-MM-DD'),
            endDate: relate.endOf('month').format('YYYY-MM-DD')
        }
    },
    onPrevTap(event) {
        if (this.data.monthDiff <= -6) {
            return
        }
        this.setData({
            monthDiff: this.data.monthDiff - 1
        })
        this.initDatas(this.data.monthDiff)
    },
    onNextTap(event) {
        if (this.data.monthDiff >= 6) {
            return
        }
        this.setData({
            monthDiff: this.data.monthDiff + 1
        })
        this.initDatas(this.data.monthDiff)
    },
    onDateTap(event) {
        const item = event.currentTarget.dataset.item
        this.setData({
            current: item,
            list: item.list || []
        })
    },
    onFollowTap(event) {
        const item = event.currentTarget.dataset.item
        console.log('ffffffff onFollowTap', JSON.stringify(item))
        if (item.taskType.value === 1) {
            let url = item.jumpValue + '?userId=' + item.userId + '&recordId=' + item.id + '&modifyTaskBizStatus=yes'
            if (item.taskBizStatus.value === 1) {
                url = url.replace("/r/", "/s/")
            }
            wx.navigateTo({
                url: '/pages/home/webpage/index?url=' + encodeURIComponent(url)
            })
        } else if (item.taskType.value === 2) {
            wx.navigateTo({
                url: '/pages/home/news/news-detail?id=' + item.jumpId + '&recordId=' + item.id
            })
        } else if (item.taskType.value === 3) {
            wx.navigateTo({
                url: '/pages/home/health-remind/detail?userId=' + wx.getStorageSync('defaultPatient').userId + '&taskId=' + item.id
            })
            
        } else if (item.taskType.value === 4) {
            console.log('ffffffff onFollowTap jumpValue', item)
            //新增病例查阅逻辑分支处理
            // "taskType": {
            //     "value": 4,
            //     "description": "病历查阅"
            //   },
            wx.navigateTo({
                // url: '/'+item.jumpValue
                url: '/' + item.jumpValue + '?recordId=' + item.id + '&userId=' + item.userId
            })
        } else if (item.taskType.value === 6) {
            console.log('跳转第三方小程序')
            wx.navigateToMiniProgram({
                appId: item.jumpId,
                path: item.jumpValue,
                envVersion: Config.getConstantData().envVersion,
            })
            this.setTaskItemRead(item.id)
        }
    },
    //设置已读
    setTaskItemRead(id) {
        WXAPI.changeFollowTaskReadStatus({recordId:id})

    },
    onStopTap() {
        const _this = this
        wx.showModal({
            title: '温馨提示',
            content: '是否确定终止全部方案？',
            success: function (res) {
                if (res.confirm) {
                    WXAPI.stopFollowUserPlan({
                        userId: wx.getStorageSync('defaultPatient').userId
                    }).then(res => {
                        wx.showToast({
                            title: '终止成功',
                            icon: 'success'
                        })
                        setTimeout(() => {
                            _this.initDatas(_this.data.monthDiff, true)
                        }, 2000)
                    })
                }
            }
        })
    }
})
