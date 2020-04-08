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

  let data = {
    dealer_id: openId,
    status: 1,
    create_time: db.serverDate(),
    name: event.name || ''
  }
  return await db.collection('category').add({
    data: data
  }).then(res => {
    return {
      code: 0
    }
  }).catch(err => {
    return err
  })
}