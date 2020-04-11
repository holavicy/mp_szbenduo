// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;

  try {
    return await db.collection('address_freight_rule').where({
      status:1,
      provinces: _.elemMatch({
        id: _.eq(event.provinceId)
      })
    })
      .get()

  } catch (e) {
    console.log(e)
  }
}
