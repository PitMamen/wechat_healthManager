export function downloadFile({url}) {
    return new Promise((resolve, reject) => {
        var header = {
            'Authorization': wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').jwt : ''
        };
        wx.downloadFile({
            url:url,
            header:header,
            success: resolve,
            fail: reject
        });
    })
}
