const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}
const formatTime4 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('')}${[hour, minute, second].map(formatNumber).join('')}`
}
const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()


  return `${[year, month, day].map(formatNumber).join('-')}`
}
const formatTime5 = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
  
  
    return `${[year, month, day].map(formatNumber).join('/')}`
  }
const formatTimeAfter1year = date => {
  const year = date.getFullYear()+1
  const month = date.getMonth() + 1
  const day = date.getDate()


  return `${[year, month, day].map(formatNumber).join('-')}`
}
const formatTime3YearsAge = date => {
  const year = date.getFullYear()-3
  const month = date.getMonth() + 1
  const day = date.getDate()


  return `${[year, month, day].map(formatNumber).join('-')}`
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

//获取字符串字节长度
function getStrLength( str ){
  return str.replace(/[\u0391-\uFFE5]/g,"aa").length; //"g" 表示全局匹配
}
/**  
 * 通过身份证获取出生日期及性别
 * @param idCard 15/18位身份证号码   
 * @return JSON对象 
 *         sex：0-女、1-男；
 *         birthDay：yyyy-MM-dd
 */
function getBirthdayAndSex(idCard) {
  var info = {};
  var birth = (idCard.length === 18) ? idCard.slice(6, 14) : idCard.slice(6, 12);
  // 18位：提取第17位数字；15位：提取最后一位数字
  var order = (idCard.length == 18) ? idCard.slice(-2,-1):idCard.slice(-1);
  info.birthDay = (idCard.length === 18) ? ([birth.slice(0, 4),birth.slice(4, 6), birth.slice(-2)]).join('') : 
  (['19' + birth.slice(0, 2), birth.slice(2, 4),birth.slice(-2)]).join('');
  // 余数为0代表女性，不为0代表男性        
  info.sex = (order % 2 === 0 ? 0 : 1);
  return info;        
}
/**
 * 身份证号格式校验
 */
function idValidator(idCard) {
  var provinces={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",
          21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",
          33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",
          42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",
          51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",
          63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"
         };
  var expression=/(^\d{15}$)|(^\d{17}(\d|X)$)/;
  var isViald=expression.test(idCard);
  if (isViald)
  {
     isViald=provinces[idCard.substr(0,2)]?true:false;
  }
  return isViald;
}


function getPercent(num, total) {
  /// <summary>
  /// 求百分比
  /// </summary>
  /// <param name="num">当前数</param>
  /// <param name="total">总数</param>
  num = parseFloat(num);
  total = parseFloat(total);
  if (isNaN(num) || isNaN(total)) {
      return "-";
  }
  return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00)+"%";
}

//防抖动
let timeout = null
function debounce(fn, wait) {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(fn, wait)
}

module.exports = {
  formatTime,
  formatTime2,
  formatTime4,
  formatTime5,
  formatTime3YearsAge,
  getStrLength,
  getBirthdayAndSex,
  idValidator,
  formatTimeAfter1year,
  getPercent,
  debounce
}
