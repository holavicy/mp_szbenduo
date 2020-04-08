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
  console.log(event)
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;

  let dealerId = event.openId ? event.openId : openId;

  let data = {
    num: _.inc(1),
    update_time: db.serverDate()
  }

  if (event.num && event.num > 0) {
    data.num = event.num
  }

  if (event.incNum && event.incNum > 0) {
    data.num = _.inc(event.incNum)
  }
  return await db.collection('cart').where({
    dealer_id: dealerId,
    goods_id: event.goodsId,
  }).update({
    data: data
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}