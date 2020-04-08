// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const wxContext = cloud.getWXContext();
const openId = wxContext.OPENID;

const db = cloud.database();
const $ = db.command.aggregate;
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('cart').where({
    dealer_id: openId,
    _id: event.cartId,
  }).update({
    data: {
      is_selected: event.isSelected
    }
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}