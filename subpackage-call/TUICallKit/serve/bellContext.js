import { PREFIX } from '../TUICallKit';
export class BellContext {
  constructor() {
    this.context = wx.createInnerAudioContext();
    this.context.loop = true;
    this.context.onError((res) => {
      this.handleError(res.errCode);
    });
  }
  setBellSrc(filePath) {
    // const fs = wx.getFileSystemManager();
    // console.log('fs',fs)
    // try {
    //   fs.readFileSync(filePath, 'utf8', 0);
    // } catch (e) {
    //     console.error(e)
    //   console.warn(`${PREFIX}-setCallingBell: 媒体铃声路径错误`, filePath);
      
    // }
    this.context.src = filePath;
  }
  play() {
    this.context.play();
  }
  stop() {
    this.context.stop();
  }
  handleError(code) {
    let errMsg = '';
    switch (code) {
      case 10001:
        errMsg = '系统错误';
        break;
      case 10002:
        errMsg = '网络错误';
        break;
      case 10003:
        errMsg = '文件错误';
        break;
      case 10004:
        errMsg = '格式错误';
        break;
      default:
        errMsg = '未知错误';
        break;
    }
    console.warn(`${PREFIX}-setCallingBell: 媒体铃声${errMsg}`);
  }
  destroyInstance() {
    this.context.destroy();
  }
}
