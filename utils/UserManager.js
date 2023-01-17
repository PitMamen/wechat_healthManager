
function savePatientInfoList(patientInfoList) {
    var userInfoSto = wx.getStorageSync('userInfo')
    userInfoSto.account.user = patientInfoList
    wx.setStorageSync('userInfo', userInfoSto)
    console.log("保存信息成功：", wx.getStorageSync('userInfo'))

    if (patientInfoList && patientInfoList.length > 0) {
        var defaultPatient = patientInfoList[0]
        patientInfoList.forEach(item => {
            if (item.isDefault) {
                defaultPatient = item
            }
        })
        //保存默认就诊人
        wx.setStorageSync('defaultPatient', defaultPatient)
    }else {
         //删除默认就诊人
         wx.removeStorageSync('defaultPatient')
        
    }

}
function getPatientInfoList() {
  return wx.getStorageSync('userInfo').account.user
  
}

module.exports = {
  savePatientInfoList,
  getPatientInfoList
}
