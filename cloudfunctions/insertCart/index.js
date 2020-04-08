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


  let data = {
    dealer_id: event.openId,
    goods_id: event.goodsId,
    status: 1,
    num: 1,
    is_selected: true,
    create_time: db.serverDate()
  }

  if (event.num && event.num > 0) {
    data.num = event.num
  }

  if (event.incNum && event.incNum > 0) {
    data.num = event.incNum
  }
  return await db.collection('cart').add({
    data: data
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}