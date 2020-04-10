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

  let id = event._id

  delete event._id;
  delete event.create_time;
  return await db.collection('address_freight_rule').where({
    _id: id
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