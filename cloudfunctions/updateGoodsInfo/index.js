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
  event.item.update_time = db.serverDate();

  if (event.incStock){
    event.item.stock = _.inc(event.incStock)
  }

  delete event.item._id;
  return await db.collection('goods').where({
    _id: event.id
  }).update({
    data: event.item
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}