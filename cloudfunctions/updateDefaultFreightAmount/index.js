// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const $ = db.command.aggregate;
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  event.update_time = db.serverDate();
  return await db.collection('address_freight_rule').where({
    is_default: true,
    status:1
  }).update({
    data: event
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}