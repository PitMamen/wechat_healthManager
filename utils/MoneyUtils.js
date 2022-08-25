/**
 * 加法函数，用来得到精确的加法结果
 * @param {Object} arg1
 * @param {Object} arg2
 */
function accAdd(arg1, arg2) {
  var r1 = deal(arg1);
  var r2 = deal(arg2);
  var m = Math.pow(10, Math.max(r1, r2))
  return(arg1 * m + arg2 * m) / m
}

/**
* 乘法函数，用来得到精确的乘法结果
* @param {Object} arg1
* @param {Object} arg2
*/
function accMul(arg1, arg2) {
  var m = 0;
  m += deal(arg1);
  m += deal(arg2);
  var r1 = Number(arg1.toString().replace(".", ""));
  var r2 = Number(arg2.toString().replace(".", ""));
  return(r1 * r2) / Math.pow(10, m)
}

/**
* 除法函数，用来得到精确的除法结果
* @param {Object} arg1
* @param {Object} arg2
*/
function accDiv(arg1, arg2) {
  var t1 = deal(arg1);
  var t2 = deal(arg2);
  var r1 = Number(arg1.toString().replace(".", ""))
  var r2 = Number(arg2.toString().replace(".", ""))
  return(r1 / r2) * Math.pow(10, t2 - t1);
}
/**
* 求小数点后的数据长度
*/
function deal(arg) {
  var t = 0;
  try {
      t = arg.toString().split(".")[1].length
  } catch(e) {}
  return t;
}
/**
 * 金额处理:保留几位小数，不四舍五入(关于金额数值的处理用这个方法,以防金额计算出错)
 * @param num   金额
 * @param decimal   保留位数
 * @returns {string}
 */
function moneyFormatDecimal  (num, decimal) {
  num = num.toString()
  let index = num.indexOf('.')
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1)
  } else {
    num = num.substring(0)
  }
  return parseFloat(num).toFixed(decimal)
}
module.exports = {
  accAdd,
  accMul,
  accDiv,
  deal,
  moneyFormatDecimal
}