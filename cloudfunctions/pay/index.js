// 云函数入口文件
const cloud = require('wx-server-sdk')
const {
  ENV,
  MCHID,
  KEY,
  CERT_FILE_CONTENT,
  TIMEOUT
} = require('./config/index')

cloud.init({
  env: ENV
})

const tenpay = require('tenpay');

const config = {
  appid: 'wx28d1270c8ef79b91',
  mchid: MCHID,
  partnerKey: KEY,
  // pfx: require('fs').readFileSync('apiclient_cert.p12'),
  notify_url:'http://www.weixin.qq.com/wxpay/pay.php',
  spbill_create_ip:'127.0.0.1'
}

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID,
    APPID
  } = cloud.getWXContext();

  const api = tenpay.init(config);

  return await api.getPayParams({
    out_trade_no: event.out_trade_no,
    body: event.body,
    total_fee: event.total_fee,
    openid: OPENID
  })
}