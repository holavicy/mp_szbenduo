// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const $ = db.command.aggregate;
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;

  event.dealer_id = openId;
  event.status = 1;
  event.create_time = db.serverDate();
  return await db.collection('address_freight_rule').add({
    data: event
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}