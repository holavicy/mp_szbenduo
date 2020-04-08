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

  event.item.dealer_id = openId;
  event.item.status = 1;
  event.item.create_time = db.serverDate();
  event.item.freight_no = '';
  return await db.collection('order_list').add({
    data: event.item
  }).then(res => {
    return res
  }).catch(err => {
    return err
  })
}